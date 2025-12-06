# Hướng dẫn thiết lập Supabase Storage cho File Upload

Tài liệu này hướng dẫn cách thiết lập Supabase Storage để lưu trữ file dự báo tài chính.

## Bước 1: Tạo Bucket trong Supabase Dashboard

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào mục **Storage** ở sidebar bên trái
4. Click nút **"New bucket"**
5. Điền thông tin:
   - **Name**: `financial-forecasts`
   - **Public bucket**: **BẬT** (quan trọng - để có thể truy cập file qua URL công khai)
   - **File size limit**: Tùy chọn (khuyến nghị: 10MB hoặc 10485760 bytes)
   - **Allowed MIME types**: 
     ```
     application/pdf,
     application/msword,
     application/vnd.openxmlformats-officedocument.wordprocessingml.document,
     application/vnd.ms-excel,
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     ```
6. Click **"Create bucket"**

## Bước 2: Chạy SQL Script để tạo Policies

1. Vào mục **SQL Editor** trong Supabase Dashboard
2. Click **"New query"**
3. Copy toàn bộ nội dung từ file `supabase/setup_storage.sql`
4. Paste vào SQL Editor
5. Click **"Run"** để thực thi script

Script này sẽ tạo các policies sau:
- **Allow anonymous uploads**: Cho phép người dùng anonymous upload file vào thư mục `forecasts/`
- **Allow anonymous read own files**: Cho phép người dùng anonymous đọc file trong thư mục `forecasts/`
- **Allow service_role read all files**: Cho phép service_role đọc tất cả file
- **Allow service_role delete files**: Cho phép service_role xóa file

## Bước 3: Kiểm tra

Sau khi setup xong, bạn có thể kiểm tra bằng cách:

1. Mở ứng dụng và điền form
2. Upload một file PDF/Word/Excel ở mục "Dự báo tài chính"
3. Submit form
4. Kiểm tra trong Supabase Dashboard > Storage > financial-forecasts để xem file đã được upload chưa

## Cấu trúc lưu trữ

Files được lưu trong bucket `financial-forecasts` với cấu trúc:
```
financial-forecasts/
  └── forecasts/
      ├── 1234567890-abc123.pdf
      ├── 1234567891-def456.xlsx
      └── ...
```

Mỗi file có tên unique được tạo từ timestamp và random ID để tránh trùng lặp.

## Troubleshooting

### Lỗi: "new row violates row-level security policy"
- Đảm bảo đã chạy script `setup_storage.sql` để tạo policies
- Kiểm tra bucket name phải chính xác là `financial-forecasts`

### Lỗi: "The resource already exists"
- File đã tồn tại với tên đó (rất hiếm vì dùng timestamp + random ID)
- Thử lại hoặc kiểm tra bucket

### Không thể truy cập file qua URL
- Đảm bảo bucket được đặt là **Public bucket**
- Kiểm tra policies đã được tạo đúng chưa

### File quá lớn
- Kiểm tra file size limit của bucket
- Tăng file size limit trong bucket settings nếu cần


