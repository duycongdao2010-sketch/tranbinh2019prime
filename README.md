# TranBinh2019Prime

## Chạy trên máy tính
1. Cài Node.js 18 trở lên.
2. Giải nén project.
3. Mở terminal tại thư mục project và chạy:
   ```bash
   npm install
   npm start
   ```
4. Mở http://localhost:3000
5. Trang quản trị: http://localhost:3000/admin

## Excel
Tải file Excel ở trang `/admin`. Dùng sheet đầu tiên, hàng đầu là tiêu đề.
Cột bắt buộc: `Tên tài khoản`, `Giá`, `Số lượng`.
Cột tùy chọn: `ID`, `Mô tả`, `Danh mục`, `Nhãn`, `Icon`, `Rank`, `Số tướng`, `Số skin`, `Từ khóa`.
Danh mục hỗ trợ: `starter`, `skin`, `rank`, hoặc để trống.
Mỗi lần tải file, danh sách sản phẩm hiện tại được thay thế hoàn toàn.
Có thể bắt đầu với file mẫu `products-template.csv` (mở bằng Excel rồi Save As .xlsx).

## Chatbot AI
Thiết lập biến môi trường `OPENAI_API_KEY` trên máy chủ. Có thể đặt `OPENAI_MODEL` (mặc định `gpt-4.1-mini`).
Không đưa API key vào HTML hoặc commit lên Git.

## Bảo vệ trang quản trị
Trước khi triển khai công khai, bắt buộc đặt biến môi trường `ADMIN_TOKEN` thành chuỗi bí mật dài và mạnh. Nhập token này trong trang quản trị khi tải Excel/xem đơn.
Ví dụ Linux/macOS:
```bash
export ADMIN_TOKEN="thay-bang-chuoi-bi-mat-dai"
export OPENAI_API_KEY="sk-..."
npm start
```
Windows PowerShell:
```powershell
$env:ADMIN_TOKEN="thay-bang-chuoi-bi-mat-dai"
$env:OPENAI_API_KEY="sk-..."
npm start
```

## Triển khai Internet
Đưa toàn bộ thư mục lên một dịch vụ Node.js hosting có hỗ trợ persistent disk/volume. Đặt `PORT` (hosting thường tự cấp), `ADMIN_TOKEN`, `OPENAI_API_KEY`. Vì dữ liệu hiện lưu ở `data/store.json`, phải bật persistent disk hoặc thay bằng database managed trước khi scale nhiều instance. Không deploy bản demo này cho giao dịch tiền thật khi chưa bổ sung xác thực quản trị, phân quyền, chống spam/rate-limit, backup, HTTPS và kiểm thử bảo mật.

## Thanh toán
Đây là thanh toán mô phỏng: khách tạo đơn, tồn kho được giữ lại, sau đó có thể bấm xác nhận mô phỏng trong hộp thoại. Không có giao dịch ngân hàng và không thu tiền thật.
