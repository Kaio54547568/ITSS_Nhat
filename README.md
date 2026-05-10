# 日越フレンド

日越フレンド là web app demo kết nối bạn bè Nhật - Việt, dành cho người Nhật sống tại Hà Nội và người Việt đang học tiếng Nhật. Ứng dụng được xây dựng bằng React, TypeScript, Vite và React Router Data Mode.

Source code chính nằm trong thư mục:

```bash
ITSS_Nhat/code
```

## Mục Tiêu

- Hỗ trợ người Nhật tại Hà Nội tìm bạn Việt Nam.
- Hỗ trợ người Việt học tiếng Nhật kết bạn và luyện giao tiếp với người Nhật.
- Giảm cảm giác ngại khi mới nói chuyện bằng gợi ý chủ đề hội thoại.
- Cung cấp màn quản trị để xem user, xử lý xác minh danh tính và report.

## Công Nghệ

- React
- TypeScript
- Vite
- React Router Data Mode
- localStorage cho session và dữ liệu demo phát sinh khi chạy app
- Mock data từ `code/src/app/data/data.json`

## Cấu Trúc Thư Mục

```text
ITSS_Nhat/
|-- README.md
|-- .gitignore
`-- code/
    |-- package.json
    |-- package-lock.json
    |-- README.md
    |-- index.html
    `-- src/
        |-- App.tsx
        |-- app/
        |   |-- routes.tsx
        |   |-- components/
        |   |-- data/
        |   |   |-- data.json
        |   |   |-- appData.ts
        |   |   |-- auth.ts
        |   |   |-- chats.ts
        |   |   `-- mockData.ts
        |   `-- pages/
        `-- styles/
```

## Cài Đặt

Yêu cầu:

- Node.js 18 trở lên
- npm

Từ thư mục root của repo, chạy:

```bash
cd ITSS_Nhat/code
npm install
```

Nếu PowerShell chặn `npm.ps1`, dùng:

```bash
npm.cmd install
```

## Chạy Development

```bash
npm run dev
```

Hoặc trên Windows:

```bash
npm.cmd run dev
```

Sau đó mở:

```text
http://localhost:5173
```

## Build Production

```bash
npm run build
```

Hoặc trên Windows:

```bash
npm.cmd run build
```

Build output nằm trong:

```text
ITSS_Nhat/code/dist
```

## Tài Khoản Demo

Tất cả tài khoản đăng nhập được lấy từ `code/src/app/data/data.json`, trong mảng `users`.

User thường:

```text
username: sato
password: demo
role: user
```

```text
username: mai
password: demo
role: user
```

Admin:

```text
username: admin
password: admin
role: admin
```

Màn đăng nhập dùng chung cho cả user và admin:

- Nếu `role` là `user`, app chuyển đến `/home`.
- Nếu `role` là `admin`, app chuyển đến `/admin/users`.

Không còn nút đăng nhập quản trị viên riêng trên welcome screen.

## Chức Năng Đã Hoàn Thành

Public:

- Welcome screen theo tinh thần Figma màu cam/peach.
- Đăng ký tài khoản demo.
- Đăng nhập chung cho user và admin.
- Validate required field cho form đăng ký và đăng nhập.

User:

- Trang chủ hiển thị đúng thông tin user đang đăng nhập từ `data.json`.
- Trang profile hiển thị đúng thông tin user đang đăng nhập.
- Chỉnh sửa profile cơ bản.
- Khi ở chế độ chỉnh sửa, click avatar cá nhân để chọn ảnh avatar mới.
- Tìm kiếm và lọc user theo tuổi, sở thích.
- Danh sách user lấy từ `data.json.users`.
- Nút matching cập nhật trạng thái match demo.
- Nút icon profile mở popup hồ sơ, không chuyển trang.
- Click avatar trong danh sách user không mở profile.
- Popup hồ sơ hiển thị thông tin cơ bản, gallery, ngôn ngữ, sở thích và tính cách.
- Chat mock 1-1, gửi tin nhắn bằng state/localStorage.
- Lịch sử chat/contact.
- Review user.
- Report user.
- Thông báo matching request, nút profile cũng mở popup hồ sơ.

Admin:

- Dashboard quản trị.
- Danh sách user.
- Tìm kiếm/sắp xếp/pagination mock.
- Xem chi tiết user.
- Quản lý xác minh danh tính.
- Phê duyệt hoặc từ chối verification.
- Quản lý report.
- Từ chối report hoặc đình chỉ user.

## Routes Chính

Public:

```text
/
/welcome
/login
/register
```

User:

```text
/home
/profile
/profile/basic
/profile/preferences
/users/:id
/search
/history
/chat/:id
/review/:id
/report/:id
/notifications
```

Admin:

```text
/admin
/admin/users
/admin/verification
/admin/reports
```

## Dữ Liệu Và Lưu Trữ

File dữ liệu chính:

```text
code/src/app/data/data.json
```

File này chứa:

- Tên app
- Tài khoản user/admin
- Danh sách user mock
- Matching requests
- Lý do report
- Chủ đề gợi ý hội thoại
- Route/policy cơ bản

Dữ liệu phát sinh trong lúc chạy app được lưu trong `localStorage`, ví dụ:

- Session đăng nhập
- Match status
- Tin nhắn chat mới
- Avatar preview do user chọn
- Một số trạng thái demo khác

Lưu ý: app không có backend thật, nên các thay đổi runtime không ghi ngược vào `data.json`.

## Git Và node_modules

Không push `node_modules` lên GitHub. Thư mục này rất nặng và có thể tạo lại bằng:

```bash
npm install
```

`.gitignore` đã cấu hình bỏ qua:

```gitignore
node_modules/
dist/
.env
```

Nên push:

- `code/package.json`
- `code/package-lock.json`
- `code/src/`
- `code/README.md`
- `README.md`
- `.gitignore`

Không nên push:

- `code/node_modules/`
- `code/dist/`, trừ khi được yêu cầu nộp bản build
- file `.env`

## Reset Demo Data

Nếu muốn reset session, chat hoặc avatar đã đổi trong browser:

1. Mở DevTools.
2. Vào tab Application.
3. Chọn Local Storage.
4. Xóa dữ liệu của `http://localhost:5173`.
5. Reload lại app.
