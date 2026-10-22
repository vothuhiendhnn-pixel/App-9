# Hoàn thiện tài khoản kiểm thử – riêng cho DEMO

Dự án DEMO đã tạo: `English 9 Miss Hien - Jury DEMO 2026`.
Ref xác thực: `cdbavdelevuczmyiodij`.
**Không thao tác trong dự án thật** (`jwfztukqbiamucrecuhf`).

## 1. Tạo giáo viên bằng Supabase Auth (thao tác của chủ tài khoản)
Vào dự án DEMO trong Supabase Dashboard → Authentication → Users → Add user.
Nhập **email demo riêng mà chủ tài khoản kiểm soát được** và mật khẩu mạnh mới.
Chọn xác nhận email trong Dashboard nếu phù hợp; không dùng email/mật khẩu đang đăng nhập APP chính.
Ghi lại email giáo viên DEMO để cung cấp cho bước tạo profile và lớp.

Không chèn mật khẩu thật hoặc khóa bí mật vào mã nguồn, SQL hay GitHub.

## 2. Tạo lớp, học sinh mẫu
Chỉ sau khi giáo viên demo tồn tại trong `auth.users`, thêm:
- Profile `role='teacher'` liên kết với Auth user DEMO.
- Lớp `9A – DEMO` với `teacher_id` của user demo.
- Hai học sinh có tên giả (ví dụ `Học sinh mẫu 01`, `Học sinh mẫu 02`), mã khác mã thật.
- Mật khẩu học sinh DEMO được băm với `extensions.crypt(...,extensions.gen_salt('bf'))`.
- Một vài bài nộp mẫu thể hiện rõ nhãn DEMO.

Các tài khoản này chỉ được tạo trong dự án DEMO. Không dùng dữ liệu gốc để seed.

## 3. Cấu hình dự án Vercel riêng
Tạo Vercel Project **mới** từ nhánh `demo-giam-khao-2026` (không đổi cấu hình Vercel sản phẩm).
Thiết lập:
```env
VITE_DEMO_MODE=true
VITE_DEMO_SUPABASE_URL=https://cdbavdelevuczmyiodij.supabase.co
VITE_DEMO_SUPABASE_PUBLISHABLE_KEY=<publishable-key-cua-du-an-DEMO>
```
App không có fallback sang Supabase production, nên sai/missing biến DEMO sẽ ngừng chạy có chủ đích.

## 4. Nghiệm thu
Kiểm tra đăng nhập iPhone Safari; mã học sinh; nộp bài qua RPC; giáo viên Auth + profile; Dashboard chỉ đọc dữ liệu DEMO; chống đăng nhập sai; rollback riêng.

**Trạng thái hiện tại:** Schema RLS DEMO đã có. Còn cần tài khoản giáo viên DEMO thật, dữ liệu mẫu và dự án Vercel riêng. Không phát link cho Ban Giám khảo khi chưa thử đầy đủ.
