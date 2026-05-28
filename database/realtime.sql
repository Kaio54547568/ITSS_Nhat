-- Enable Supabase Realtime for app tables used by chat, notifications, and requests.
-- Run this after schema.sql. It is safe to run more than once.

do $$
declare
  table_name text;
  table_names text[] := array[
    'chat_messages',
    'chat_threads',
    'chat_thread_participants',
    'notifications',
    'friend_requests',
    'friendships',
    'profiles',
    'call_sessions',
    'call_signals'
  ];
begin
  foreach table_name in array table_names loop
    execute format('alter table public.%I replica identity full', table_name);

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
