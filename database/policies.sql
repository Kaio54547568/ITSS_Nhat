-- Development policies for the current custom-auth frontend.
-- Run after schema.sql and seed.sql if Supabase API returns empty rows while SQL Editor shows data.
--
-- The app currently uses its own username/password fields in profiles, not Supabase Auth.
-- These policies therefore allow anon/authenticated clients to read and write the app tables.
-- Tighten these before production.

do $$
declare
  table_name text;
  table_names text[] := array[
    'app_metadata',
    'demo_accounts',
    'profiles',
    'profile_admin_overrides',
    'match_requests',
    'friendships',
    'friend_requests',
    'notifications',
    'chat_threads',
    'chat_thread_participants',
    'chat_messages',
    'call_sessions',
    'call_signals',
    'reports',
    'reviews',
    'verification_requests',
    'reference_options'
  ];
begin
  foreach table_name in array table_names loop
    execute format('alter table public.%I enable row level security', table_name);

    execute format('drop policy if exists "%I_dev_select" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%I_dev_insert" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%I_dev_update" on public.%I', table_name, table_name);
    execute format('drop policy if exists "%I_dev_delete" on public.%I', table_name, table_name);

    execute format(
      'create policy "%I_dev_select" on public.%I for select to anon, authenticated using (true)',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_dev_insert" on public.%I for insert to anon, authenticated with check (true)',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_dev_update" on public.%I for update to anon, authenticated using (true) with check (true)',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_dev_delete" on public.%I for delete to anon, authenticated using (true)',
      table_name,
      table_name
    );
  end loop;
end;
$$;
