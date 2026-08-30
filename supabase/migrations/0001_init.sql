-- Pilates website schema: course types, success stories, availability, bookings.
-- Run this once against your Supabase project (SQL Editor), then run seed.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.course_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  photo_url text,
  duration_minutes integer not null default 60,
  capacity_default integer not null default 6,
  price_chf numeric(10, 2),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.success_stories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text not null,
  photo_url text,
  course_type_id uuid references public.course_types (id) on delete set null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  course_type_id uuid not null references public.course_types (id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity integer not null default 1,
  booked_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint availability_slots_time_check check (end_time > start_time),
  constraint availability_slots_capacity_check check (
    booked_count >= 0 and booked_count <= capacity
  )
);

create index availability_slots_course_type_id_idx on public.availability_slots (course_type_id);
create index availability_slots_start_time_idx on public.availability_slots (start_time);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.availability_slots (id) on delete cascade,
  participant_name text not null,
  email text not null,
  phone text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  payment_status text not null default 'not_required' check (
    payment_status in ('not_required', 'pending', 'paid')
  ),
  created_at timestamptz not null default now()
);

create index bookings_slot_id_idx on public.bookings (slot_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Public (anon) visitors may only read active/public rows, and may never
-- write to bookings or availability_slots directly — booking happens only
-- through the book_slot() function below, which runs with elevated
-- privileges and enforces capacity checks atomically.
--
-- Any authenticated user is treated as the site admin (this app has exactly
-- one admin account — the studio owner — created manually in Supabase Auth).
-- ---------------------------------------------------------------------------

alter table public.course_types enable row level security;
alter table public.success_stories enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;

create policy "course_types_public_read" on public.course_types
  for select using (is_active = true);

create policy "success_stories_public_read" on public.success_stories
  for select using (true);

create policy "availability_slots_public_read" on public.availability_slots
  for select using (is_active = true);

create policy "course_types_admin_all" on public.course_types
  for all to authenticated using (true) with check (true);

create policy "success_stories_admin_all" on public.success_stories
  for all to authenticated using (true) with check (true);

create policy "availability_slots_admin_all" on public.availability_slots
  for all to authenticated using (true) with check (true);

create policy "bookings_admin_all" on public.bookings
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Booking functions (SECURITY DEFINER: bypass RLS, but only do exactly what's
-- coded below — this is how anon visitors are allowed to create a booking
-- without ever getting direct write access to the bookings/availability
-- tables).
-- ---------------------------------------------------------------------------

create or replace function public.book_slot(
  p_slot_id uuid,
  p_participant_name text,
  p_email text,
  p_phone text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.availability_slots;
  v_booking public.bookings;
begin
  if p_participant_name is null or length(trim(p_participant_name)) = 0 then
    raise exception 'Name is required.';
  end if;
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Email is required.';
  end if;

  -- Row lock: if two people book the last spot at the same time, the second
  -- transaction waits here until the first commits, then re-checks capacity.
  select * into v_slot
  from public.availability_slots
  where id = p_slot_id
  for update;

  if not found then
    raise exception 'This time slot no longer exists.';
  end if;

  if not v_slot.is_active then
    raise exception 'This time slot is no longer available.';
  end if;

  if v_slot.start_time <= now() then
    raise exception 'This time slot has already passed.';
  end if;

  if v_slot.booked_count >= v_slot.capacity then
    raise exception 'This time slot is fully booked.';
  end if;

  update public.availability_slots
  set booked_count = booked_count + 1
  where id = p_slot_id;

  insert into public.bookings (slot_id, participant_name, email, phone)
  values (p_slot_id, trim(p_participant_name), trim(p_email), nullif(trim(p_phone), ''))
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.book_slot(uuid, text, text, text) to anon, authenticated;

create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;

  if not found then
    raise exception 'Booking not found.';
  end if;

  if v_booking.status = 'cancelled' then
    return v_booking;
  end if;

  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id
  returning * into v_booking;

  update public.availability_slots
  set booked_count = greatest(booked_count - 1, 0)
  where id = v_booking.slot_id;

  return v_booking;
end;
$$;

-- Admin-only: cancelling other people's bookings must not be callable by anon.
grant execute on function public.cancel_booking(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for admin-uploaded course/success-story photos.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('course-photos', 'course-photos', true)
on conflict (id) do nothing;

create policy "course_photos_public_read" on storage.objects
  for select using (bucket_id = 'course-photos');

create policy "course_photos_admin_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'course-photos');

create policy "course_photos_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'course-photos');

create policy "course_photos_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'course-photos');
