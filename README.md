# TranBinh2019Prime

Website bán tài khoản Liên Quân Mobile với giao diện responsive, hệ thống quản lý sản phẩm và đặt hàng.

## Features
- Hiển thị, tìm kiếm và lọc sản phẩm.
- Quản lý tồn kho bằng file Excel.
- Đặt hàng và theo dõi đơn hàng.
- Thanh toán mô phỏng.
- AI chatbot hỗ trợ khách hàng.
- Trang quản trị dành cho admin.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Netlify Functions
- **Database:** Supabase
- **AI:** OpenAI API
- **Hosting:** Netlify

## Deployment
1. Clone repository.
2. Cài đặt dependencies: `npm install`
3. Cấu hình environment variables trên Netlify.
4. Chạy thử local: `npx netlify dev`
5. Deploy thông qua GitHub và Netlify.

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ADMIN_TOKEN`
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)

## Note
This project is for educational and demonstration purposes. Payment functionality is simulated and does not process real transactions.
