# 日越フレンド

Ứng dụng kết nối bạn bè Nhật - Việt, xây dựng bằng React, TypeScript, Vite và Supabase. Dự án gồm frontend trong thư mục `code` và các file SQL khởi tạo database trong thư mục `database`.

## Tính năng chính

- Đăng nhập/đăng ký người dùng và phân quyền admin.
- Hồ sơ cá nhân, chỉnh sửa thông tin và ảnh đại diện.
- Tìm kiếm, kết bạn, quản lý lời mời kết bạn.
- Chat realtime, thông báo và trạng thái chưa đọc.
- Gửi yêu cầu xác minh tài khoản.
- Báo cáo người dùng, đánh giá và màn hình quản trị.
- Lưu ảnh người dùng, giấy tờ xác minh và bằng chứng báo cáo bằng Supabase Storage.

## Công nghệ sử dụng

- Frontend: React, TypeScript, Vite.
- UI: Radix UI, MUI, Tailwind CSS, lucide-react.
- Backend services: Supabase Database, Realtime, Row Level Security và Storage.
- Session đăng nhập phía frontend: `localStorage` với key `nv_friend_session`.

## Cấu trúc thư mục

```text
ITSS_Nhat/
|-- code/                 # Source frontend React/Vite
|   |-- src/app/          # Routes, pages, components và logic ứng dụng
|   |-- .env.example      # Mẫu biến môi trường Supabase
|   `-- package.json      # Scripts chạy frontend
|-- database/             # SQL setup Supabase
|   |-- schema.sql        # Bảng, enum, trigger, function
|   |-- seed.sql          # Dữ liệu demo
|   |-- policies.sql      # RLS policies cho môi trường phát triển
|   `-- realtime.sql      # Cấu hình Supabase Realtime
`-- README.md
```

## Yêu cầu trước khi chạy

- Node.js 18 trở lên.
- npm.
- Một Supabase project để lấy `Project URL` và `publishable/anon key`.

## Cài đặt dự án

Clone source code và cài dependencies cho frontend:

```bash
git clone <repository-url>
cd ITSS_Nhat/code
npm install
```

Nếu dùng Windows PowerShell và lệnh `npm` bị lỗi alias, dùng:

```bash
npm.cmd install
```

## Cấu hình Supabase

Tạo file `.env` trong thư mục `code` bằng cách copy từ file mẫu:

```bash
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Sau đó cập nhật nội dung `code/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Trong Supabase SQL Editor, chạy các file SQL theo đúng thứ tự:

1. `database/schema.sql`
2. `database/seed.sql`
3. `database/policies.sql`
4. `database/realtime.sql`

Lưu ý: `seed.sql` có dùng `truncate ... cascade` để reset dữ liệu demo trước khi nạp lại dữ liệu mới.

Ứng dụng sử dụng Supabase Storage bucket `pics` cho ảnh đại diện, giấy tờ xác minh và ảnh bằng chứng trong báo cáo. Nếu bucket chưa tồn tại, hãy tạo bucket public tên `pics` trong Supabase Storage.

## Chạy dự án ở môi trường development

Từ thư mục frontend:

```bash
cd code
npm run dev
```

Trên Windows PowerShell:

```powershell
cd code
npm.cmd run dev
```

Mở trình duyệt tại:

```text
http://localhost:5173
```

Nếu port `5173` đã được sử dụng, Vite sẽ tự chuyển sang port khác và in URL mới trong terminal.

## Build production

```bash
cd code
npm run build
```

Kết quả build nằm trong:

```text
code/dist/
```

## Tài khoản demo

- User: `sato` / `demo`
- Admin: `admin` / `admin`

## Một số lỗi thường gặp

`Missing Supabase environment variables`

- Kiểm tra file `code/.env` đã tồn tại chưa.
- Kiểm tra đã khai báo `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` chưa.
- Sau khi sửa `.env`, dừng server dev và chạy lại `npm run dev`.

Không thấy dữ liệu demo

- Kiểm tra đã chạy đủ 4 file SQL theo đúng thứ tự chưa.
- Chạy lại `database/seed.sql` nếu muốn reset dữ liệu demo.

Không gửi/nhận realtime chat hoặc thông báo

- Kiểm tra đã chạy `database/realtime.sql`.
- Kiểm tra Realtime đã được bật cho các bảng liên quan trong Supabase.

Không upload hoặc hiển thị ảnh

- Kiểm tra bucket `pics` đã tồn tại trong Supabase Storage.
- Kiểm tra policy Storage cho phép frontend đọc/ghi trong môi trường phát triển.

## Ghi chú Git

Không commit các thư mục sinh tự động hoặc phụ thuộc cục bộ:

```text
node_modules/
dist/
.env
```
