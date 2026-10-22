# English 9 – Miss Hiền | Bản DEMO dành cho Ban Giám khảo

## Trạng thái
ĐANG CHUẨN BỊ – CHƯA TRIỂN KHAI. Nhánh `demo-giam-khao-2026` được sao tách từ `main` và không được merge vào production.

## Nguyên tắc bắt buộc
- Không sử dụng Supabase đang phục vụ học sinh.
- Không sao chép tên, mã, mật khẩu hoặc kết quả của học sinh thật.
- Không sửa site Vercel đang hoạt động `app-9-teal.vercel.app`.
- Giao diện và luồng chức năng sử dụng cùng mã nguồn APP chính.
- Mọi dữ liệu mẫu đều có nhãn *DEMO – dữ liệu giả lập*.
- Không gửi mật khẩu giáo viên thật hoặc service role key cho Ban Giám khảo.

## Cấu hình fail-closed
`src/lib/supabaseClient.ts` trên nhánh này đọc **duy nhất**:
```env
VITE_DEMO_MODE=true
VITE_DEMO_SUPABASE_URL=https://<demo-project-ref>.supabase.co
VITE_DEMO_SUPABASE_PUBLISHABLE_KEY=<demo-publishable-key>
```
Cố ý không đọc `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` từ APP chính.
Thiếu cấu hình / tên miền sai / trỏ đến dự án thật => báo lỗi trước khi khởi tạo client.

## Các thành phần bắt buộc của backend DEMO
1. Một Supabase project **riêng**, được chủ sở hữu chọn và xác nhận chi phí nếu phát sinh.
2. Schema phục vụ APP: `profiles`, `classes`, `students`, `submissions`, `assignments`, chức năng `student_login`, `student_submit_result`, `student_get_vocabulary_stages`, teacher auth. Sao chép **cấu trúc và logic đã được kiểm tra**, không di chuyển bản ghi production.
3. RLS được bật và quyền được giới hạn theo giáo viên/lớp và học sinh. Dù demo là dữ liệu giả, không cấp quyền truy cập tràn lan.
4. Dữ liệu mẫu không trùng tài khoản học sinh thật. Ít nhất 2 tài khoản mẫu cho học sinh và 1 giáo viên DEMO, đồng thời có bài nộp mẫu và kết quả kiểm tra quy trình đầu-cuối.
5. Một dự án Vercel mới độc lập, root branch `demo-giam-khao-2026`, chỉ kết nối đến Supabase DEMO.

## Điều kiện nghiệm thu trước khi cấp link cho BGK
- [ ] iPhone Safari: ô mã HS có bàn phím và nhận đầu vào.
- [ ] Chrome desktop: form học sinh và giáo viên hoạt động, không chia sẻ nhầm thông tin.
- [ ] Học sinh DEMO đăng nhập, học Vocabulary, Grammar, Practice và nộp bài.
- [ ] Kết quả nộp được ghi vào Supabase DEMO.
- [ ] Giáo viên DEMO đăng nhập và chỉ thấy các học sinh DEMO; Dashboard phản ánh bài vừa nộp.
- [ ] Sai mã HS / sai mật khẩu: bị từ chối.
- [ ] Không tài khoản DEMO nào truy cập APP thật hoặc CSDL thật.
- [ ] Kiểm tra APP chính không thay đổi (GitHub `main`, Vercel production URL, Supabase production data).
- [ ] In/hiển thị rõ chữ DEMO trên tài liệu trải nghiệm; không trình bày số liệu demo là số liệu nghiên cứu thực tế.

## Lưu ý
Bản nhánh hiện tại mới tạo lớp chặn kết nối production. **Chưa có Supabase DEMO, tài khoản demo, hay URL trải nghiệm được xác nhận.** Không gửi nhánh này cho Ban Giám khảo trước khi đủ các điều kiện trên.
