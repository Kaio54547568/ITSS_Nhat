-- Clean Japanese UTF-8 seed data for Nichietsu Friend.
-- Important: keep this file saved as UTF-8. Do not rewrite it with legacy Windows PowerShell Get-Content/Set-Content defaults.

begin;

alter table notifications drop constraint if exists notifications_type_check;
alter table notifications
  add constraint notifications_type_check
  check (type in ('friend_request', 'friend_request_accepted', 'friend_request_rejected', 'message', 'review', 'report', 'verification', 'account_locked'));

alter table profiles add column if not exists id_card_image text;
alter table verification_requests add column if not exists id_card_image text;
alter table verification_requests add column if not exists profile_snapshot jsonb;
alter table verification_requests drop column if exists media_placeholder;

truncate table reviews restart identity cascade;
truncate table chat_messages restart identity cascade;
truncate table chat_thread_participants restart identity cascade;
truncate table notifications restart identity cascade;
truncate table chat_threads restart identity cascade;
truncate table friend_requests restart identity cascade;
truncate table friendships restart identity cascade;
truncate table match_requests restart identity cascade;
truncate table reports restart identity cascade;
truncate table verification_requests restart identity cascade;
truncate table profile_admin_overrides restart identity cascade;
truncate table demo_accounts restart identity cascade;
truncate table reference_options restart identity cascade;
truncate table app_metadata restart identity cascade;
truncate table profiles restart identity cascade;

insert into app_metadata (key, value) values
('app', '{"name":"日越フレンド","subtitle":"マッチして、つながって、話そう","description":"ハノイで暮らす日本人と、日本語を学ぶベトナム人をつなぐ友達づくりアプリです。"}'::jsonb),
('authPolicy', '{"adminLoginRequiresCredentials":true,"unifiedLoginRoute":"/login"}'::jsonb),
('mainRoutes', '{"public":["/","/welcome","/login","/register"],"user":["/home","/profile","/search","/history","/chat/:id","/review/:id","/report/:id","/notifications"],"admin":["/admin","/admin/users","/admin/verification","/admin/reports"]}'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into demo_accounts (role, label, username, password, redirect_after_login) values
('user', '一般ユーザー', 'sato', 'demo', '/home'),
('admin', '管理者', 'admin', 'admin', '/admin/users')
on conflict (role, username) do update set
  label = excluded.label,
  password = excluded.password,
  redirect_after_login = excluded.redirect_after_login;

insert into profiles (
  id, profile_id, name, username, password, role, email, phone, nationality, country_code, age, gender,
  address, destination, birth_date, avatar, avatar_color, avatar_emoji, online, account_status,
  verification_status, languages, interests, personality, gallery, bio, match_rate, connections,
  message_count, unread, report_count
) values
('u1', 101, '佐藤 アレックス', 'sato', 'demo', 'user', 'sato@example.com', '090-1234-5678', 'ベトナム', 'VN', 25, 'M', 'ハノイ市バーディン区', '東京', '2001-06-06', '佐', '#F97316', '佐', false, '有効', '承認済み', array['ベトナム語','日本語']::text[], array['テクノロジー','コーヒー','写真']::text[], array['正直','クリエイティブ','聞き上手']::text[], array['ハノイ散歩','日本語クラス','カフェ','料理','旅行']::text[], '日本語を勉強しながら、ハノイで日本人の友達を作りたいです。', 95, 12, 48, 4, 0),
('u2', 102, 'グエン リン', 'linh', 'demo', 'user', 'linh@example.com', '098-555-1133', 'ベトナム', 'VN', 23, 'F', '東京、日本', '東京', '2003-05-10', 'リ', '#F97316', 'リ', false, '有効', '確認待ち', array['ベトナム語','日本語N3']::text[], array['アニメ','旅行','カフェ']::text[], array['明るい','努力家']::text[], array['渋谷散歩','大学','日本語勉強']::text[], '東京で日本語を勉強しています。休日に街歩きできる友達を探しています。', 92, 8, 0, 0, 0),
('u3', 103, '山田 美咲', 'misaki', 'demo', 'user', 'misaki@example.com', '080-2222-3322', '日本', 'JP', 28, 'F', '大阪、日本', '大阪', '1998-09-18', '美', '#14B8A6', '美', false, '有効', '承認済み', array['日本語','英語']::text[], array['旅行','読書','コーヒー']::text[], array['親切','落ち着いている']::text[], array['週末旅行','読書会','大阪城']::text[], '旅行が好きです。ベトナム語も少しずつ勉強しています。', 88, 15, 0, 0, 0),
('u4', 104, '小林 亮', 'kobayashi', 'demo', 'user', 'ryo@example.com', '070-9012-3456', '日本', 'JP', 22, 'M', '福岡、日本', 'ハノイ', '2004-12-03', '亮', '#EC4899', '亮', false, '有効', '確認待ち', array['日本語','ベトナム語初級']::text[], array['読書','写真','日本文化']::text[], array['誠実','聞き上手']::text[], array['図書館','写真','公園']::text[], '読書と写真が趣味です。日本語でゆっくり話せる友達がほしいです。', 81, 6, 0, 0, 0),
('u5', 105, 'レ アン', 'leanh', 'demo', 'user', 'leanh@example.com', '093-412-7788', 'ベトナム', 'VN', 24, 'F', 'ハノイ市ドンダー区', '名古屋', '2002-01-14', '安', '#8B5CF6', '安', false, '有効', '承認済み', array['ベトナム語','日本語N2']::text[], array['音楽','料理','テクノロジー']::text[], array['前向き','計画的']::text[], array['料理教室','ライブ','仕事']::text[], '日本の仕事文化について話したいです。', 84, 7, 0, 0, 0),
('u6', 106, 'ハリー トラン', 'harry', 'demo', 'user', 'harry@example.com', '091-777-2222', 'ベトナム', 'VN', 23, 'M', 'ハノイ市カウザイ区', '東京', '2003-08-15', '晴', '#F97316', '晴', false, '有効', '承認済み', array['ベトナム語','日本語']::text[], array['テクノロジー','コーヒー','写真']::text[], array['正直','自信満々','クリエイティブ']::text[], array['ハノイの友達','コーヒー','写真散歩']::text[], '初めて会う人とも楽しく話したいです。', 90, 14, 27, 1, 0),
('u7', 107, 'グエン マイ', 'mai', 'demo', 'user', 'mai@example.com', '096-888-1122', 'ベトナム', 'VN', 21, 'F', 'ハノイ市カウザイ区', '大阪', '2005-04-12', '舞', '#F97316', '舞', false, '有効', '確認待ち', array['ベトナム語','日本語N3']::text[], array['日本文化','読書','コーヒー']::text[], array['明るい','努力家','聞き上手']::text[], array['大学','カフェ','読書']::text[], '日本文学とカフェが好きです。日本語会話を練習したいです。', 87, 9, 16, 1, 0),
('u8', 108, '田中 悠太', 'tanaka', 'demo', 'user', 'tanaka@example.com', '080-5555-7788', '日本', 'JP', 32, 'M', 'ハノイ市タイホー区', 'ハノイ', '1994-02-09', '田', '#14B8A6', '田', false, '有効', '承認済み', array['日本語','英語','ベトナム語初級']::text[], array['料理','旅行','写真']::text[], array['落ち着いている','親切','計画的']::text[], array['ハノイ湖','料理','街歩き']::text[], 'ハノイ生活を楽しんでいます。ローカル料理を教えてくれる友達を探しています。', 83, 18, 35, 0, 0),
('u9', 109, 'ファム アン', 'an', 'demo', 'user', 'an@example.com', '094-222-3344', 'ベトナム', 'VN', 26, 'M', 'ハノイ市ドンダー区', '名古屋', '2000-07-30', '安', '#8B5CF6', '安', false, '有効', '承認済み', array['ベトナム語','日本語N2','英語']::text[], array['テクノロジー','サッカー','旅行']::text[], array['社交的','ポジティブ','誠実']::text[], array['仕事','サッカー','旅行']::text[], 'ITエンジニアです。日本の仕事文化について話したいです。', 89, 20, 42, 2, 0),
('u10', 110, '山本 さくら', 'sakura', 'demo', 'user', 'sakura@example.com', '070-3333-4444', '日本', 'JP', 27, 'F', 'ハノイ市ホアンキエム区', 'ハノイ', '1999-03-21', '桜', '#EC4899', '桜', false, '有効', '承認済み', array['日本語','ベトナム語初級']::text[], array['写真','カフェ','日本文化']::text[], array['好奇心旺盛','丁寧','聞き上手']::text[], array['旧市街','写真','湖']::text[], '旧市街の写真スポットを一緒に歩ける友達を探しています。', 86, 13, 29, 0, 0),
('u11', 111, 'チャン ミン コア', 'khoa', 'demo', 'user', 'khoa@example.com', '097-111-0099', 'ベトナム', 'VN', 29, 'M', 'ホーチミン市1区', '横浜', '1997-11-02', '光', '#0EA5E9', '光', false, '有効', '承認済み', array['ベトナム語','日本語N1']::text[], array['ビジネス','読書','ランニング']::text[], array['責任感','丁寧']::text[], array['読書会','ランニング','仕事']::text[], '日本語でビジネス会話を練習したいです。', 82, 11, 12, 0, 0),
('u12', 112, '鈴木 蓮', 'ren', 'demo', 'user', 'ren@example.com', '080-2345-6789', '日本', 'JP', 31, 'M', 'ダナン市ハイチャウ区', 'ダナン', '1995-10-19', '蓮', '#22C55E', '蓮', false, '有効', '承認済み', array['日本語','英語']::text[], array['海','写真','料理']::text[], array['穏やか','親切']::text[], array['海岸','写真','カフェ']::text[], 'ダナンで働いています。週末に写真を撮りに行きたいです。', 78, 5, 8, 0, 0),
('u13', 113, 'ド ティ ホア', 'hoa', 'demo', 'user', 'hoa@example.com', '092-888-5566', 'ベトナム', 'VN', 22, 'F', 'ハノイ市ロンビエン区', '京都', '2004-06-25', '花', '#F59E0B', '花', false, '有効', '承認済み', array['ベトナム語','日本語N4']::text[], array['茶道','歴史','読書']::text[], array['まじめ','好奇心旺盛']::text[], array['図書館','お茶','寺院']::text[], '京都文化に興味があります。', 80, 4, 5, 0, 0),
('u14', 114, '伊藤 はるか', 'haruka', 'demo', 'user', 'haruka@example.com', '070-1212-3434', '日本', 'JP', 26, 'F', 'ホーチミン市3区', 'ホーチミン', '2000-09-08', '遥', '#A855F7', '遥', false, '有効', '承認済み', array['日本語','ベトナム語初級']::text[], array['映画','カフェ','旅行']::text[], array['明るい','行動的']::text[], array['映画館','カフェ','市場']::text[], 'ベトナム映画に興味があります。', 76, 6, 7, 0, 0),
('u15', 115, 'ブイ クアン フイ', 'huy', 'demo', 'user', 'huy@example.com', '098-010-2222', 'ベトナム', 'VN', 27, 'M', 'ハノイ市ハイバーチュン区', '札幌', '1999-12-11', '輝', '#06B6D4', '輝', false, '有効', '確認待ち', array['ベトナム語','日本語N2']::text[], array['スキー','料理','音楽']::text[], array['落ち着いている','誠実']::text[], array['雪山','料理','音楽']::text[], '北海道に留学したいです。', 79, 3, 4, 0, 0),
('u16', 116, '中村 葵', 'aoi', 'demo', 'user', 'aoi@example.com', '080-3000-4000', '日本', 'JP', 24, 'F', 'ハノイ市バーディン区', 'ハノイ', '2002-05-17', '葵', '#10B981', '葵', false, '有効', '承認済み', array['日本語','英語']::text[], array['デザイン','写真','カフェ']::text[], array['クリエイティブ','丁寧']::text[], array['展示会','写真','カフェ']::text[], 'デザインと写真が好きです。', 85, 10, 13, 0, 0),
('u17', 117, 'ホアン ナム', 'nam', 'demo', 'user', 'nam@example.com', '091-101-5555', 'ベトナム', 'VN', 30, 'M', 'ホーチミン市7区', '東京', '1996-04-01', '南', '#64748B', '南', false, '有効', '承認済み', array['ベトナム語','日本語N1','英語']::text[], array['スタートアップ','読書','コーヒー']::text[], array['論理的','前向き']::text[], array['仕事','読書','カフェ']::text[], 'スタートアップについて話したいです。', 88, 16, 19, 0, 0),
('u18', 118, '森 大地', 'daichi', 'demo', 'user', 'daichi@example.com', '070-7777-9191', '日本', 'JP', 34, 'M', 'ハノイ市カウザイ区', 'ハノイ', '1992-08-22', '大', '#EF4444', '大', false, '有効', '承認済み', array['日本語','ベトナム語初級']::text[], array['ランニング','料理','旅行']::text[], array['健康的','親切']::text[], array['ランニング','料理','旅行']::text[], '朝ランできる友達を探しています。', 77, 8, 6, 0, 0),
('u19', 119, 'ヴー タイン ハー', 'ha', 'demo', 'user', 'ha@example.com', '096-232-4545', 'ベトナム', 'VN', 20, 'F', 'ダナン市ソンチャ区', '大阪', '2006-02-02', '葉', '#F43F5E', '葉', false, '有効', '確認待ち', array['ベトナム語','日本語N4']::text[], array['アニメ','音楽','写真']::text[], array['明るい','好奇心旺盛']::text[], array['海','音楽','写真']::text[], '日本のアニメが好きです。', 74, 2, 3, 0, 0),
('u20', 120, '加藤 しおり', 'shiori', 'demo', 'user', 'shiori@example.com', '080-7000-1111', '日本', 'JP', 29, 'F', 'ホーチミン市ビンタイン区', 'ホーチミン', '1997-01-29', '詩', '#84CC16', '詩', false, '有効', '承認済み', array['日本語','英語']::text[], array['本','カフェ','料理']::text[], array['穏やか','聞き上手']::text[], array['本屋','カフェ','料理']::text[], '本とカフェ巡りが好きです。', 83, 9, 10, 0, 0),
('u21', 121, 'ダン ミン チャウ', 'chau', 'demo', 'user', 'chau@example.com', '093-220-1188', 'ベトナム', 'VN', 28, 'F', 'ハノイ市ホアンマイ区', '福岡', '1998-07-07', '珠', '#3B82F6', '珠', false, '有効', '承認済み', array['ベトナム語','日本語N2']::text[], array['料理','旅行','日本文化']::text[], array['努力家','丁寧']::text[], array['料理','旅行','神社']::text[], '福岡に行く予定です。地域の話を聞きたいです。', 81, 6, 7, 0, 0),
('u22', 122, '渡辺 健', 'ken', 'demo', 'user', 'ken@example.com', '070-4466-8899', '日本', 'JP', 33, 'M', 'ハノイ市ナムトゥリエム区', 'ハノイ', '1993-05-03', '健', '#0F766E', '健', false, '有効', '承認済み', array['日本語','ベトナム語初級']::text[], array['サッカー','料理','映画']::text[], array['社交的','前向き']::text[], array['サッカー','市場','映画']::text[], '週末にサッカーをしたいです。', 79, 5, 6, 0, 0),
('u23', 123, 'ファム トゥ チャン', 'trang', 'demo', 'user', 'trang@example.com', '094-777-0001', 'ベトナム', 'VN', 24, 'F', 'ハノイ市タイホー区', '東京', '2002-10-15', '張', '#DB2777', '張', false, '有効', '承認済み', array['ベトナム語','日本語N2']::text[], array['写真','デザイン','カフェ']::text[], array['クリエイティブ','明るい']::text[], array['写真','デザイン','カフェ']::text[], '写真とデザインが好きです。', 86, 8, 9, 0, 0),
('u24', 124, '斎藤 恵美', 'emi', 'demo', 'user', 'emi@example.com', '080-8888-1212', '日本', 'JP', 25, 'F', 'ダナン市ハイチャウ区', 'ダナン', '2001-04-18', '恵', '#F97316', '恵', false, '有効', '承認済み', array['日本語','英語']::text[], array['海','ヨガ','カフェ']::text[], array['穏やか','計画的']::text[], array['海','ヨガ','カフェ']::text[], 'ダナンでヨガ友達を探しています。', 75, 4, 5, 0, 0),
('admin1', 900, '管理者', 'admin', 'admin', 'admin', 'admin@example.com', '', '日本', 'JP', 35, 'M', '運営チーム', '', '1991-01-01', '管', '#F97316', '管', false, '有効', '承認済み', array['日本語','ベトナム語']::text[], array['安全管理']::text[], array['公平','迅速']::text[], '{}'::text[], '日越フレンド運営管理者です。', 0, 0, 0, 0, 0)
on conflict (id) do update set
  profile_id = excluded.profile_id,
  name = excluded.name,
  username = excluded.username,
  password = excluded.password,
  role = excluded.role,
  email = excluded.email,
  phone = excluded.phone,
  nationality = excluded.nationality,
  country_code = excluded.country_code,
  age = excluded.age,
  gender = excluded.gender,
  address = excluded.address,
  destination = excluded.destination,
  birth_date = excluded.birth_date,
  avatar = excluded.avatar,
  avatar_color = excluded.avatar_color,
  avatar_emoji = excluded.avatar_emoji,
  online = excluded.online,
  account_status = excluded.account_status,
  verification_status = excluded.verification_status,
  languages = excluded.languages,
  interests = excluded.interests,
  personality = excluded.personality,
  gallery = excluded.gallery,
  bio = excluded.bio,
  match_rate = excluded.match_rate,
  connections = excluded.connections,
  message_count = excluded.message_count,
  unread = excluded.unread,
  report_count = excluded.report_count;

update profiles set gallery = '{}';

insert into profiles (
  id, profile_id, name, username, password, role, email, phone, nationality, country_code, age, gender,
  address, destination, birth_date, avatar, avatar_color, avatar_emoji, online, account_status,
  verification_status, languages, interests, personality, gallery, bio, match_rate, connections,
  message_count, unread, report_count
) values
('u25', 125, 'グエン ミン', 'minh', 'demo', 'user', 'minh@example.com', '097-500-1122', 'ベトナム', 'VN', 24, 'M', 'ハノイ市カウザイ区', '東京', '2002-02-20', '明', '#0EA5E9', '明', false, '未有効', '確認待ち', array['ベトナム語','日本語N3']::text[], array['テクノロジー','コーヒー','日本文化']::text[], array['努力家','丁寧']::text[], '{}'::text[], '日本企業で働くために日本語会話を練習したいです。', 72, 0, 0, 0, 0),
('u26', 126, '高橋 直人', 'naoto', 'demo', 'user', 'naoto@example.com', '080-4242-9090', '日本', 'JP', 30, 'M', 'ホーチミン市1区', 'ホーチミン', '1996-06-12', '直', '#64748B', '直', false, '未有効', '確認待ち', array['日本語','英語']::text[], array['料理','旅行','ベトナム文化']::text[], array['親切','聞き上手']::text[], '{}'::text[], 'ベトナムで暮らし始めました。ローカルの友達を作りたいです。', 70, 0, 0, 0, 0)
on conflict (id) do update set
  profile_id = excluded.profile_id,
  name = excluded.name,
  username = excluded.username,
  password = excluded.password,
  role = excluded.role,
  email = excluded.email,
  phone = excluded.phone,
  nationality = excluded.nationality,
  country_code = excluded.country_code,
  age = excluded.age,
  gender = excluded.gender,
  address = excluded.address,
  destination = excluded.destination,
  birth_date = excluded.birth_date,
  avatar = excluded.avatar,
  avatar_color = excluded.avatar_color,
  avatar_emoji = excluded.avatar_emoji,
  online = excluded.online,
  account_status = excluded.account_status,
  verification_status = excluded.verification_status,
  languages = excluded.languages,
  interests = excluded.interests,
  personality = excluded.personality,
  gallery = excluded.gallery,
  bio = excluded.bio,
  match_rate = excluded.match_rate,
  connections = excluded.connections,
  message_count = excluded.message_count,
  unread = excluded.unread,
  report_count = excluded.report_count;

update profiles
set account_status = '有効', verification_status = '認証済み'
where role = 'user';

update profiles
set account_status = '未有効', verification_status = '確認待ち'
where id in ('u25', 'u26');

update profiles
set account_status = '未有効', verification_status = '未認証'
where id = 'u24';

update profiles
set account_status = '利用停止', verification_status = '認証済み', report_count = 3
where id = 'u19';

insert into profile_admin_overrides (id, profile_id, name, email, status, verified, report_count) values
(1, 'u1', '佐藤 アレックス', 'sato@example.com', '有効', true, 0),
(2, 'u2', 'グエン リン', 'linh@example.com', '有効', false, 0),
(3, 'u3', '山田 美咲', 'misaki@example.com', '有効', true, 0),
(4, 'u4', '小林 亮', 'ryo@example.com', '有効', false, 0),
(5, 'u9', 'ファム アン', 'an@example.com', '有効', true, 0),
(6, 'u15', 'ブイ クアン フイ', 'huy@example.com', '有効', false, 0),
(7, 'u19', 'ヴー タイン ハー', 'ha@example.com', '有効', false, 0),
(8, 'u22', '渡辺 健', 'ken@example.com', '有効', true, 1)
on conflict (id) do update set profile_id = excluded.profile_id, name = excluded.name, email = excluded.email, status = excluded.status, verified = excluded.verified, report_count = excluded.report_count;

insert into profile_admin_overrides (id, profile_id, name, email, status, verified, report_count)
select
  profile_id,
  id,
  name,
  coalesce(email, ''),
  coalesce(account_status, '未有効'),
  verification_status = '認証済み',
  report_count
from profiles
where role = 'user' and profile_id is not null
on conflict (id) do update set
  profile_id = excluded.profile_id,
  name = excluded.name,
  email = excluded.email,
  status = excluded.status,
  verified = excluded.verified,
  report_count = excluded.report_count;

insert into match_requests (id, user_id, name, destination, intro, avatar_color, avatar_emoji, country_code) values
(301, 'u2', 'グエン リン', '東京', '東京で日本語を勉強しています。', '#F97316', 'リ', 'VN'),
(302, 'u3', '山田 美咲', '大阪', '旅行が好きで、ベトナム語も勉強中です。', '#14B8A6', '美', 'JP'),
(303, 'u4', '小林 亮', 'ハノイ', '読書と写真が趣味です。', '#EC4899', '亮', 'JP')
on conflict (id) do update set user_id = excluded.user_id, name = excluded.name, destination = excluded.destination, intro = excluded.intro, avatar_color = excluded.avatar_color, avatar_emoji = excluded.avatar_emoji, country_code = excluded.country_code;

insert into friendships (user_id, friend_id, created_at) values
('u1', 'u6', '2026-05-18T08:00:00+07:00'), ('u6', 'u1', '2026-05-18T08:00:00+07:00'),
('u1', 'u7', '2026-05-18T09:00:00+07:00'), ('u7', 'u1', '2026-05-18T09:00:00+07:00'),
('u1', 'u8', '2026-05-18T10:00:00+07:00'), ('u8', 'u1', '2026-05-18T10:00:00+07:00'),
('u1', 'u9', '2026-05-18T11:00:00+07:00'), ('u9', 'u1', '2026-05-18T11:00:00+07:00'),
('u1', 'u10', '2026-05-18T12:00:00+07:00'), ('u10', 'u1', '2026-05-18T12:00:00+07:00'),
('u1', 'u11', '2026-05-18T13:00:00+07:00'), ('u11', 'u1', '2026-05-18T13:00:00+07:00'),
('u12', 'u13', '2026-05-17T08:00:00+07:00'), ('u13', 'u12', '2026-05-17T08:00:00+07:00'),
('u14', 'u15', '2026-05-17T09:00:00+07:00'), ('u15', 'u14', '2026-05-17T09:00:00+07:00'),
('u16', 'u17', '2026-05-17T10:00:00+07:00'), ('u17', 'u16', '2026-05-17T10:00:00+07:00'),
('u20', 'u21', '2026-05-17T11:00:00+07:00'), ('u21', 'u20', '2026-05-17T11:00:00+07:00')
on conflict (user_id, friend_id) do nothing;

insert into friend_requests (id, from_user_id, to_user_id, status, created_at, updated_at) values
('request_u2_u1', 'u2', 'u1', 'pending', '2026-05-19T09:00:00+07:00', '2026-05-19T09:00:00+07:00'),
('request_u3_u1', 'u3', 'u1', 'pending', '2026-05-19T09:10:00+07:00', '2026-05-19T09:10:00+07:00'),
('request_u4_u1', 'u4', 'u1', 'pending', '2026-05-19T09:20:00+07:00', '2026-05-19T09:20:00+07:00'),
('request_u1_u5', 'u1', 'u5', 'pending', '2026-05-19T10:00:00+07:00', '2026-05-19T10:00:00+07:00'),
('request_u23_u20', 'u23', 'u20', 'pending', '2026-05-19T11:00:00+07:00', '2026-05-19T11:00:00+07:00'),
('request_u22_u23', 'u22', 'u23', 'skipped', '2026-05-18T11:00:00+07:00', '2026-05-18T12:00:00+07:00')
on conflict (id) do update set from_user_id = excluded.from_user_id, to_user_id = excluded.to_user_id, status = excluded.status, updated_at = excluded.updated_at;

insert into chat_threads (id, last_message, legacy_user_id, legacy_unread, created_at, updated_at) values
('thread_u1_u6', '今週末、コーヒーに行きましょう。', null, 0, '2026-05-18T08:05:00+07:00', '2026-05-19T08:30:00+07:00'),
('thread_u1_u7', '日本文学の本を一冊おすすめします。', null, 0, '2026-05-18T09:05:00+07:00', '2026-05-19T08:45:00+07:00'),
('thread_u1_u8', 'フォーのお店、ありがとうございます。', null, 0, '2026-05-18T10:05:00+07:00', '2026-05-19T09:05:00+07:00'),
('thread_u1_u9', '仕事文化の話、とても参考になりました。', null, 0, '2026-05-18T11:05:00+07:00', '2026-05-19T09:25:00+07:00'),
('thread_u1_u10', '旧市街の写真スポットに行きたいです。', null, 0, '2026-05-18T12:05:00+07:00', '2026-05-19T09:40:00+07:00'),
('thread_u1_u11', '来週、ビジネス日本語を練習しましょう。', null, 0, '2026-05-18T13:05:00+07:00', '2026-05-19T10:05:00+07:00'),
('thread_u12_u13', '京都のおすすめを送ります。', null, 0, '2026-05-17T08:10:00+07:00', '2026-05-17T08:40:00+07:00'),
('thread_u14_u15', '北海道の冬は本当にきれいです。', null, 0, '2026-05-17T09:10:00+07:00', '2026-05-17T09:40:00+07:00')
on conflict (id) do update set last_message = excluded.last_message, legacy_user_id = excluded.legacy_user_id, legacy_unread = excluded.legacy_unread, updated_at = excluded.updated_at;

insert into chat_thread_participants (thread_id, user_id, unread_count) values
('thread_u1_u6', 'u1', 1), ('thread_u1_u6', 'u6', 0),
('thread_u1_u7', 'u1', 1), ('thread_u1_u7', 'u7', 0),
('thread_u1_u8', 'u1', 0), ('thread_u1_u8', 'u8', 0),
('thread_u1_u9', 'u1', 2), ('thread_u1_u9', 'u9', 0),
('thread_u1_u10', 'u1', 0), ('thread_u1_u10', 'u10', 0),
('thread_u1_u11', 'u1', 0), ('thread_u1_u11', 'u11', 0),
('thread_u12_u13', 'u12', 0), ('thread_u12_u13', 'u13', 1),
('thread_u14_u15', 'u14', 0), ('thread_u14_u15', 'u15', 1)
on conflict (thread_id, user_id) do update set unread_count = excluded.unread_count;

insert into chat_messages (id, thread_id, sender_id, text, message_type, display_time, created_at) values
('msg_u1_u6_1', 'thread_u1_u6', 'u1', 'ハリーさん、ハノイでおすすめのカフェはありますか？', 'text', null, '2026-05-19T08:20:00+07:00'),
('msg_u1_u6_2', 'thread_u1_u6', 'u6', 'あります。今週末、コーヒーに行きましょう。', 'text', null, '2026-05-19T08:30:00+07:00'),
('msg_u1_u7_1', 'thread_u1_u7', 'u7', '日本文学の本を探しています。', 'text', null, '2026-05-19T08:40:00+07:00'),
('msg_u1_u7_2', 'thread_u1_u7', 'u1', '日本文学の本を一冊おすすめします。', 'text', null, '2026-05-19T08:45:00+07:00'),
('msg_u1_u8_1', 'thread_u1_u8', 'u8', 'ローカル料理ならフォーのお店がいいですよ。', 'text', null, '2026-05-19T09:00:00+07:00'),
('msg_u1_u8_2', 'thread_u1_u8', 'u1', 'フォーのお店、ありがとうございます。', 'text', null, '2026-05-19T09:05:00+07:00'),
('msg_u1_u9_1', 'thread_u1_u9', 'u9', '日本の職場では会議前の準備が大切です。', 'text', null, '2026-05-19T09:15:00+07:00'),
('msg_u1_u9_2', 'thread_u1_u9', 'u9', '仕事文化の話、とても参考になりました。', 'text', null, '2026-05-19T09:25:00+07:00'),
('msg_u1_u10_1', 'thread_u1_u10', 'u10', '旧市街の写真スポットに行きたいです。', 'text', null, '2026-05-19T09:40:00+07:00'),
('msg_u1_u11_1', 'thread_u1_u11', 'u11', '来週、ビジネス日本語を練習しましょう。', 'text', null, '2026-05-19T10:05:00+07:00'),
('msg_u12_u13_1', 'thread_u12_u13', 'u12', '京都のおすすめを送ります。', 'text', null, '2026-05-17T08:40:00+07:00'),
('msg_u14_u15_1', 'thread_u14_u15', 'u14', '北海道の冬は本当にきれいです。', 'text', null, '2026-05-17T09:40:00+07:00')
on conflict (id) do update set text = excluded.text, message_type = excluded.message_type, display_time = excluded.display_time, created_at = excluded.created_at;

insert into notifications (id, user_id, type, from_user_id, request_id, thread_id, message, is_read, created_at) values
('notification_request_u2_u1', 'u1', 'friend_request', 'u2', 'request_u2_u1', null, 'グエン リンさんから友達申請が届きました', false, '2026-05-19T09:00:00+07:00'),
('notification_request_u3_u1', 'u1', 'friend_request', 'u3', 'request_u3_u1', null, '山田 美咲さんから友達申請が届きました', false, '2026-05-19T09:10:00+07:00'),
('notification_request_u4_u1', 'u1', 'friend_request', 'u4', 'request_u4_u1', null, '小林 亮さんから友達申請が届きました', false, '2026-05-19T09:20:00+07:00'),
('notification_message_u6_u1', 'u1', 'message', 'u6', null, 'thread_u1_u6', '新しいメッセージが届きました', false, '2026-05-19T08:30:00+07:00'),
('notification_message_u9_u1', 'u1', 'message', 'u9', null, 'thread_u1_u9', '新しいメッセージが届きました', false, '2026-05-19T09:25:00+07:00'),
('notification_request_u1_u5', 'u5', 'friend_request', 'u1', 'request_u1_u5', null, '佐藤 アレックスさんから友達申請が届きました', false, '2026-05-19T10:00:00+07:00'),
('notification_accept_u6_u1', 'u1', 'friend_request_accepted', 'u6', null, null, 'ハリー トランさんがマッチング申請を承認しました', true, '2026-05-18T08:00:00+07:00'),
('notification_accept_u7_u1', 'u1', 'friend_request_accepted', 'u7', null, null, 'グエン マイさんがマッチング申請を承認しました', true, '2026-05-18T09:00:00+07:00'),
('notification_accept_u8_u1', 'u1', 'friend_request_accepted', 'u8', null, null, '田中 悠太さんがマッチング申請を承認しました', true, '2026-05-18T10:00:00+07:00'),
('notification_accept_u9_u1', 'u1', 'friend_request_accepted', 'u9', null, null, 'ファム アンさんがマッチング申請を承認しました', true, '2026-05-18T11:00:00+07:00'),
('notification_accept_u10_u1', 'u1', 'friend_request_accepted', 'u10', null, null, '山本 さくらさんがマッチング申請を承認しました', true, '2026-05-18T12:00:00+07:00'),
('notification_accept_u11_u1', 'u1', 'friend_request_accepted', 'u11', null, null, 'チャン ミン コアさんがマッチング申請を承認しました', true, '2026-05-18T13:00:00+07:00'),
('notification_verification_u1', 'u1', 'verification', 'admin1', null, null, 'アカウント認証が承認されました', true, '2026-05-18T07:40:00+07:00'),
('notification_review_u6_u1', 'u1', 'review', 'u6', null, null, '評価情報が届きました', true, '2026-05-19T12:00:00+07:00'),
('notification_reject_u23_u22', 'u22', 'friend_request_rejected', 'u23', 'request_u22_u23', null, 'ファム トゥ チャンさんがマッチング申請を拒否しました', true, '2026-05-18T12:00:00+07:00'),
('notification_locked_u19', 'u19', 'account_locked', 'admin1', null, null, '通報が3件以上になったため、アカウントが利用停止になりました', false, '2026-05-06T18:00:00+07:00')
on conflict (id) do update set message = excluded.message, is_read = excluded.is_read, thread_id = excluded.thread_id;

insert into reports (id, reporter_user_id, target_user_id, reporter_name, target_name, report_date, reason, detail, evidence_image, status, source) values
('r1', 'u22', 'u19', '渡辺 健', 'ヴー タイン ハー', '2026-05-02', 'スパム・詐欺', '外部サイトへの登録を何度も勧められました。', null, '対応済み', 'seed'),
('r2', 'u14', 'u15', '伊藤 はるか', 'ブイ クアン フイ', '2026-05-04', '不適切な行動', '初対面で不快な表現がありました。', null, '対応済み', 'seed'),
('r3', 'u3', 'u4', '山田 美咲', '小林 亮', '2026-04-28', '偽プロフィール', 'プロフィール情報に差がある可能性があります。', null, '却下', 'seed'),
('r4', 'u10', 'u19', '山本 さくら', 'ヴー タイン ハー', '2026-05-05', '嫌がらせ', '何度も不快なメッセージを送られました。', null, '対応済み', 'seed'),
('r5', 'u8', 'u19', '田中 悠太', 'ヴー タイン ハー', '2026-05-06', 'スパム・詐欺', '外部サービスへの誘導がありました。', null, '対応済み', 'seed')
on conflict (id) do update set status = excluded.status, detail = excluded.detail, updated_at = now();

insert into verification_requests (id, user_id, user_name, email, birth_date, submitted_at, application_date, status, avatar_emoji, avatar_color, source) values
('v1', 'u1', '佐藤 アレックス', 'sato@example.com', '2001-06-06', '2026-05-01 09:00', '2026-05-01', '認証済み', '佐', '#F97316', 'seed'),
('v2', 'u3', '山田 美咲', 'misaki@example.com', '1998-09-18', '2026-05-01 10:20', '2026-05-01', '認証済み', '美', '#14B8A6', 'seed'),
('v3', 'u24', '斎藤 恵美', 'emi@example.com', '2001-04-18', '2026-05-03 15:12', '2026-05-03', '未認証', '恵', '#F97316', 'seed'),
('v4', 'u25', 'グエン ミン', 'minh@example.com', '2002-02-20', '2026-05-27 21:20', '2026-05-27', '確認待ち', '明', '#0EA5E9', 'seed'),
('v5', 'u26', '高橋 直人', 'naoto@example.com', '1996-06-12', '2026-05-27 21:30', '2026-05-27', '確認待ち', '直', '#64748B', 'seed')
on conflict (id) do update set status = excluded.status, updated_at = now();

update verification_requests vr
set
  id_card_image = p.id_card_image,
  profile_snapshot = jsonb_build_object(
    'name', p.name,
    'phone', p.phone,
    'email', p.email,
    'address', p.address,
    'birthDate', p.birth_date,
    'gender', p.gender,
    'bio', p.bio,
    'languages', p.languages,
    'interests', p.interests,
    'personality', p.personality,
    'avatar', p.avatar,
    'idCardImage', p.id_card_image
  )
from profiles p
where p.id = vr.user_id;

insert into reviews (reviewer_user_id, target_user_id, rating, feedback, submitted_at) values
('u1', 'u6', 5, '会話が丁寧で楽しかったです。', '2026-05-19T12:00:00+07:00'),
('u8', 'u1', 4, '日本語の練習に前向きでした。', '2026-05-19T12:10:00+07:00'),
('u10', 'u1', 5, '写真の話で盛り上がりました。', '2026-05-19T12:20:00+07:00');

insert into reference_options (kind, value, sort_order) values
('language', 'ベトナム語', 1),
('language', '日本語', 2),
('language', '英語', 3),
('language', '日本語N1', 4),
('language', '日本語N2', 5),
('language', '日本語N3', 6),
('language', '日本語N4', 7),
('language', 'ベトナム語初級', 8),
('interest', 'テクノロジー', 1),
('interest', 'コーヒー', 2),
('interest', '写真', 3),
('interest', '旅行', 4),
('interest', '読書', 5),
('interest', '料理', 6),
('interest', '日本文化', 7),
('interest', 'カフェ', 8),
('interest', 'サッカー', 9),
('interest', 'アニメ', 10),
('interest', 'デザイン', 11),
('interest', '映画', 12),
('interest', '音楽', 13),
('interest', 'ランニング', 14),
('interest', 'ビジネス', 15),
('interest', '海', 16),
('interest', 'ヨガ', 17),
('interest', 'スキー', 18),
('interest', '茶道', 19),
('interest', '歴史', 20),
('interest', '本', 21),
('interest', 'スタートアップ', 22),
('interest', 'ベトナム文化', 23),
('personality', '正直', 1),
('personality', 'クリエイティブ', 2),
('personality', '聞き上手', 3),
('personality', '明るい', 4),
('personality', '努力家', 5),
('personality', '親切', 6),
('personality', '落ち着いている', 7),
('personality', '誠実', 8),
('personality', '前向き', 9),
('personality', '丁寧', 10),
('personality', '自信満々', 11),
('personality', '計画的', 12),
('personality', '社交的', 13),
('personality', 'ポジティブ', 14),
('personality', '責任感', 15),
('personality', 'まじめ', 16),
('personality', '好奇心旺盛', 17),
('personality', '行動的', 18),
('personality', '論理的', 19),
('personality', '健康的', 20),
('report_reason', '不適切な行動', 1),
('report_reason', 'スパム・詐欺', 2),
('report_reason', '偽プロフィール', 3),
('report_reason', '嫌がらせ', 4),
('report_reason', 'その他', 5),
('conversation_topic', '食べ物', 1),
('conversation_topic', '勉強', 2),
('conversation_topic', '旅行', 3),
('conversation_topic', '日本語', 4),
('conversation_topic', 'ベトナム文化', 5),
('conversation_topic', '今週末、コーヒーでも飲みに行きましょう。', 6),
('conversation_topic', '最近の仕事はどうですか？', 7),
('conversation_topic', '好きな食べ物は何ですか？', 8),
('conversation_topic', '週末は何をしていますか？', 9),
('emoji', '😀', 1),
('emoji', '😊', 2),
('emoji', '😂', 3),
('emoji', '😍', 4),
('emoji', '🥰', 5),
('emoji', '😎', 6),
('emoji', '👍', 7),
('emoji', '👏', 8),
('emoji', '🙏', 9),
('emoji', '🎉', 10),
('emoji', '✨', 11),
('emoji', '☕', 12),
('emoji', '📷', 13),
('emoji', '🌸', 14),
('emoji', '🍜', 15),
('emoji', '🍣', 16),
('emoji', '🎧', 17),
('emoji', '📚', 18),
('emoji', '✈️', 19),
('emoji', '🇯🇵', 20),
('emoji', '🇻🇳', 21),
('emoji', '❤️', 22),
('emoji', '🔥', 23),
('emoji', '⭐', 24),
('demo_route_public', '/', 1),
('demo_route_public', '/welcome', 2),
('demo_route_public', '/login', 3),
('demo_route_public', '/register', 4),
('demo_route_user', '/home', 1),
('demo_route_user', '/profile', 2),
('demo_route_user', '/search', 3),
('demo_route_user', '/history', 4),
('demo_route_user', '/chat/:id', 5),
('demo_route_user', '/review/:id', 6),
('demo_route_user', '/report/:id', 7),
('demo_route_user', '/notifications', 8),
('demo_route_admin', '/admin', 1),
('demo_route_admin', '/admin/users', 2),
('demo_route_admin', '/admin/verification', 3),
('demo_route_admin', '/admin/reports', 4)
on conflict (kind, value) do update set sort_order = excluded.sort_order;

commit;
