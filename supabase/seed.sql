-- Placeholder content so the site looks real immediately.
-- Run once, after 0001_init.sql. Everything here is editable later from
-- /admin/dashboard — none of it needs a code change or a re-run of this file.

insert into public.course_types (
  slug, name, name_de, name_fr, description, description_de, description_fr,
  photo_url, duration_minutes, capacity_default, price_chf, display_order
)
values
  (
    'mat-pilates',
    'Mat Pilates', 'Mat Pilates', 'Pilates Tapis',
    'A full-body, low-impact class focused on core strength, posture and flexibility. No equipment needed beyond a mat — great for beginners and regulars alike.',
    'Ein Ganzkörpertraining mit geringer Belastung, das sich auf Rumpfkraft, Haltung und Beweglichkeit konzentriert. Ausser einer Matte wird keine Ausrüstung benötigt — ideal für Einsteigerinnen und Stammgäste.',
    'Un cours complet et à faible impact, axé sur le renforcement du centre du corps, la posture et la souplesse. Aucun équipement nécessaire à part un tapis — idéal pour les débutants comme pour les habitués.',
    '/images/placeholders/mat-pilates.svg',
    55, 8, 28.00, 1
  ),
  (
    'reformer-basics',
    'Reformer Basics', 'Reformer Grundlagen', 'Initiation Reformer',
    'Small-group sessions on the reformer machine, building controlled strength through spring-based resistance. Booking ahead is required — spots are limited.',
    'Kleine Gruppen trainieren am Reformer-Gerät und bauen durch federbasierten Widerstand kontrollierte Kraft auf. Eine Voranmeldung ist erforderlich — die Plätze sind begrenzt.',
    'Des séances en petit groupe sur le reformer, pour développer une force contrôlée grâce à une résistance à ressorts. Réservation obligatoire à l''avance — places limitées.',
    '/images/placeholders/reformer-basics.svg',
    50, 4, 45.00, 2
  ),
  (
    'prenatal-pilates',
    'Prenatal Pilates', 'Schwangerschafts-Pilates', 'Pilates Prénatal',
    'A gentle, trimester-adapted class designed to keep you strong and comfortable throughout pregnancy, led by an instructor trained in prenatal movement.',
    'Ein sanfter, auf das jeweilige Trimester abgestimmter Kurs, der dich während der Schwangerschaft stark und wohlfühlend hält, geleitet von einer in Prenatal-Bewegung geschulten Instruktorin.',
    'Un cours doux, adapté à chaque trimestre, conçu pour vous garder forte et à l''aise tout au long de la grossesse, animé par une instructrice formée au mouvement prénatal.',
    '/images/placeholders/prenatal-pilates.svg',
    45, 6, 30.00, 3
  ),
  (
    'private-1-1',
    'Private 1:1', 'Privatstunde 1:1', 'Séance privée 1:1',
    'One-on-one sessions tailored entirely to your goals, whether that''s rehab, technique, or simply a schedule that group classes don''t fit.',
    'Einzelstunden, die ganz auf deine Ziele zugeschnitten sind — ob Rehabilitation, Technik oder einfach ein Zeitplan, der nicht zu Gruppenkursen passt.',
    'Des séances individuelles entièrement adaptées à vos objectifs, qu''il s''agisse de rééducation, de technique, ou simplement d''un emploi du temps qui ne convient pas aux cours collectifs.',
    '/images/placeholders/private-1-1.svg',
    60, 1, 90.00, 4
  )
on conflict (slug) do nothing;

insert into public.success_stories (name, quote, quote_de, quote_fr, photo_url, course_type_id, display_order)
values
  (
    'Anna K.',
    'I started with zero core strength and constant back pain. Six months of weekly Mat Pilates later, the pain is gone and I actually look forward to Mondays.',
    'Ich hatte null Rumpfkraft und ständige Rückenschmerzen. Nach sechs Monaten wöchentlichem Mat Pilates sind die Schmerzen weg, und ich freue mich tatsächlich auf Montage.',
    'Je n''avais aucune force au centre du corps et des douleurs de dos constantes. Six mois de Mat Pilates hebdomadaire plus tard, la douleur a disparu et j''attends vraiment le lundi avec impatience.',
    '/images/placeholders/avatar-1.svg',
    (select id from public.course_types where slug = 'mat-pilates'),
    1
  ),
  (
    'Sofia M.',
    'The Reformer classes are the most effective 50 minutes of my week. Small groups mean real feedback every session, not just a workout playlist.',
    'Die Reformer-Kurse sind die effektivsten 50 Minuten meiner Woche. Kleine Gruppen bedeuten echtes Feedback in jeder Stunde, nicht nur eine Trainings-Playlist.',
    'Les cours de Reformer sont les 50 minutes les plus efficaces de ma semaine. Les petits groupes garantissent un vrai suivi à chaque séance, pas juste une playlist de sport.',
    '/images/placeholders/avatar-2.svg',
    (select id from public.course_types where slug = 'reformer-basics'),
    2
  ),
  (
    'Laura B.',
    'Prenatal Pilates kept me moving safely through all three trimesters, and the private session after birth got me back on my feet with real confidence.',
    'Schwangerschafts-Pilates hat mich durch alle drei Trimester sicher in Bewegung gehalten, und die Einzelstunde nach der Geburt hat mir mit echtem Selbstvertrauen wieder auf die Beine geholfen.',
    'Le Pilates Prénatal m''a permis de bouger en toute sécurité pendant mes trois trimestres, et la séance privée après l''accouchement m''a redonné confiance et m''a remise sur pied.',
    '/images/placeholders/avatar-3.svg',
    (select id from public.course_types where slug = 'prenatal-pilates'),
    3
  )
on conflict do nothing;

-- Rolling four weeks of sample availability across each course type.
--
-- Class times below are wall-clock Europe/Zurich time. `at time zone
-- 'Europe/Zurich'` converts each naive timestamp to the correct UTC instant
-- (honoring DST) before it's stored — plain arithmetic on a `timestamptz`
-- would instead use the database session's timezone (UTC on Supabase),
-- silently shifting every class by 1-2 hours. Adjust the zone name if the
-- studio isn't in Switzerland.
do $$
declare
  d date;
  v_mat_id uuid := (select id from public.course_types where slug = 'mat-pilates');
  v_reformer_id uuid := (select id from public.course_types where slug = 'reformer-basics');
  v_prenatal_id uuid := (select id from public.course_types where slug = 'prenatal-pilates');
  v_private_id uuid := (select id from public.course_types where slug = 'private-1-1');
begin
  for d in select generate_series(current_date, current_date + interval '27 days', interval '1 day')::date loop
    case extract(dow from d)::int
      when 1 then -- Monday: Mat Pilates
        insert into public.availability_slots (course_type_id, start_time, end_time, capacity)
        values (
          v_mat_id,
          (d + time '18:00') at time zone 'Europe/Zurich',
          (d + time '18:55') at time zone 'Europe/Zurich',
          8
        );
      when 3 then -- Wednesday: Mat Pilates
        insert into public.availability_slots (course_type_id, start_time, end_time, capacity)
        values (
          v_mat_id,
          (d + time '18:00') at time zone 'Europe/Zurich',
          (d + time '18:55') at time zone 'Europe/Zurich',
          8
        );
      when 2 then -- Tuesday: Reformer Basics, morning + evening
        insert into public.availability_slots (course_type_id, start_time, end_time, capacity)
        values
          (
            v_reformer_id,
            (d + time '07:00') at time zone 'Europe/Zurich',
            (d + time '07:50') at time zone 'Europe/Zurich',
            4
          ),
          (
            v_reformer_id,
            (d + time '19:00') at time zone 'Europe/Zurich',
            (d + time '19:50') at time zone 'Europe/Zurich',
            4
          );
      when 4 then -- Thursday: Prenatal Pilates
        insert into public.availability_slots (course_type_id, start_time, end_time, capacity)
        values (
          v_prenatal_id,
          (d + time '10:00') at time zone 'Europe/Zurich',
          (d + time '10:45') at time zone 'Europe/Zurich',
          6
        );
      when 5 then -- Friday: Private 1:1, three back-to-back slots
        insert into public.availability_slots (course_type_id, start_time, end_time, capacity)
        values
          (
            v_private_id,
            (d + time '09:00') at time zone 'Europe/Zurich',
            (d + time '10:00') at time zone 'Europe/Zurich',
            1
          ),
          (
            v_private_id,
            (d + time '10:00') at time zone 'Europe/Zurich',
            (d + time '11:00') at time zone 'Europe/Zurich',
            1
          ),
          (
            v_private_id,
            (d + time '11:00') at time zone 'Europe/Zurich',
            (d + time '12:00') at time zone 'Europe/Zurich',
            1
          );
      else
        -- weekend: no classes
    end case;
  end loop;
end $$;
