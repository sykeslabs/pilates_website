-- Adds a short "brief_description" to course_types (shown on the homepage;
-- the existing "description" becomes the full text shown on /courses), and
-- a "title" headline to success_stories (shown above the quote).

alter table public.course_types
  add column brief_description text not null default '',
  add column brief_description_de text not null default '',
  add column brief_description_fr text not null default '';

alter table public.success_stories
  add column title text not null default '',
  add column title_de text not null default '',
  add column title_fr text not null default '';

-- Backfill placeholder content for the existing seeded rows.

update public.course_types set
  brief_description = 'A full-body, low-impact class for every fitness level.',
  brief_description_de = 'Ein Ganzkörpertraining mit geringer Belastung für jedes Fitnesslevel.',
  brief_description_fr = 'Un cours complet à faible impact, pour tous les niveaux.'
where slug = 'mat-pilates';

update public.course_types set
  brief_description = 'Small-group strength training on the reformer machine.',
  brief_description_de = 'Krafttraining am Reformer-Gerät in kleinen Gruppen.',
  brief_description_fr = 'Renforcement musculaire sur reformer, en petit groupe.'
where slug = 'reformer-basics';

update public.course_types set
  brief_description = 'A gentle, safe class designed for every stage of pregnancy.',
  brief_description_de = 'Ein sanfter, sicherer Kurs für jede Phase der Schwangerschaft.',
  brief_description_fr = 'Un cours doux et sûr, adapté à chaque étape de la grossesse.'
where slug = 'prenatal-pilates';

update public.course_types set
  brief_description = 'One-on-one sessions tailored entirely to your goals.',
  brief_description_de = 'Einzelstunden, ganz auf deine Ziele zugeschnitten.',
  brief_description_fr = 'Des séances individuelles entièrement adaptées à vos objectifs.'
where slug = 'private-1-1';

update public.success_stories set
  title = 'From constant back pain to Monday motivation',
  title_de = 'Von ständigen Rückenschmerzen zur Vorfreude auf den Montag',
  title_fr = 'De douleurs de dos constantes à l''impatience du lundi'
where name = 'Anna K.';

update public.success_stories set
  title = 'The best 50 minutes of my week',
  title_de = 'Die besten 50 Minuten meiner Woche',
  title_fr = 'Les 50 meilleures minutes de ma semaine'
where name = 'Sofia M.';

update public.success_stories set
  title = 'Strong through pregnancy, confident after',
  title_de = 'Stark durch die Schwangerschaft, selbstbewusst danach',
  title_fr = 'Forte pendant la grossesse, confiante après'
where name = 'Laura B.';
