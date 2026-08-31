-- Admin-configurable homepage hero: a single conceptual row (same pattern as
-- "instructor") choosing between the default illustration, a single uploaded
-- photo, or a photo collage (2-4 photos, arrangement adapts to however many
-- are actually filled in).

create table public.hero_section (
  id uuid primary key default gen_random_uuid(),
  layout text not null default 'illustration'
    check (layout in ('illustration', 'single_photo', 'collage')),
  photo_1_url text,
  photo_2_url text,
  photo_3_url text,
  photo_4_url text,
  updated_at timestamptz not null default now()
);

alter table public.hero_section enable row level security;

create policy "hero_section_public_read" on public.hero_section
  for select using (true);

create policy "hero_section_admin_all" on public.hero_section
  for all to authenticated using (true) with check (true);
