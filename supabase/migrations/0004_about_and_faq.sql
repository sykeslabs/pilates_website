-- Adds an "instructor" content block (single conceptual row — the admin
-- dashboard always edits/creates "the" row, since there's one instructor)
-- and a repeatable "faqs" list, both public-read / admin-write.

create table public.instructor (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  credentials text not null default '',
  credentials_de text not null default '',
  credentials_fr text not null default '',
  bio text not null default '',
  bio_de text not null default '',
  bio_fr text not null default '',
  photo_url text,
  updated_at timestamptz not null default now()
);

alter table public.instructor enable row level security;

create policy "instructor_public_read" on public.instructor
  for select using (true);

create policy "instructor_admin_all" on public.instructor
  for all to authenticated using (true) with check (true);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  question_de text not null default '',
  question_fr text not null default '',
  answer text not null,
  answer_de text not null default '',
  answer_fr text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "faqs_public_read" on public.faqs
  for select using (true);

create policy "faqs_admin_all" on public.faqs
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Placeholder content.
-- ---------------------------------------------------------------------------

insert into public.instructor (name, credentials, credentials_de, credentials_fr, bio, bio_de, bio_fr, photo_url)
values (
  'Nadia Furrer',
  'Certified Comprehensive Pilates Instructor — 8+ years experience',
  'Zertifizierte umfassende Pilates-Instruktorin — 8+ Jahre Erfahrung',
  'Instructrice Pilates certifiée (méthode complète) — 8+ ans d''expérience',
  E'Nadia discovered Pilates during her own recovery from a back injury and has been teaching ever since. She''s a certified instructor trained in classical and contemporary Pilates, with additional certification in prenatal movement. Her classes are known for close, individual attention — even in a group setting.\n\nWhen she''s not teaching, you''ll find her hiking in the Alps or trying out a new recipe.',
  E'Nadia entdeckte Pilates während ihrer eigenen Genesung von einer Rückenverletzung und unterrichtet seitdem. Sie ist zertifizierte Instruktorin, ausgebildet in klassischem und zeitgenössischem Pilates, mit einer Zusatzausbildung in Prenatal-Bewegung. Ihre Kurse sind bekannt für die persönliche, individuelle Betreuung — auch in der Gruppe.\n\nWenn sie nicht unterrichtet, ist sie in den Alpen wandern oder probiert ein neues Rezept aus.',
  E'Nadia a découvert le Pilates lors de sa propre rééducation après une blessure au dos, et enseigne depuis. Elle est instructrice certifiée, formée au Pilates classique et contemporain, avec une certification supplémentaire en mouvement prénatal. Ses cours sont réputés pour leur attention individuelle, même en groupe.\n\nQuand elle n''enseigne pas, on la retrouve en randonnée dans les Alpes ou en train de tester une nouvelle recette.',
  '/images/placeholders/instructor.svg'
);

insert into public.faqs (question, question_de, question_fr, answer, answer_de, answer_fr, display_order)
values
  (
    'Do I need previous Pilates experience?',
    'Brauche ich Vorerfahrung mit Pilates?',
    'Ai-je besoin d''expérience préalable en Pilates ?',
    'Not at all — Mat Pilates and Reformer Basics are both suitable for complete beginners. Just let your instructor know before class so she can adjust for you.',
    'Überhaupt nicht — sowohl Mat Pilates als auch Reformer Grundlagen eignen sich für absolute Anfängerinnen und Anfänger. Sag deiner Instruktorin einfach vor dem Kurs Bescheid, damit sie es für dich anpassen kann.',
    'Pas du tout — le Pilates Tapis comme l''Initiation Reformer conviennent aux débutants complets. Il suffit d''en informer votre instructrice avant le cours pour qu''elle puisse adapter les exercices.',
    1
  ),
  (
    'What should I bring to class?',
    'Was soll ich zum Kurs mitbringen?',
    'Que dois-je apporter au cours ?',
    'Comfortable clothing you can move in, and a water bottle. Mats are provided, but you''re welcome to bring your own. Please wear grip socks or go barefoot for Reformer classes.',
    'Bequeme Kleidung, in der du dich gut bewegen kannst, und eine Wasserflasche. Matten werden gestellt, du kannst aber gerne deine eigene mitbringen. Für Reformer-Kurse bitte Grip-Socken tragen oder barfuss trainieren.',
    'Des vêtements confortables dans lesquels vous pouvez bouger librement, et une bouteille d''eau. Les tapis sont fournis, mais vous pouvez apporter le vôtre. Pour les cours de Reformer, merci de porter des chaussettes antidérapantes ou de venir pieds nus.',
    2
  ),
  (
    'Can I cancel or change a booking?',
    'Kann ich eine Buchung stornieren oder ändern?',
    'Puis-je annuler ou modifier une réservation ?',
    'Yes — get in touch as early as possible and we''ll find you another time. Please give at least 24 hours'' notice where you can, so someone else can take your spot.',
    'Ja — melde dich so früh wie möglich, dann finden wir einen anderen Termin. Bitte gib wenn möglich mindestens 24 Stunden im Voraus Bescheid, damit jemand anderes deinen Platz übernehmen kann.',
    'Oui — contactez-nous le plus tôt possible et nous trouverons un autre horaire. Merci de prévenir au moins 24 heures à l''avance dans la mesure du possible, afin qu''une autre personne puisse prendre votre place.',
    3
  ),
  (
    'Do you offer a trial class?',
    'Bietet ihr eine Probestunde an?',
    'Proposez-vous un cours d''essai ?',
    'Yes — your first Mat Pilates class is a great low-commitment way to try the studio. Just book normally and mention it''s your first visit.',
    'Ja — dein erster Mat-Pilates-Kurs ist ein toller, unverbindlicher Einstieg ins Studio. Buche einfach ganz normal und erwähne, dass es dein erster Besuch ist.',
    'Oui — votre premier cours de Mat Pilates est une excellente manière de découvrir le studio sans engagement. Réservez normalement et mentionnez qu''il s''agit de votre première visite.',
    4
  ),
  (
    'What payment methods do you accept?',
    'Welche Zahlungsmethoden akzeptiert ihr?',
    'Quels moyens de paiement acceptez-vous ?',
    'Right now, payment is arranged directly with the studio after booking — online payment is coming soon.',
    'Aktuell wird die Zahlung direkt mit dem Studio nach der Buchung geregelt — die Online-Zahlung folgt in Kürze.',
    'Pour l''instant, le paiement se règle directement avec le studio après la réservation — le paiement en ligne arrive bientôt.',
    5
  );
