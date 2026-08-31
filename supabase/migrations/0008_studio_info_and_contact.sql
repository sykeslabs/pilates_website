-- Studio contact/location info (single conceptual row, same pattern as
-- "instructor"/"hero_section") and a contact-message inbox.

create table public.studio_info (
  id uuid primary key default gen_random_uuid(),
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  photo_1_url text,
  photo_2_url text,
  photo_3_url text,
  photo_4_url text,
  updated_at timestamptz not null default now()
);

alter table public.studio_info enable row level security;

create policy "studio_info_public_read" on public.studio_info
  for select using (true);

create policy "studio_info_admin_all" on public.studio_info
  for all to authenticated using (true) with check (true);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anon may submit the form (insert) but never read others' messages back.
create policy "contact_messages_public_insert" on public.contact_messages
  for insert to anon with check (true);

create policy "contact_messages_admin_all" on public.contact_messages
  for all to authenticated using (true) with check (true);
