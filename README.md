# Nichietsu Friend

Ứng dụng kết nối bạn bè Nhật - Việt, dùng React/Vite ở frontend và Supabase cho database, realtime, RLS và Storage.

## Kiến trúc hiện tại

- Frontend: `code/src/app`
- Database SQL: `database/schema.sql`
- Seed data: `database/seed.sql`
- RLS policies: `database/policies.sql`
- Realtime setup: `database/realtime.sql`
- Ảnh người dùng, căn cước và bằng chứng report: Supabase Storage bucket `pics`
- Session đăng nhập frontend: `localStorage` key `nv_friend_session`

## Luồng dữ liệu

Runtime data của app được đọc/ghi từ Supabase:

- `profiles`: hồ sơ người dùng, trạng thái tài khoản, trạng thái xác minh
- `profile_admin_overrides`: danh sách quản trị người dùng
- `friend_requests` và `friendships`: matching/kết bạn
- `chat_threads`, `chat_thread_participants`, `chat_messages`: chat và unread count
- `notifications`: lịch sử thông báo
- `verification_requests`: yêu cầu xác minh kèm snapshot hồ sơ
- `reports` và `reviews`: báo cáo và đánh giá
- `reference_options`: lựa chọn ngôn ngữ, sở thích, lý do report, emoji, topic chat

Frontend không còn dùng các file dữ liệu JSON/TypeScript tĩnh cho user, chat, report hoặc admin.

## Setup SQL

Chạy trong Supabase SQL Editor theo thứ tự:

1. `database/schema.sql`
2. `database/seed.sql`
3. `database/policies.sql`
4. `database/realtime.sql`

`seed.sql` sẽ reset dữ liệu demo bằng `truncate ... cascade`, sau đó nạp bộ dữ liệu nhất quán với logic hiện tại.

## Tài khoản demo

- User: `sato` / `demo`
- Admin: `admin` / `admin`

## Chạy frontend

```bash
cd code
npm install
npm run dev
```

Tạo file `code/.env` theo `code/.env.example`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
