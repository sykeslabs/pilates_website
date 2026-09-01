-- Optional admin-uploaded icon/photo per homepage "More than a workout"
-- benefit card (Stronger body, Better posture, Less stress, More
-- confidence). Falls back to a built-in illustrative icon when empty.

create table public.home_benefits_settings (
  id uuid primary key default gen_random_uuid(),
  icon_1_url text,
  icon_2_url text,
  icon_3_url text,
  icon_4_url text,
  updated_at timestamptz not null default now()
);

alter table public.home_benefits_settings enable row level security;

create policy "home_benefits_settings_public_read" on public.home_benefits_settings
  for select using (true);

create policy "home_benefits_settings_admin_all" on public.home_benefits_settings
  for all to authenticated using (true) with check (true);

notify pgrst, 'reload schema';
