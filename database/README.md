# Database

Supabase SQL files for the current app data model.

Run these files in Supabase SQL Editor in this order:

1. `schema.sql`
2. `seed.sql`
3. `policies.sql`
4. `realtime.sql`

`seed.sql` resets the seed tables with `truncate ... cascade`, then inserts database-backed demo data used by the React project. User-uploaded images are stored in the public Supabase Storage bucket `pics`; the database stores only the object path.

`policies.sql` adds development RLS policies so the current frontend can access data with the publishable/anon key.

`realtime.sql` enables Supabase Realtime for chat messages, chat threads, unread counters, notifications, friend requests, friendships, profile online status, and audio call signaling.

The frontend connection values live in `code/.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Use `code/.env.example` as the template for local setup.
