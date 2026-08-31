-- Adds German/French columns alongside the existing English ones (no
-- renames — `name`/`description`/`quote` keep meaning "English"). Run this
-- once against an existing project that already ran 0001_init.sql +
-- seed.sql; it also backfills German/French text for the placeholder rows
-- that migration created, since a plain INSERT ... ON CONFLICT DO NOTHING
-- (as in seed.sql) won't touch rows that already exist.

alter table public.course_types
  add column name_de text not null default '',
  add column name_fr text not null default '',
  add column description_de text not null default '',
  add column description_fr text not null default '';

alter table public.success_stories
  add column quote_de text not null default '',
  add column quote_fr text not null default '';

-- Backfill: placeholder course types.
update public.course_types set
  name_de = 'Mat Pilates',
  name_fr = 'Pilates Tapis',
  description_de = 'Ein Ganzkörpertraining mit geringer Belastung, das sich auf Rumpfkraft, Haltung und Beweglichkeit konzentriert. Ausser einer Matte wird keine Ausrüstung benötigt — ideal für Einsteigerinnen und Stammgäste.',
  description_fr = 'Un cours complet et à faible impact, axé sur le renforcement du centre du corps, la posture et la souplesse. Aucun équipement nécessaire à part un tapis — idéal pour les débutants comme pour les habitués.'
where slug = 'mat-pilates';

update public.course_types set
  name_de = 'Reformer Grundlagen',
  name_fr = 'Initiation Reformer',
  description_de = 'Kleine Gruppen trainieren am Reformer-Gerät und bauen durch federbasierten Widerstand kontrollierte Kraft auf. Eine Voranmeldung ist erforderlich — die Plätze sind begrenzt.',
  description_fr = 'Des séances en petit groupe sur le reformer, pour développer une force contrôlée grâce à une résistance à ressorts. Réservation obligatoire à l''avance — places limitées.'
where slug = 'reformer-basics';

update public.course_types set
  name_de = 'Schwangerschafts-Pilates',
  name_fr = 'Pilates Prénatal',
  description_de = 'Ein sanfter, auf das jeweilige Trimester abgestimmter Kurs, der dich während der Schwangerschaft stark und wohlfühlend hält, geleitet von einer in Prenatal-Bewegung geschulten Instruktorin.',
  description_fr = 'Un cours doux, adapté à chaque trimestre, conçu pour vous garder forte et à l''aise tout au long de la grossesse, animé par une instructrice formée au mouvement prénatal.'
where slug = 'prenatal-pilates';

update public.course_types set
  name_de = 'Privatstunde 1:1',
  name_fr = 'Séance privée 1:1',
  description_de = 'Einzelstunden, die ganz auf deine Ziele zugeschnitten sind — ob Rehabilitation, Technik oder einfach ein Zeitplan, der nicht zu Gruppenkursen passt.',
  description_fr = 'Des séances individuelles entièrement adaptées à vos objectifs, qu''il s''agisse de rééducation, de technique, ou simplement d''un emploi du temps qui ne convient pas aux cours collectifs.'
where slug = 'private-1-1';

-- Backfill: placeholder success stories.
update public.success_stories set
  quote_de = 'Ich hatte null Rumpfkraft und ständige Rückenschmerzen. Nach sechs Monaten wöchentlichem Mat Pilates sind die Schmerzen weg, und ich freue mich tatsächlich auf Montage.',
  quote_fr = 'Je n''avais aucune force au centre du corps et des douleurs de dos constantes. Six mois de Mat Pilates hebdomadaire plus tard, la douleur a disparu et j''attends vraiment le lundi avec impatience.'
where name = 'Anna K.';

update public.success_stories set
  quote_de = 'Die Reformer-Kurse sind die effektivsten 50 Minuten meiner Woche. Kleine Gruppen bedeuten echtes Feedback in jeder Stunde, nicht nur eine Trainings-Playlist.',
  quote_fr = 'Les cours de Reformer sont les 50 minutes les plus efficaces de ma semaine. Les petits groupes garantissent un vrai suivi à chaque séance, pas juste une playlist de sport.'
where name = 'Sofia M.';

update public.success_stories set
  quote_de = 'Schwangerschafts-Pilates hat mich durch alle drei Trimester sicher in Bewegung gehalten, und die Einzelstunde nach der Geburt hat mir mit echtem Selbstvertrauen wieder auf die Beine geholfen.',
  quote_fr = 'Le Pilates Prénatal m''a permis de bouger en toute sécurité pendant mes trois trimestres, et la séance privée après l''accouchement m''a redonné confiance et m''a remise sur pied.'
where name = 'Laura B.';
