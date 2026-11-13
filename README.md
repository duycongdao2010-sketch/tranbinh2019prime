# TranBinh2019Prime

Website bán tài khoản **Liên Quân Mobile**, hỗ trợ quản lý sản phẩm, đặt hàng và chatbot AI.

## Features

- Hiển thị danh sách sản phẩm.
- Tìm kiếm, lọc và sắp xếp sản phẩm.
- Quản lý giá và số lượng tồn kho bằng file Excel.
- Đặt hàng và tự động cập nhật tồn kho.
- Thanh toán mô phỏng.
- Chatbot AI hỗ trợ khách hàng.
- Trang quản trị dành cho admin.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Data Storage:** JSON
- **Excel Processing:** SheetJS (xlsx)
- **AI:** OpenAI API
- **Hosting:** Render
- **Version Control:** GitHub

## Run Locally

1. Clone repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables.
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`.

## Deployment

1. Push the project to GitHub.
2. Create a new **Web Service** on Render.
3. Connect the GitHub repository.
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the required environment variables.
6. Deploy the service.

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key |
| `ADMIN_TOKEN` | Admin authentication token |

## Notes

- Payment functionality is simulated and does not process real transactions.
- The OpenAI API key must be kept private and configured on the server.
- The current JSON-based storage is suitable for demonstration purposes. Render's local filesystem may be reset after certain restarts or deployments, so persistent storage or a database is recommended for production use.

This project is developed for educational and demonstration purposes.
