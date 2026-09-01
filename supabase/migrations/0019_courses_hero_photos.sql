-- Optional admin-uploaded photos for the three rotated hero images on the
-- left side of the /courses page intro (currently static placeholder SVGs).

alter table public.course_page_settings
  add column hero_photo_1_url text,
  add column hero_photo_2_url text,
  add column hero_photo_3_url text;

notify pgrst, 'reload schema';
