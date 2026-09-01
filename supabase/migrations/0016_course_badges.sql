-- Optional short marketing badge per course (e.g. "Most Popular",
-- "Best for Beginners"), shown as a small sticker on course cards.

alter table public.course_types
  add column badge_label text,
  add column badge_label_de text,
  add column badge_label_fr text;

update public.course_types set
  badge_label = 'Best for Beginners',
  badge_label_de = 'Ideal für Einsteiger',
  badge_label_fr = 'Idéal pour débuter'
where slug = 'mat-pilates';

update public.course_types set
  badge_label = 'Most Popular',
  badge_label_de = 'Am beliebtesten',
  badge_label_fr = 'Le plus populaire'
where slug = 'reformer-basics';

notify pgrst, 'reload schema';
