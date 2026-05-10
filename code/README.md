# 日越フレンド

React/TypeScript/Vite demo app for Japanese-Vietnamese friend matching.

## Install

```bash
npm install
```

Windows PowerShell fallback:

```bash
npm.cmd install
```

## Run

```bash
npm run dev
```

Windows PowerShell fallback:

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

Windows PowerShell fallback:

```bash
npm.cmd run build
```

## Unified Login

There is one login screen for both normal users and admins.

User:

```text
sato / demo
```

Admin:

```text
admin / admin
```

After login, the app redirects by account role:

- `user` -> `/home`
- `admin` -> `/admin/users`

Basic app/account information is saved in:

```text
src/app/data/data.json
```
