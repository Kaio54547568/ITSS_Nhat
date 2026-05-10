# 日越フレンド

React/TypeScript/Vite demo app for the Japanese-Vietnamese friend matching system.

## Install

```bash
npm install
```

Windows fallback:

```bash
npm.cmd install
```

## Run

```bash
npm run dev
```

Windows fallback:

```bash
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

Windows fallback:

```bash
npm.cmd run build
```

## Demo Login

Login uses accounts from:

```text
src/app/data/data.json
```

Normal users:

```text
sato / demo
mai / demo
```

Admin:

```text
admin / admin
```

Redirect rules:

- `user` -> `/home`
- `admin` -> `/admin/users`

## Implemented Features

- Figma-style welcome/auth UI with orange/peach theme.
- Unified login for normal users and admins.
- Register/login required-field validation.
- User home/profile data loaded from `data.json`.
- Editable user profile.
- Avatar image preview update while editing profile.
- Search and matching with mock users from `data.json`.
- Profile icon opens a profile popup instead of navigating away.
- Avatar in user lists is display-only.
- Chat/history mock flow with localStorage runtime data.
- Review/report flow.
- Notifications/matching requests.
- Admin users, verification, and reports management.

## Runtime Data

Static mock data lives in:

```text
src/app/data/data.json
```

Runtime demo state is saved in browser `localStorage`, including login session, matched users, chat messages, and avatar preview changes. These changes are not written back to `data.json` because the app has no backend.

## Git Note

Do not commit `node_modules` or `dist`. They are ignored by the root `.gitignore`.

After cloning, install dependencies again with:

```bash
npm install
```
