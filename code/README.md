# Nichietsu Friend Frontend

Frontend React/TypeScript/Vite cho ứng dụng Nichietsu Friend. Thư mục này chỉ chứa phần giao diện và logic phía client; dữ liệu runtime được đọc/ghi qua Supabase.

## Cài dependencies

```bash
npm install
```

Windows PowerShell:

```powershell
npm.cmd install
```

## Cấu hình môi trường

Copy file mẫu:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Cập nhật `code/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

## Chạy development server

```bash
npm run dev
```

Windows PowerShell:

```powershell
npm.cmd run dev
```

Mở trình duyệt tại:

```text
http://localhost:5173
```

## Build production

```bash
npm run build
```

Output được tạo tại:

```text
dist/
```

## Tài khoản demo

- User: `sato` / `demo`
- Admin: `admin` / `admin`

## Ghi chú dữ liệu

- App dùng Supabase cho profiles, friend requests, chat, notifications, verification, reports và reviews.
- Session đăng nhập được lưu trong `localStorage` với key `nv_friend_session`.
- Ảnh được lưu trong Supabase Storage bucket `pics`.
- Các file SQL setup database nằm ở thư mục `../database`.
