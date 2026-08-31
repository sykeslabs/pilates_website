-- Blocks booking the same slot twice with the same email (e.g. an
-- accidental double-click, or booking the same session again later).
-- Different sessions of the same course are unaffected.

create or replace function public.book_slot(
  p_slot_id uuid,
  p_participant_name text,
  p_email text,
  p_phone text,
  p_remark text default null
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

  if exists (
    select 1 from public.bookings
    where slot_id = p_slot_id and lower(email) = lower(trim(p_email))
  ) then
    raise exception 'You already have a booking for this session.';
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

  insert into public.bookings (slot_id, participant_name, email, phone, customer_id, price_chf, remark)
  values (
    p_slot_id, trim(p_participant_name), trim(p_email), nullif(trim(p_phone), ''),
    v_customer_id, v_course.price_chf, nullif(trim(coalesce(p_remark, '')), '')
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.book_slot(uuid, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
