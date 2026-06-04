-- Supabase/Postgres schema for Nichietsu Friend.
-- Database-backed data model for Nichietsu Friend.

create extension if not exists pgcrypto;

create table if not exists app_metadata (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists demo_accounts (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('user', 'admin')),
  label text not null,
  username text not null,
  password text not null,
  redirect_after_login text not null,
  unique (role, username)
);

create table if not exists profiles (
  id text primary key,
  profile_id integer unique,
  name text not null,
  username text not null unique,
  password text not null,
  role text not null check (role in ('guest', 'user', 'admin')),
  email text unique,
  phone text,
  nationality text,
  country_code text check (country_code is null or country_code in ('VN', 'JP')),
  age integer check (age is null or age >= 0),
  gender text,
  address text,
  destination text,
  birth_date text,
  avatar text,
  id_card_image text,
  id_card_front_image text,
  id_card_back_image text,
  id_card_selfie_image text,
  avatar_color text,
  avatar_emoji text,
  online boolean not null default false,
  account_status text,
  verification_status text,
  languages text[] not null default '{}',
  interests text[] not null default '{}',
  personality text[] not null default '{}',
  gallery text[] not null default '{}',
  bio text,
  match_rate integer not null default 0 check (match_rate between 0 and 100),
  connections integer not null default 0,
  message_count integer not null default 0,
  unread integer not null default 0,
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profile_admin_overrides (
  id integer primary key,
  profile_id text references profiles(id) on delete set null,
  name text not null,
  email text not null,
  status text not null,
  verified boolean not null default false,
  report_count integer not null default 0
);

create table if not exists match_requests (
  id integer primary key,
  user_id text not null references profiles(id) on delete cascade,
  name text not null,
  destination text,
  intro text,
  avatar_color text,
  avatar_emoji text,
  country_code text check (country_code is null or country_code in ('VN', 'JP')),
  created_at timestamptz not null default now()
);

create table if not exists friendships (
  user_id text not null references profiles(id) on delete cascade,
  friend_id text not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists friend_requests (
  id text primary key,
  from_user_id text not null references profiles(id) on delete cascade,
  to_user_id text not null references profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'skipped', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user_id <> to_user_id)
);

create table if not exists notifications (
  id text primary key,
  user_id text not null references profiles(id) on delete cascade,
  type text not null check (type in ('friend_request', 'friend_request_accepted', 'friend_request_rejected', 'message', 'report', 'verification', 'account_locked')),
  from_user_id text references profiles(id) on delete set null,
  request_id text references friend_requests(id) on delete set null,
  thread_id text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

do $$
begin
  delete from notifications where type = 'review';
  alter table notifications drop constraint if exists notifications_type_check;
  alter table notifications
    add constraint notifications_type_check
    check (type in ('friend_request', 'friend_request_accepted', 'friend_request_rejected', 'message', 'report', 'verification', 'account_locked'));
end;
$$;

create table if not exists chat_threads (
  id text primary key,
  last_message text not null default '',
  legacy_user_id text references profiles(id) on delete set null,
  legacy_unread integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_thread_participants (
  thread_id text not null references chat_threads(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  unread_count integer not null default 0,
  primary key (thread_id, user_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_thread_fk'
      and conrelid = 'notifications'::regclass
  ) then
    alter table notifications
      add constraint notifications_thread_fk
      foreign key (thread_id) references chat_threads(id) on delete set null;
  end if;
end;
$$;

create table if not exists chat_messages (
  id text primary key,
  thread_id text not null references chat_threads(id) on delete cascade,
  sender_id text not null references profiles(id) on delete cascade,
  text text not null,
  message_type text not null default 'text' check (message_type in ('text', 'emoji')),
  display_time text,
  created_at timestamptz not null default now()
);

create table if not exists call_sessions (
  id text primary key,
  caller_id text not null references profiles(id) on delete cascade,
  receiver_id text not null references profiles(id) on delete cascade,
  thread_id text references chat_threads(id) on delete cascade,
  call_type text not null default 'audio' check (call_type in ('audio')),
  status text not null default 'ringing' check (status in ('ringing', 'accepted', 'rejected', 'ended', 'missed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz,
  check (caller_id <> receiver_id)
);

create table if not exists call_signals (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references call_sessions(id) on delete cascade,
  sender_id text not null references profiles(id) on delete cascade,
  receiver_id text not null references profiles(id) on delete cascade,
  signal_type text not null check (signal_type in ('offer', 'answer', 'ice-candidate')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create table if not exists reports (
  id text primary key,
  reporter_user_id text references profiles(id) on delete set null,
  target_user_id text references profiles(id) on delete set null,
  reporter_name text not null,
  target_name text not null,
  report_date date,
  reason text not null,
  detail text not null,
  evidence_image text,
  status text not null,
  source text not null default 'app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  update reports set status = '対応済み' where status = '利用停止';
  alter table reports drop constraint if exists reports_status_check;
  alter table reports
    add constraint reports_status_check
    check (status in ('確認待ち', '却下', '対応済み'));
end;
$$;

create or replace function refresh_confirmed_report_count(_profile_id text)
returns void
language plpgsql
as $$
declare
  confirmed_count integer;
begin
  if _profile_id is null then
    return;
  end if;

  select count(*)
    into confirmed_count
  from reports
  where target_user_id = _profile_id
    and status = '対応済み';

  update profiles
  set
    report_count = confirmed_count,
    account_status = case when confirmed_count >= 3 then '利用停止' else account_status end
  where id = _profile_id;

  update profile_admin_overrides
  set
    report_count = confirmed_count,
    status = case when confirmed_count >= 3 then '利用停止' else status end
  where profile_id = _profile_id;
end;
$$;

create or replace function reports_refresh_confirmed_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform refresh_confirmed_report_count(old.target_user_id);
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    perform refresh_confirmed_report_count(new.target_user_id);
    return new;
  end if;

  return old;
end;
$$;

drop trigger if exists reports_refresh_confirmed_count_trigger on reports;
create trigger reports_refresh_confirmed_count_trigger
after insert or update of status, target_user_id or delete on reports
for each row
execute function reports_refresh_confirmed_count();

create table if not exists verification_requests (
  id text primary key,
  user_id text references profiles(id) on delete set null,
  user_name text not null,
  email text,
  birth_date text,
  submitted_at text,
  application_date date,
  id_card_image text,
  id_card_front_image text,
  id_card_back_image text,
  id_card_selfie_image text,
  profile_snapshot jsonb,
  status text not null,
  avatar_emoji text,
  avatar_color text,
  source text not null default 'app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reference_options (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  value text not null,
  sort_order integer not null default 0,
  unique (kind, value)
);

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_country_code_idx on profiles(country_code);
create index if not exists profiles_age_idx on profiles(age);
create index if not exists profiles_verification_status_idx on profiles(verification_status);
create index if not exists friend_requests_to_status_idx on friend_requests(to_user_id, status);
create index if not exists friend_requests_from_status_idx on friend_requests(from_user_id, status);
create index if not exists notifications_user_read_created_idx on notifications(user_id, is_read, created_at desc);
create index if not exists chat_messages_thread_created_idx on chat_messages(thread_id, created_at);
create index if not exists chat_thread_participants_user_idx on chat_thread_participants(user_id);
create index if not exists call_sessions_receiver_status_idx on call_sessions(receiver_id, status, created_at desc);
create index if not exists call_sessions_caller_status_idx on call_sessions(caller_id, status, created_at desc);
create index if not exists call_signals_session_receiver_idx on call_signals(session_id, receiver_id, created_at);
create index if not exists reports_target_status_idx on reports(target_user_id, status);
create index if not exists verification_requests_user_status_idx on verification_requests(user_id, status);
create index if not exists reference_options_kind_idx on reference_options(kind, sort_order);

alter table profiles add column if not exists id_card_image text;
alter table profiles add column if not exists country_code text;
alter table profiles add column if not exists id_card_front_image text;
alter table profiles add column if not exists id_card_back_image text;
alter table profiles add column if not exists id_card_selfie_image text;
alter table verification_requests add column if not exists id_card_image text;
alter table verification_requests add column if not exists id_card_front_image text;
alter table verification_requests add column if not exists id_card_back_image text;
alter table verification_requests add column if not exists id_card_selfie_image text;
alter table verification_requests add column if not exists profile_snapshot jsonb;
alter table verification_requests drop column if exists media_placeholder;
drop table if exists reviews;

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('pics', 'pics', true)
    on conflict (id) do update set public = excluded.public;
  end if;
end;
$$;

do $$
begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists pics_public_read on storage.objects';
    execute 'drop policy if exists pics_public_insert on storage.objects';
    execute 'drop policy if exists pics_public_update on storage.objects';
    execute 'drop policy if exists pics_public_delete on storage.objects';
    execute 'create policy pics_public_read on storage.objects for select to anon, authenticated using (bucket_id = ''pics'')';
    execute 'create policy pics_public_insert on storage.objects for insert to anon, authenticated with check (bucket_id = ''pics'')';
    execute 'create policy pics_public_update on storage.objects for update to anon, authenticated using (bucket_id = ''pics'') with check (bucket_id = ''pics'')';
    execute 'create policy pics_public_delete on storage.objects for delete to anon, authenticated using (bucket_id = ''pics'')';
  end if;
end;
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists friend_requests_set_updated_at on friend_requests;
create trigger friend_requests_set_updated_at
before update on friend_requests
for each row execute function set_updated_at();

drop trigger if exists chat_threads_set_updated_at on chat_threads;
create trigger chat_threads_set_updated_at
before update on chat_threads
for each row execute function set_updated_at();

drop trigger if exists call_sessions_set_updated_at on call_sessions;
create trigger call_sessions_set_updated_at
before update on call_sessions
for each row execute function set_updated_at();

drop trigger if exists reports_set_updated_at on reports;
create trigger reports_set_updated_at
before update on reports
for each row execute function set_updated_at();

drop trigger if exists verification_requests_set_updated_at on verification_requests;
create trigger verification_requests_set_updated_at
before update on verification_requests
for each row execute function set_updated_at();
