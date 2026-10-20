# BIT242958 FoodManager – Phase 5 (bổ sung vào Phase 2–4)

## Cài đặt
1. Tạo Expo app: `npx.cmd create-expo-app@latest BIT242958_FoodManager --template blank`
2. Copy `App.js`, `src`, `scripts` vào **root** dự án Expo. Không chép lồng thêm thư mục Phase5.
3. Trong thư mục Expo: `npx.cmd expo install @react-native-async-storage/async-storage @react-native-community/netinfo`
4. `node scripts/seed-mockapi.js` (chỉ chạy sau khi tạo đủ fields MockAPI)
5. `npx.cmd expo start` – chạy trên Expo Go/emulator. Để chạy web cần `npx.cmd expo install react-dom react-native-web @expo/metro-runtime`.

## Chức năng
- Các màn hình từ Phase 2–4: danh sách, chi tiết, thêm/sửa/xóa, xác nhận xóa, ảnh URL, ảnh đại diện.
- Tìm kiếm theo tên, lọc theo danh mục/trạng thái/khoảng giá, sắp xếp.
- Giao diện cơ bản EN/VI; lưu ngôn ngữ đã chọn trong AsyncStorage.
- Offline-first: thay đổi món ăn được lưu cache và hàng đợi trong AsyncStorage; khi có mạng NetInfo kích hoạt đồng bộ tự động. Bảo vệ chống POST trùng bằng cách tra mã món (MSSV_Id) trên server trước POST.

## Kiến trúc
- `src/services/api.js`: GET/POST/PUT/DELETE MockAPI.
- `src/services/sync.js`: cache + queue thao tác offline và replay theo thứ tự.
- `App.js`: quản lý màn hình, dữ liệu, trạng thái mạng, gọi sync.
- `src/screens/DishesScreen.js`: tìm kiếm/lọc/sắp xếp.
- `src/screens/DishFormScreen.js`: validation và ảnh.

## Lưu ý quan trọng
- MockAPI phải giữ các field `BIT242958_*`; resource tên `BIT242958_DishCategory` và `BIT242958_Dish`.
- `DishesScreen` được giữ mounted ngay cả khi ẩn, vì vậy trạng thái bộ lọc được duy trì khi quay lại.
- Khi offline lần đầu, cần có mạng tải danh mục ít nhất một lần để chọn loại món.
- Offline cache không thay thế backup; nếu xóa dữ liệu app sẽ mất các thay đổi chưa sync.
- Bài thi yêu cầu video 1 quay trên máy thật/emulator và video 2 giải thích mã nguồn trước 23/10/2026.
- Nếu backend MockAPI dùng trường DishImage là string: bảo đảm POST lưu được JSON object array, API normalize đã có parser string.
