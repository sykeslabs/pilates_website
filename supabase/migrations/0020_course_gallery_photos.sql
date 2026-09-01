-- Extra photos for the slider shown only on the /courses detail page.
-- Existing photo_url stays the first slide; these add up to 6 more.

alter table public.course_types
  add column photo_2_url text,
  add column photo_3_url text,
  add column photo_4_url text,
  add column photo_5_url text,
  add column photo_6_url text,
  add column photo_7_url text;

notify pgrst, 'reload schema';
