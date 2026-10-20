# BIT242958 Food Manager — Modern UI

## Đã sửa
- Địa chỉ MockAPI: `https://6ad714b5f71f154ac487b791.mockapi.io` (chú ý **791**, khác project ID 792).
- Thiết kế mới cho màn hình danh sách và thẻ món ăn.
- Script thêm 3 danh mục, 5 món mẫu và các URL ảnh mẫu (chạy script khi API đã phản hồi).

## Cài vào project hiện tại
1. Sao lưu `App.js` và thư mục `src` hiện tại.
2. Copy `App.js`, `src/`, `scripts/` từ ZIP vào project Expo hiện có (KHÔNG chép thay `package.json`, `node_modules`, `app.json`).
3. Dừng Expo Ctrl+C. Trong thư mục có `package.json`, chạy `node scripts/seed-mockapi.js`.
4. Chạy `npx.cmd expo start -c`, nhấn `w`.

## Kiểm tra endpoint
Mở `https://6ad714b5f71f154ac487b791.mockapi.io/BIT242958_DishCategory`. Nếu gặp 404, xác minh URL endpoint và tên resource trong trang MockAPI.

**Quan trọng:** Seed chỉ thêm bản ghi nếu thiếu. Nó không ghi đè ảnh của món đã tồn tại; ảnh URL mẫu cần internet để tải. Bản này là cải tiến UI và dữ liệu demo trên source Phase5, chưa xác nhận chạy qua môi trường máy người dùng.
