-- Expands photo galleries to up to 7 images (Instructor gets a new gallery
-- alongside its existing single portrait photo; Contact/location grows from
-- 4 to 7), and adds a tiny single-row settings table so the admin can swap
-- the three numbered "value" badges on /courses for photos/icons.

alter table public.instructor
  add column photo_1_url text,
  add column photo_2_url text,
  add column photo_3_url text,
  add column photo_4_url text,
  add column photo_5_url text,
  add column photo_6_url text,
  add column photo_7_url text;

alter table public.studio_info
  add column photo_5_url text,
  add column photo_6_url text,
  add column photo_7_url text;

create table public.course_page_settings (
  id uuid primary key default gen_random_uuid(),
  value_icon_1_url text,
  value_icon_2_url text,
  value_icon_3_url text,
  updated_at timestamptz not null default now()
);

alter table public.course_page_settings enable row level security;

create policy "course_page_settings_public_read" on public.course_page_settings
  for select using (true);

create policy "course_page_settings_admin_all" on public.course_page_settings
  for all to authenticated using (true) with check (true);
