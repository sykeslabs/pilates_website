-- Adds a Customer entity, a price snapshot on bookings, and an explicit
-- class_type on course_types. Additive only.

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;

-- No anon policy at all: customers is only ever written to via book_slot()'s
-- SECURITY DEFINER upsert below, same pattern as bookings/availability_slots.
create policy "customers_admin_all" on public.customers
  for all to authenticated using (true) with check (true);

alter table public.bookings
  add column customer_id uuid references public.customers (id) on delete set null,
  add column price_chf numeric(10, 2);

alter table public.course_types
  add column class_type text not null default 'group'
    check (class_type in ('group', 'private', 'semi_private'));

update public.course_types set class_type = 'private' where slug = 'private-1-1';

-- ---------------------------------------------------------------------------
-- Backfill existing bookings (best-effort — the price actually charged at
-- booking time isn't recoverable, so this approximates it with the course's
-- *current* price).
-- ---------------------------------------------------------------------------

insert into public.customers (name, email, phone)
select distinct on (lower(b.email))
  b.participant_name, lower(b.email), b.phone
from public.bookings b
order by lower(b.email), b.created_at desc
on conflict (email) do nothing;

update public.bookings b
set customer_id = c.id
from public.customers c
where lower(b.email) = c.email and b.customer_id is null;

update public.bookings b
set price_chf = ct.price_chf
from public.availability_slots s
join public.course_types ct on ct.id = s.course_type_id
where b.slot_id = s.id and b.price_chf is null;

-- ---------------------------------------------------------------------------
-- book_slot(): same signature and capacity/row-lock logic as before, now
-- also upserting a customer record and snapshotting the price charged.
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
  v_course public.course_types;
  v_customer_id uuid;
  v_booking public.bookings;
begin
  if p_participant_name is null or length(trim(p_participant_name)) = 0 then
    raise exception 'Name is required.';
  end if;
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Email is required.';
  end if;

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

  select * into v_course from public.course_types where id = v_slot.course_type_id;

  insert into public.customers (name, email, phone)
  values (trim(p_participant_name), lower(trim(p_email)), nullif(trim(p_phone), ''))
  on conflict (email) do update
    set name = excluded.name,
        phone = coalesce(excluded.phone, public.customers.phone)
  returning id into v_customer_id;

  update public.availability_slots
  set booked_count = booked_count + 1
  where id = p_slot_id;

  insert into public.bookings (slot_id, participant_name, email, phone, customer_id, price_chf)
  values (
    p_slot_id, trim(p_participant_name), trim(p_email), nullif(trim(p_phone), ''),
    v_customer_id, v_course.price_chf
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.book_slot(uuid, text, text, text) to anon, authenticated;
