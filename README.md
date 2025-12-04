# PlanForm 2026 - Ứng dụng Lập Kế Hoạch Kinh Doanh

Ứng dụng web để các đơn vị lập kế hoạch kinh doanh năm 2026 với đầy đủ các phân tích SWOT, BSC, kế hoạch hành động và dự báo tài chính.

## 📚 Tài liệu

- **[Hướng dẫn điền form chi tiết](./docs/HUONG_DAN_DIEN_FORM.md)** - Hướng dẫn đầy đủ cách điền từng phần trong form kế hoạch

## 🚀 Bắt đầu

### Yêu cầu
- Node.js 20+
- npm hoặc yarn

### Cài đặt

```bash
npm install
```

### Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## 📋 Các tính năng

1. **Thông tin đơn vị** - Quản lý thông tin cơ bản của đơn vị
2. **Phân tích SWOT** - Phân tích điểm mạnh, điểm yếu, cơ hội, thách thức
3. **Mục tiêu BSC** - Xác định mục tiêu theo 4 góc nhìn BSC
4. **Kế hoạch hành động** - Lập kế hoạch hành động chi tiết
5. **Dự báo tài chính** - Dự báo doanh thu, chi phí, lợi nhuận
6. **Định hướng chuyên môn** - Xác định định hướng và mũi nhọn chuyên môn
7. **Sản phẩm chiến lược** - Liệt kê các sản phẩm/dịch vụ chiến lược
8. **Dịch vụ mới** - Kế hoạch triển khai dịch vụ mới
9. **Tuyển dụng** - Kế hoạch tuyển dụng nhân sự
10. **Hội nghị hội thảo** - Kế hoạch tổ chức sự kiện
11. **Chương trình cộng đồng** - Các sản phẩm/dịch vụ cộng đồng
12. **Kiến nghị và đề xuất** - Đề xuất để đạt mục tiêu doanh thu

## 🗄️ Database

Ứng dụng sử dụng Supabase để lưu trữ dữ liệu. Xem file migration trong thư mục `supabase/`:
- `setup.sql` - Tạo bảng ban đầu
- `add_new_columns.sql` - Thêm các cột mới cho các tính năng 6-10
- `setup_storage.sql` - Thiết lập Storage bucket và policies cho file upload

### Thiết lập Supabase Storage

Để sử dụng tính năng upload file dự báo tài chính:

1. **Tạo bucket trong Supabase Dashboard:**
   - Vào Supabase Dashboard > Storage
   - Click "New bucket"
   - Tên bucket: `financial-forecasts`
   - Public bucket: **BẬT** (để có thể truy cập file qua URL)
   - File size limit: Tùy chọn (khuyến nghị: 10MB)
   - Allowed MIME types: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

2. **Chạy script SQL:**
   - Mở Supabase SQL Editor
   - Chạy file `supabase/setup_storage.sql` để tạo policies

## 📝 License

[Thêm thông tin license nếu có]
