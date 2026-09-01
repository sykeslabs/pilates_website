-- Starter FAQ content addressing common objections (experience needed,
-- what to bring, cancellations, pregnancy safety, group size, privates).
-- Only inserted if the faqs table is currently empty, so it never
-- clobbers real content the studio owner has already written.

insert into public.faqs (question, question_de, question_fr, answer, answer_de, answer_fr, display_order)
select * from (values
  (
    'Do I need any experience to join?',
    'Brauche ich Vorerfahrung, um mitzumachen?',
    'Ai-je besoin d''expérience pour participer ?',
    'Not at all. Every class is taught at a pace that works for beginners, and the instructor adjusts each exercise to where you are — many of our regulars started with zero Pilates experience.',
    'Überhaupt nicht. Jede Stunde wird in einem Tempo unterrichtet, das für Einsteiger funktioniert, und die Instruktorin passt jede Übung an deinen Stand an — viele unserer Stammgäste haben mit null Pilates-Erfahrung angefangen.',
    'Pas du tout. Chaque cours est enseigné à un rythme adapté aux débutants, et l''instructrice ajuste chaque exercice à votre niveau — beaucoup de nos habitué·e·s ont commencé sans aucune expérience du Pilates.',
    1
  ),
  (
    'What should I wear and bring?',
    'Was soll ich anziehen und mitbringen?',
    'Que dois-je porter et apporter ?',
    'Comfortable, stretchy clothing you can move freely in, and socks (ideally with grip). Everything else — mats and equipment — is provided at the studio.',
    'Bequeme, dehnbare Kleidung, in der du dich frei bewegen kannst, und Socken (idealerweise mit Antirutsch-Sohle). Alles andere — Matten und Geräte — stellt das Studio zur Verfügung.',
    'Des vêtements confortables et extensibles qui permettent de bouger librement, ainsi que des chaussettes (idéalement antidérapantes). Tout le reste — tapis et équipement — est fourni par le studio.',
    2
  ),
  (
    'Can I cancel or change a booking?',
    'Kann ich eine Buchung stornieren oder ändern?',
    'Puis-je annuler ou modifier une réservation ?',
    'Please contact the studio directly if you need to cancel or reschedule your booking.',
    'Bitte kontaktiere das Studio direkt, wenn du deine Buchung stornieren oder verschieben möchtest.',
    'Merci de contacter directement le studio si vous devez annuler ou reporter votre réservation.',
    3
  ),
  (
    'Is Pilates safe during pregnancy?',
    'Ist Pilates während der Schwangerschaft sicher?',
    'Le Pilates est-il sûr pendant la grossesse ?',
    'Yes — our Prenatal Pilates classes are specifically designed and adapted for each trimester, led by an instructor trained in prenatal movement.',
    'Ja — unsere Schwangerschafts-Pilates-Kurse sind speziell auf jedes Trimester abgestimmt und werden von einer in Prenatal-Bewegung geschulten Instruktorin geleitet.',
    'Oui — nos cours de Pilates Prénatal sont spécialement conçus et adaptés à chaque trimestre, animés par une instructrice formée au mouvement prénatal.',
    4
  ),
  (
    'How small are the group classes?',
    'Wie klein sind die Gruppenkurse?',
    'Les cours en groupe sont-ils vraiment petits ?',
    'Mat classes have a maximum of 8 participants, and Reformer sessions are capped even smaller, so you always get real attention from the instructor.',
    'Mat-Kurse haben maximal 8 Teilnehmerinnen, und Reformer-Stunden sind noch kleiner, sodass du immer echte Aufmerksamkeit von der Instruktorin bekommst.',
    'Les cours de Mat comptent au maximum 8 participantes, et les séances de Reformer sont encore plus restreintes, pour une vraie attention de l''instructrice.',
    5
  ),
  (
    'Do you offer private sessions?',
    'Bietet ihr Einzelstunden an?',
    'Proposez-vous des séances privées ?',
    'Yes — one-on-one sessions are available and can be tailored entirely to your goals, whether that''s rehab, technique, or a schedule that group classes don''t fit.',
    'Ja — Einzelstunden sind verfügbar und können ganz auf deine Ziele zugeschnitten werden, ob Rehabilitation, Technik oder ein Zeitplan, der nicht zu Gruppenkursen passt.',
    'Oui — des séances individuelles sont disponibles et peuvent être entièrement adaptées à vos objectifs, qu''il s''agisse de rééducation, de technique, ou d''un emploi du temps qui ne convient pas aux cours collectifs.',
    6
  )
) as v(question, question_de, question_fr, answer, answer_de, answer_fr, display_order)
where not exists (select 1 from public.faqs);
