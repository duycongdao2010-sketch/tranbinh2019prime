const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const demoProducts = [
 {id:'ACC001',name:'Acc Khởi Đầu',description:'Phù hợp người chơi mới hoặc acc phụ.',category:'starter',badge:'GIÁ TỐT',emoji:'🛡️',rank:'Đa vị trí',heroes:30,skins:10,price:99000,stock:2,tags:'giá rẻ'},
 {id:'ACC002',name:'Acc Bộ Sưu Tập',description:'Gợi ý cho người thích sưu tầm trang phục.',category:'skin',badge:'NỔI BẬT',emoji:'✨',rank:'Sưu tầm',heroes:70,skins:50,price:399000,stock:1,tags:'skin'},
 {id:'ACC003',name:'Acc Leo Rank',description:'Dành cho người ưu tiên trải nghiệm xếp hạng.',category:'rank',badge:'RANK CAO',emoji:'🏆',rank:'Cao',heroes:80,skins:35,price:599000,stock:1,tags:'rank cao'}
];
function readDB() {
 if (!fs.existsSync(DB_FILE)) {
  const initial={products:demoProducts,orders:[]};
  fs.writeFileSync(DB_FILE,JSON.stringify(initial,null,2));
  return initial;
 }
 try { return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }
 catch { return {products:demoProducts,orders:[]}; }
}
function writeDB(db) { fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2)); }
function cleanText(v,max=250) { return String(v ?? '').trim().slice(0,max); }
function normHeader(v) { return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]/g,''); }
function parseExcel(buffer) {
 const workbook=XLSX.read(buffer,{type:'buffer'});
 const sheet=workbook.Sheets[workbook.SheetNames[0]];
 const rows=XLSX.utils.sheet_to_json(sheet,{defval:''});
 if(!rows.length) throw new Error('File Excel không có dữ liệu.');
 const mapped=rows.map((row,i)=>{
  const r={}; for(const [k,v] of Object.entries(row)) r[normHeader(k)]=v;
  const get=(...keys)=>{for(const k of keys){const v=r[normHeader(k)];if(v!==undefined&&v!=='')return v;}return '';};
  const id=cleanText(get('ID','Ma acc','Ma san pham','Product ID') || `ACC${String(i+1).padStart(3,'0')}`,60);
  const name=cleanText(get('Ten tai khoan','Ten acc','Ten san pham','Name'),120);
  const price=Number(String(get('Gia','Gia ban','Price')).replace(/[^\d.-]/g,''));
  const stock=Number(get('So luong','Ton kho','Stock','Quantity'));
  if(!name || !Number.isFinite(price) || price<0 || !Number.isInteger(stock) || stock<0) throw new Error(`Dòng ${i+2}: cần có Tên tài khoản, Giá và Số lượng hợp lệ.`);
  const categoryRaw=normHeader(get('Danh muc','Category','Loai'));
  const category=['starter','skin','rank'].includes(categoryRaw)?categoryRaw:'all';
  return {id,name,description:cleanText(get('Mo ta','Description'),300)||'Tài khoản Liên Quân Mobile',category,badge:cleanText(get('Nhan','Badge'),30)||'TÀI KHOẢN',emoji:cleanText(get('Icon','Emoji'),8)||'🎮',rank:cleanText(get('Rank','Bac rank'),50),heroes:Number(get('So tuong','Tuong','Heroes'))||0,skins:Number(get('So skin','Trang phuc','Skins'))||0,price,stock,tags:cleanText(get('Tu khoa','Tags'),200)};
 });
 const ids=new Set();for(const p of mapped){if(ids.has(p.id))throw new Error('ID bị trùng: '+p.id);ids.add(p.id);}
 return mapped;
}
app.get('/api/products',(req,res)=>res.json(readDB().products));
app.post('/api/orders',(req,res)=>{
 const {productId,customerName,phone,email,quantity}=req.body||{};
 const qty=Number(quantity);
 if(!productId||!cleanText(customerName,100)||!cleanText(phone,25)||!Number.isInteger(qty)||qty<1) return res.status(400).json({error:'Vui lòng nhập tên, số điện thoại và số lượng hợp lệ.'});
 const db=readDB(),p=db.products.find(x=>x.id===productId);
 if(!p)return res.status(404).json({error:'Không tìm thấy sản phẩm.'});
 if(p.stock<qty)return res.status(409).json({error:`Chỉ còn ${p.stock} sản phẩm.`});
 p.stock-=qty;
 const order={id:'TB'+Date.now().toString(36).toUpperCase()+crypto.randomBytes(2).toString('hex').toUpperCase(),productId:p.id,productName:p.name,unitPrice:p.price,quantity:qty,total:p.price*qty,customerName:cleanText(customerName,100),phone:cleanText(phone,25),email:cleanText(email,150),status:'PENDING_PAYMENT',createdAt:new Date().toISOString()};
 db.orders.push(order);writeDB(db);res.status(201).json({orderId:order.id,total:order.total,status:order.status});
});
app.post('/api/orders/:id/simulate-payment',(req,res)=>{
 const db=readDB(),order=db.orders.find(o=>o.id===req.params.id);
 if(!order)return res.status(404).json({error:'Không tìm thấy đơn hàng.'});
 if(order.status==='PAID_SIMULATED')return res.json({status:order.status});
 order.status='PAID_SIMULATED';order.paidAt=new Date().toISOString();writeDB(db);res.json({status:order.status,message:'Thanh toán mô phỏng thành công.'});
});
app.post('/api/admin/import-excel',upload.single('file'),(req,res)=>{
 // Demo admin endpoint. Protect it with ADMIN_TOKEN before public deployment.
 if(process.env.ADMIN_TOKEN && req.get('x-admin-token')!==process.env.ADMIN_TOKEN) return res.status(401).json({error:'Mã quản trị không hợp lệ.'});
 if(!req.file)return res.status(400).json({error:'Chưa chọn file Excel.'});
 try{const products=parseExcel(req.file.buffer);const db=readDB();db.products=products;writeDB(db);res.json({count:products.length,message:`Đã nhập ${products.length} sản phẩm.`});}
 catch(e){res.status(400).json({error:e.message});}
});
app.get('/api/admin/orders',(req,res)=>{
 if(process.env.ADMIN_TOKEN && req.get('x-admin-token')!==process.env.ADMIN_TOKEN)return res.status(401).json({error:'Mã quản trị không hợp lệ.'});
 res.json(readDB().orders.slice().reverse());
});
app.post('/api/chat',async(req,res)=>{
 const message=cleanText(req.body?.message,1500);
 if(!message)return res.status(400).json({error:'Tin nhắn trống.'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Máy chủ chưa cấu hình OPENAI_API_KEY.'});
 try{
  const db=readDB();
  const catalog=db.products.map(p=>`${p.name}: ${p.price.toLocaleString('vi-VN')}đ, tồn ${p.stock}, rank ${p.rank||'chưa rõ'}, ${p.heroes} tướng, ${p.skins} skin`).join('\n');
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',instructions:'Bạn là trợ lý bán hàng của TranBinh2019Prime. Chỉ tư vấn dựa trên danh mục được cung cấp. Không tự bịa giá, tồn kho, chính sách hay thông tin tài khoản. Nếu thiếu dữ liệu, nói rõ cần liên hệ shop. Không yêu cầu khách gửi mật khẩu hoặc OTP. Thanh toán trên website chỉ là mô phỏng, không thu tiền thật.',input:`Danh mục hiện tại:\n${catalog}\n\nKhách hỏi: ${message}`})});
  const data=await response.json();if(!response.ok)throw new Error(data.error?.message||'AI API error');
  const reply=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
  res.json({reply:reply||'Mình chưa tạo được câu trả lời. Bạn thử diễn đạt lại.'});
 }catch(e){res.status(502).json({error:'Lỗi kết nối AI: '+e.message});}
});
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.listen(PORT,()=>console.log(`TranBinh2019Prime chạy tại http://localhost:${PORT}`));
