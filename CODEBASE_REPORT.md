# CODEBASE REPORT - ITSS_Nhat

Ngày rà soát: 2026-05-14

## 1. Tổng quan project

- Tên project trong `package.json`: `nichietsu-friend`
- Tên hiển thị trong dữ liệu app: `日越フレンド`
- Mục tiêu: web app demo kết nối bạn bè Nhật - Việt, có đăng nhập, hồ sơ, tìm kiếm/matching, chat mock, report và trang admin.
- Tech stack frontend:
  - React 18
  - TypeScript/TSX
  - Vite 6
  - React Router 7 Data Router (`createBrowserRouter`)
  - Tailwind CSS 4, Radix UI components, lucide-react, MUI packages
- Tech stack backend: chưa có backend thật trong repo này.
- Database/ORM: chưa có database/ORM. Dữ liệu hiện tại nằm trong JSON/TypeScript mock và `localStorage`.
- Cách chạy local:
  - `cd ITSS_Nhat/code`
  - `npm install`
  - `npm run dev`
  - Mở `http://localhost:5173`
- Build production:
  - `cd ITSS_Nhat/code`
  - `npm run build`
  - Build đã được kiểm tra thành công.
- Biến môi trường cần thiết:
  - Không tìm thấy biến môi trường được dùng trong code (`import.meta.env`, `process.env`, `VITE_*`).
  - `.env` và `.env.local` đang bị ignore trong `.gitignore`.

## 2. Cấu trúc thư mục

```text
ITSS_Nhat/
|-- README.md
|-- .gitignore
|-- CODEBASE_REPORT.md
`-- code/
    |-- package.json
    |-- package-lock.json
    |-- README.md
    |-- index.html
    |-- vite.config.ts
    |-- postcss.config.mjs
    |-- guidelines/
    |   `-- Guidelines.md
    `-- src/
        |-- main.tsx
        |-- app/
        |   |-- App.tsx
        |   |-- routes.tsx
        |   |-- components/
        |   |-- data/
        |   `-- pages/
        |-- imports/
        `-- styles/
```

Đã bỏ qua: `node_modules`, `dist`, `build`, `.git`, `.next`, `coverage`.

## 3. Các chức năng đã có

| Chức năng | Trạng thái | Ghi chú |
|---|---|---|
| Auth | Đã có demo, chưa an toàn | Login/register bằng mock data và `localStorage`. Không có token/backend. |
| Profile | Đang lỗi/thiếu | Hiển thị profile được; avatar lưu `localStorage`; nhiều field edit chỉ đổi state UI, chưa lưu vào store chung. |
| Search user | Đã có demo | Lọc user theo tuổi/sở thích từ `data.json`; không gọi API. |
| Match request | Đã có demo, chưa bền vững | Search lưu matched ids vào `localStorage`; Notifications chỉ giữ state trong page. |
| Conversation/chat | Đã có mock, chưa realtime | Chat lưu vào `localStorage` theo route id; không socket, không database. |
| Topic suggestion | Đã có demo | Topic hard-code trong `mockData.ts` và `chats.ts`; chưa có thuật toán/backend. |
| Report/admin | Đã có demo, dữ liệu rời rạc | User report có lưu `localStorage`; admin lại dùng `adminMockData.ts`, không đọc cùng nguồn report. |

## 4. Frontend

Routes hiện có trong `code/src/app/routes.tsx`:

```text
/
/welcome
/signup
/register
/login
/home
/profile
/profile/basic
/profile/preferences
/users/:id
/search
/history
/chat
/chat/:id
/review/:id
/report/:id
/notifications
/admin
/admin/users
/admin/verification
/admin/reports
*
```

Page chính:

- `src/app/pages/WelcomePage.tsx`
- `src/app/pages/LoginPage.tsx`
- `src/app/pages/SignUpPage.tsx`
- `src/app/pages/HomePage.tsx`
- `src/app/pages/ProfilePage.tsx`
- `src/app/pages/SearchPage.tsx`
- `src/app/pages/ChatHistoryPage.tsx`
- `src/app/pages/ChatRoomPage.tsx`
- `src/app/pages/NotificationsPage.tsx`
- `src/app/pages/ReviewPage.tsx`
- `src/app/pages/ReportPage.tsx`
- `src/app/pages/UserDetailPage.tsx`
- `src/app/pages/admin/AdminUsersPage.tsx`
- `src/app/pages/admin/AdminVerificationPage.tsx`
- `src/app/pages/admin/AdminReportsPage.tsx`

Component chính:

- `src/app/components/Layout.tsx`: layout/header cho user.
- `src/app/components/AdminLayout.tsx`: layout/header cho admin.
- `src/app/components/ContactsList.tsx`: danh sách chat contact.
- `src/app/components/ProfilePreviewModal.tsx`: popup xem profile.
- `src/app/components/Characters.tsx`: minh họa trang auth.
- `src/app/components/ui/*`: bộ UI component Radix/shadcn-like.

Luồng đăng nhập hiện tại:

- User nhập username/password ở `LoginPage`.
- `login()` trong `src/app/data/auth.ts` tìm user theo username/password trong `data.json` qua `appUsers`, sau đó trong `getUsers()` từ `localStorage`.
- Nếu hợp lệ, app ghi session `{ id, role, name }` vào `localStorage` key `nv_friend_session`.
- Redirect theo role:
  - `user` -> `/home`
  - `admin` -> `/admin/users`
- Route guard:
  - `UserGuard` đọc session từ `localStorage`; admin bị redirect sang admin.
  - `AdminGuard` chỉ kiểm tra `session.role === "admin"` ở phía client.

Cách gọi API hiện tại:

- Không có HTTP API client.
- Không thấy `fetch`, `axios`, `WebSocket`, `socket.io-client`.
- Các "data access" hiện là import trực tiếp từ `src/app/data/*` và đọc/ghi `localStorage`.

State management:

- Dùng React local state (`useState`, `useEffect`) trong từng page/component.
- Dùng `localStorage` làm runtime persistence.
- Không thấy Redux, Zustand, React Query hay Context app-level cho domain state.

Socket client:

- Chưa có socket client.
- File gần nhất với chat client là `src/app/pages/ChatRoomPage.tsx`, nhưng chỉ dùng state + `localStorage`.

## 5. Backend

Không có backend trong repo hiện tại.

- Không có thư mục server/backend.
- Không có NestJS/Express controller/service/module.
- Không có `main.ts`, `app.module.ts`, Prisma service, gateway hay API routes server-side.
- Không có API endpoints thật.

Nếu nhóm theo chức năng thì trạng thái endpoint là:

| Nhóm | Endpoint hiện có |
|---|---|
| Auth | Chưa có |
| User/Profile | Chưa có |
| Search/Match | Chưa có |
| Conversation/Message | Chưa có |
| Report/Admin | Chưa có |
| Verification | Chưa có |

Cơ chế auth hiện tại:

- Client-only.
- Session lưu trong `localStorage`.
- Password mẫu đang nằm trong mock data.
- Không có JWT/session cookie/backend verification.

Cơ chế phân quyền:

- Client route guard trong `src/app/routes.tsx`.
- Không có phân quyền server-side.

Socket/WebSocket gateway:

- Chưa có.

## 6. Database

Không có Prisma schema/database migration trong repo hiện tại.

Dữ liệu chính đang nằm ở:

- `src/app/data/data.json`
- `src/app/data/users.ts`
- `src/app/data/mockData.ts`
- `src/app/data/adminMockData.ts`
- `src/app/data/reports.ts`
- `src/app/data/verifications.ts`
- `src/app/data/chats.ts`

Schema logic hiện tại, suy ra từ mock data:

```text
User
- id, profileId, name, username, password, role
- email, phone, nationality, countryCode
- age, gender, address, destination, birthDate
- avatarColor, avatarEmoji, online
- languages[], interests[], personality[], gallery[]
- bio, matchRate, connections, messageCount, unread
- reportCount, verificationStatus

MatchRequest
- id, userId, name, destination, intro
- avatarColor, avatarEmoji, countryCode

ChatThread
- id, userId, unread, messages[]

ChatMessage
- id, senderId, text, time

Report
- id, reporterName, targetName, targetId
- date, reason, detail, evidenceImage, status

VerificationRequest
- id, userId/user name fields, submitted/application date
- media/document placeholder, status

Review
- chưa có model riêng; đang lưu key localStorage dạng nv_friend_review_{contactId}
```

Quan hệ chính nên có khi chuyển sang database thật:

- `User 1-n MatchRequest` theo `senderId`/`receiverId`.
- `User n-n Conversation` qua bảng participant.
- `Conversation 1-n Message`.
- `User 1-n Report` với vai trò reporter.
- `User 1-n Report` với vai trò reported/target.
- `User 1-n VerificationRequest`.
- `User 1-n Review` với reviewer/target.

Migration/seed:

- Chưa có Prisma migration.
- Chưa có seed script backend.
- Có seed/mock data trong TypeScript/JSON frontend.

## 7. Chat realtime

Luồng chat hiện tại:

1. User vào `/chat/:id`.
2. `ChatRoomPage` parse `id` từ route thành `contactId`.
3. Lấy contact bằng `getUserById(contactId)` từ `mockData.ts`.
4. Load messages từ `localStorage` key `nv_friend_chat_${contactId}`.
5. Nếu chưa có local messages thì dùng `mockMessages[contactId]`.
6. Khi gửi message, page append message vào React state và ghi lại vào `localStorage`.

Socket events đang có:

- Không có socket events.
- Không có `joinConversation`, `sendMessage`, `receiveMessage`, `typing`, `readReceipt`, v.v.

Client gửi payload gì:

- Không gửi payload lên server.
- Message local trong `ChatRoomPage.tsx` có dạng:

```ts
{ id: prev.length + 1, sender: "me", content: input.trim(), time: timeStr }
```

Server xử lý ra sao:

- Không có server xử lý.

Message có được lưu database chưa:

- Chưa.
- Chỉ lưu browser `localStorage`.

Có kiểm tra user thuộc conversation không:

- Không.
- Chat route chỉ dựa trên `contactId` trong URL.

Có lấy senderId từ token hay nhận senderId từ client:

- Không có token.
- Không có `senderId` thật trong `ChatRoomPage`; sender được hard-code là `"me"`.
- `src/app/data/chats.ts` có type `senderId`, nhưng flow chat UI hiện tại không dùng file này.

## 8. Các vấn đề hiện tại

Lỗi/rủi ro đang thấy:

- Auth không an toàn: password mẫu nằm trong mock data và so sánh trực tiếp trên client. Xem `src/app/data/auth.ts:28-35` và các field `password` trong `src/app/data/data.json`.
- Session/role có thể bị sửa trong DevTools vì lưu ở `localStorage`. Route guard ở `src/app/routes.tsx:23-33` chỉ bảo vệ UI.
- Chưa có backend/API/database nên không có nguồn dữ liệu đáng tin cậy.
- Chat không realtime, không lưu DB, không kiểm tra quyền vào conversation. Xem `src/app/pages/ChatRoomPage.tsx:16-23` và `src/app/pages/ChatRoomPage.tsx:39-51`.
- Dữ liệu bị phân mảnh:
  - `data.json/appData.ts` dùng cho app user/search/notification.
  - `users.ts` có seed user riêng cho register/localStorage.
  - `mockData.ts` có contact/message/search user riêng.
  - `adminMockData.ts` có admin users/reports/verification riêng.
- Admin report không đọc report user vừa submit. User report lưu qua `reports.ts`, còn admin report page dùng `mockAdminReports` trong `adminMockData.ts`.
- Profile edit chưa persist đầy đủ. `ProfilePage` có nhiều state field, nhưng không gọi `updateUser`; avatar là phần được ghi `localStorage` ở `src/app/pages/ProfilePage.tsx:104-105`.
- Match request trong `NotificationsPage` chỉ nằm trong component state; refresh sẽ reset.
- ID đang lẫn nhiều hệ:
  - `User.id` dạng `u1`.
  - `profileId` dạng number.
  - `mockContacts.id` dạng number.
  - `matchRequests.id` dạng number.
  - Điều này dễ làm sai route `/chat/:id` và lookup user.
- Không có test, lint, typecheck script riêng. `npm run build` chỉ chạy Vite build.
- Có dấu hiệu encoding/hiển thị ký tự Nhật bị mojibake trong một số output terminal/README, cần kiểm tra encoding file khi chỉnh sửa.

Điểm cần refactor:

- Tách domain model thống nhất cho User, Conversation, Message, MatchRequest, Report, Verification.
- Gom data access vào một lớp API/client thay vì import mock data trực tiếp trong page.
- Loại bỏ các mock source song song hoặc map rõ một nguồn canonical.
- Tách form/profile logic khỏi UI page lớn.
- Chuẩn hóa auth flow trước khi nối realtime chat.

Điểm chưa bảo mật:

- Không lưu password plaintext trong frontend.
- Không tin role/session từ `localStorage`.
- Không nhận `senderId`/`userId` nhạy cảm từ client khi có backend; server phải lấy từ token/session.
- Admin actions phải kiểm tra role server-side.
- Report/chat/profile phải validate quyền truy cập trên server.

## 9. Các file quan trọng cần gửi kèm

- `README.md`: mô tả project, cách chạy, chức năng demo.
- `code/package.json`: dependencies/scripts frontend.
- `code/package-lock.json`: lockfile npm.
- `code/vite.config.ts`: cấu hình Vite, React, Tailwind, alias.
- `code/src/main.tsx`: entrypoint React.
- `code/src/app/App.tsx`: mount `RouterProvider`.
- `code/src/app/routes.tsx`: toàn bộ route + user/admin guard.
- `code/src/app/data/data.json`: dữ liệu mock chính. Không chia sẻ secret thật; hiện có field password mẫu.
- `code/src/app/data/auth.ts`: login/register/session client-side.
- `code/src/app/data/appData.ts`: helper đọc user/match từ `data.json`.
- `code/src/app/data/users.ts`: seed users và persistence `nv_friend_users`.
- `code/src/app/data/mockData.ts`: contact/message/search/topic mock cho chat và review.
- `code/src/app/data/chats.ts`: type/helper chat thread chưa được flow chat chính dùng nhiều.
- `code/src/app/data/reports.ts`: report seed/localStorage.
- `code/src/app/data/verifications.ts`: verification seed/localStorage.
- `code/src/app/data/adminMockData.ts`: mock riêng cho admin.
- `code/src/app/pages/LoginPage.tsx`: UI login.
- `code/src/app/pages/SignUpPage.tsx`: UI register.
- `code/src/app/pages/ProfilePage.tsx`: profile edit UI.
- `code/src/app/pages/SearchPage.tsx`: search/match demo.
- `code/src/app/pages/NotificationsPage.tsx`: match requests demo.
- `code/src/app/pages/ChatRoomPage.tsx`: chat mock/localStorage.
- `code/src/app/pages/ChatHistoryPage.tsx`: chat layout/history shell.
- `code/src/app/pages/ReviewPage.tsx`: review/report user.
- `code/src/app/pages/admin/AdminUsersPage.tsx`: admin user list mock.
- `code/src/app/pages/admin/AdminVerificationPage.tsx`: admin verification mock.
- `code/src/app/pages/admin/AdminReportsPage.tsx`: admin report mock.
- `code/src/app/components/Layout.tsx`: user navigation/logout.
- `code/src/app/components/AdminLayout.tsx`: admin navigation/logout.
- `code/src/app/components/ContactsList.tsx`: contact list dùng trong chat.

Không có các file sau trong repo hiện tại:

- `prisma/schema.prisma`
- backend `package.json`
- backend `main.ts`
- backend `app.module.ts`
- auth controller/service/guard backend
- chat gateway/socket server
- API client file riêng
- socket client file riêng

## 10. Đề xuất bước sửa tiếp theo

Nên sửa trước:

1. Quyết định kiến trúc MVP thật: giữ frontend hiện tại và thêm backend riêng, hoặc chuyển sang full-stack framework.
2. Thiết kế schema database trước: User, Profile, MatchRequest, Conversation, ConversationParticipant, Message, Report, VerificationRequest, Review.
3. Làm backend auth tối thiểu: register/login, hash password, JWT hoặc httpOnly session cookie, role guard server-side.
4. Tạo API client frontend duy nhất và thay dần mock import bằng API calls.
5. Thống nhất ID/domain model, bỏ dần `mockData.ts`, `adminMockData.ts`, `users.ts` trùng lặp.
6. Làm chat MVP không realtime trước: REST create/list conversations/messages + kiểm tra participant.
7. Sau khi message persistence ổn, thêm WebSocket/socket events cho realtime.
8. Sửa admin report/verification dùng cùng database với user flow.

Không nên đụng lúc này để tránh vỡ app:

- Không refactor toàn bộ UI/style cùng lúc với backend; UI hiện build được và có thể dùng làm prototype.
- Không xóa mock data ngay; nên giữ làm seed/reference trong lúc dựng backend.
- Không làm realtime socket trước khi có auth + conversation membership + message persistence.
- Không đổi route lớn nếu chưa có API tương ứng; chỉ bọc data access để giảm rủi ro.
- Không tối ưu component UI library trước; vấn đề chính hiện là data/auth/backend boundary.

## Kết luận ngắn

Repo hiện tại là frontend MVP/demo chạy được, nhưng chưa phải full-stack app. Phần cần ưu tiên cho MVP tiếp theo là dựng backend, database schema, auth thật, API boundary và persistence cho chat/report/match. Realtime chat nên để sau khi REST + quyền truy cập conversation đã ổn.
