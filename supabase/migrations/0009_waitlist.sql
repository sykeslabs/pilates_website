-- Lets a visitor ask to be added to a waitlist when a slot is full.
-- No capacity/concurrency logic needed here (unlike book_slot), so a plain
-- anon insert policy is enough -- no SECURITY DEFINER function required.

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.availability_slots (id) on delete cascade,
  participant_name text not null,
  email text not null,
  phone text,
  remark text,
  status text not null default 'waiting' check (status in ('waiting', 'notified', 'converted', 'cancelled')),
  created_at timestamptz not null default now()
);

create index waitlist_entries_slot_id_idx on public.waitlist_entries (slot_id);

alter table public.waitlist_entries enable row level security;

create policy "waitlist_entries_public_insert" on public.waitlist_entries
  for insert to anon with check (true);

create policy "waitlist_entries_admin_all" on public.waitlist_entries
  for all to authenticated using (true) with check (true);
