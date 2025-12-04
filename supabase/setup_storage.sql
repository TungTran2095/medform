-- Migration script để tạo bucket và policies cho Supabase Storage
-- Chạy script này trong Supabase SQL editor (PostgreSQL)
-- Lưu ý: Syntax này dành cho PostgreSQL, không phải SQL Server

-- BƯỚC 1: Tạo bucket 'financial-forecasts' trong Supabase Dashboard
-- 1. Vào Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Tên bucket: financial-forecasts
-- 4. Public bucket: BẬT (để có thể truy cập file qua URL)
-- 5. File size limit: Tùy chọn (ví dụ: 10MB)
-- 6. Allowed MIME types: application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

-- BƯỚC 2: Chạy script này để tạo policies

-- Xóa policies cũ nếu tồn tại (để có thể chạy lại script)
drop policy if exists "Allow anonymous uploads to financial-forecasts" on storage.objects;
drop policy if exists "Allow anonymous read own files" on storage.objects;
drop policy if exists "Allow service_role read all files" on storage.objects;
drop policy if exists "Allow service_role delete files" on storage.objects;

-- Policy cho phép anonymous users upload file vào thư mục forecasts/
create policy "Allow anonymous uploads to financial-forecasts"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'financial-forecasts' and
  (storage.foldername(name))[1] = 'forecasts'
);

-- Policy cho phép anonymous users đọc file trong thư mục forecasts/
create policy "Allow anonymous read own files"
on storage.objects
for select
to anon
using (
  bucket_id = 'financial-forecasts' and
  (storage.foldername(name))[1] = 'forecasts'
);

-- Policy cho phép service_role đọc tất cả file trong bucket
create policy "Allow service_role read all files"
on storage.objects
for select
to service_role
using (bucket_id = 'financial-forecasts');

-- Policy cho phép service_role xóa file trong bucket
create policy "Allow service_role delete files"
on storage.objects
for delete
to service_role
using (bucket_id = 'financial-forecasts');

