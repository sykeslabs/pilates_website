-- Adds 5 more success stories. The last one is a personal note from the
-- studio owner (Stefan Sykes) rather than a client testimonial, addressed
-- directly to a participant, Reut.

insert into public.success_stories (name, title, title_de, title_fr, quote, quote_de, quote_fr, course_type_id, display_order)
values
  (
    'Hannah B.',
    'I didn''t expect a mat class to fix my sleep',
    'Dass ein Mat-Kurs meinen Schlaf verbessert, hätte ich nicht erwartet',
    'Je ne m''attendais pas à ce qu''un cours de mat améliore mon sommeil',
    'I started Mat Pilates hoping to feel less stiff after long shifts on my feet, and that part worked, but the bigger surprise was how much better I''ve been sleeping since. Something about focusing that hard on breath and control for an hour seems to switch my brain off in a way scrolling my phone never did. I used to lie awake running through my to-do list; now I''m usually out within minutes of getting into bed. My physio is happy about my back too, but honestly the sleep is the reason I never skip a session.',
    'Ich habe mit Mat Pilates angefangen, in der Hoffnung, nach langen Schichten im Stehen weniger steif zu sein, und das hat auch funktioniert, aber die grössere Überraschung war, wie viel besser ich seitdem schlafe. Sich eine Stunde lang so konzentriert auf Atmung und Kontrolle einzulassen, scheint meinen Kopf auf eine Art abzuschalten, wie es Scrollen am Handy nie geschafft hat. Früher lag ich wach und bin gedanklich meine To-do-Liste durchgegangen; jetzt schlafe ich meist innerhalb weniger Minuten ein. Auch meine Physiotherapeutin freut sich über meinen Rücken, aber ehrlich gesagt ist der Schlaf der Grund, warum ich keine Stunde auslasse.',
    'J''ai commencé le Mat Pilates en espérant être moins raide après de longues journées debout, et ça a marché, mais la plus grande surprise a été à quel point je dors mieux depuis. Se concentrer aussi intensément sur la respiration et le contrôle pendant une heure semble éteindre mon cerveau d''une façon que scroller sur mon téléphone n''a jamais réussi à faire. Avant, je restais éveillée à repasser ma liste de choses à faire ; maintenant, je m''endors généralement en quelques minutes. Ma physiothérapeute est aussi contente pour mon dos, mais honnêtement, c''est le sommeil qui fait que je ne rate jamais une séance.',
    (select id from public.course_types where slug = 'mat-pilates'),
    19
  ),
  (
    'Simon K.',
    'Golf finally makes sense to my body',
    'Golf ergibt endlich Sinn für meinen Körper',
    'Le golf a enfin du sens pour mon corps',
    'My golf coach kept telling me my rotation was limited, but no amount of stretching before rounds seemed to fix it. A friend suggested Reformer sessions for the resistance work, and within a couple of months my swing had noticeably more range without me thinking about it on the course. What surprised me most was how much the instructor tailored things toward rotational strength once I mentioned golf was the goal, instead of just running a standard program. My handicap has actually dropped, and my back doesn''t tighten up on the back nine anymore either.',
    'Mein Golftrainer hat mir immer wieder gesagt, meine Rotation sei eingeschränkt, aber egal wie viel ich vor den Runden gedehnt habe, es hat sich nichts geändert. Ein Freund hat mir Reformer-Stunden wegen der Widerstandsarbeit vorgeschlagen, und innerhalb weniger Monate hatte mein Schwung spürbar mehr Reichweite, ohne dass ich beim Spielen darüber nachdenken musste. Am meisten überrascht hat mich, wie sehr die Instruktorin die Übungen auf Rotationskraft ausgerichtet hat, sobald ich erwähnt habe, dass Golf das Ziel ist, statt einfach ein Standardprogramm durchzuziehen. Mein Handicap ist tatsächlich gesunken, und mein Rücken verspannt sich auf den letzten Löchern auch nicht mehr.',
    'Mon coach de golf n''arrêtait pas de me dire que ma rotation était limitée, mais aucun étirement avant les parties ne semblait y changer quoi que ce soit. Un ami m''a suggéré des séances de Reformer pour le travail de résistance, et en quelques mois mon swing avait nettement plus d''amplitude sans que j''y pense sur le parcours. Ce qui m''a le plus surpris, c''est à quel point l''instructrice a orienté les exercices vers la force de rotation dès que j''ai mentionné que le golf était mon objectif, au lieu de suivre un programme standard. Mon handicap a vraiment baissé, et mon dos ne se contracte plus sur les neuf derniers trous non plus.',
    (select id from public.course_types where slug = 'reformer-basics'),
    20
  ),
  (
    'Anja R.',
    'The only hour of my week that felt like just mine',
    'Die einzige Stunde der Woche, die wirklich mir gehörte',
    'La seule heure de ma semaine qui n''appartenait qu''à moi',
    'Between a demanding job and preparing for the baby, pregnancy started to feel like something happening to me rather than something I was part of. Prenatal Pilates became the one hour a week that was entirely mine, where nobody needed anything from me except to breathe and move carefully. The instructor checked in constantly about how I was actually feeling that day, not just running through a fixed routine regardless. By my third trimester I felt more connected to my body than I had the whole pregnancy, and genuinely looked forward to every single class.',
    'Zwischen einem fordernden Job und der Vorbereitung aufs Baby fühlte sich die Schwangerschaft manchmal eher an wie etwas, das mit mir passiert, statt etwas, an dem ich aktiv teilhabe. Schwangerschafts-Pilates wurde zu der einen Stunde pro Woche, die ganz mir gehörte, in der niemand etwas von mir brauchte, ausser vorsichtig zu atmen und mich zu bewegen. Die Instruktorin hat ständig nachgefragt, wie es mir an dem Tag wirklich geht, statt einfach ein festes Programm durchzuziehen. Im dritten Trimester fühlte ich mich stärker mit meinem Körper verbunden als in der ganzen Schwangerschaft davor, und habe mich wirklich auf jede einzelne Stunde gefreut.',
    'Entre un travail exigeant et les préparatifs pour le bébé, la grossesse a commencé à ressembler à quelque chose qui m''arrivait plutôt qu''à quelque chose que je vivais activement. Le Pilates Prénatal est devenu la seule heure de ma semaine qui n''appartenait qu''à moi, où personne n''avait besoin de rien d''autre que je respire et bouge avec attention. L''instructrice prenait constamment de mes nouvelles sur la façon dont je me sentais réellement ce jour-là, au lieu de simplement dérouler une routine fixe. Au troisième trimestre, je me sentais plus connectée à mon corps que pendant toute la grossesse, et j''attendais vraiment chaque cours avec impatience.',
    (select id from public.course_types where slug = 'prenatal-pilates'),
    21
  ),
  (
    'Oliver D.',
    'One-on-one sessions got me back on my feet after a herniated disc',
    'Einzelstunden haben mich nach einem Bandscheibenvorfall wieder auf die Beine gebracht',
    'Des séances individuelles m''ont remis debout après une hernie discale',
    'A herniated disc took me out of any kind of exercise for months, and by the time I was cleared to move again I was scared to do almost anything. Group classes felt like too much risk, so I started with private sessions where the instructor could watch exactly how my back responded to every single movement. Progress was slower than I wanted at first, which turned out to be exactly the right pace. Eight months later I''m doing exercises I assumed were off the table for good, and my back specialist says my recovery is well ahead of where he expected.',
    'Ein Bandscheibenvorfall hat mich monatelang von jeglichem Sport ferngehalten, und als ich endlich wieder loslegen durfte, hatte ich Angst, fast alles zu tun. Gruppenkurse fühlten sich nach zu viel Risiko an, also habe ich mit Einzelstunden angefangen, bei denen die Instruktorin genau beobachten konnte, wie mein Rücken auf jede einzelne Bewegung reagiert. Der Fortschritt war anfangs langsamer, als ich wollte, was sich als genau das richtige Tempo herausstellte. Acht Monate später mache ich Übungen, von denen ich dachte, sie seien für immer gestrichen, und mein Rückenspezialist sagt, meine Genesung sei deutlich weiter, als er erwartet hatte.',
    'Une hernie discale m''a tenu éloigné de tout exercice pendant des mois, et une fois autorisé à bouger à nouveau, j''avais peur de presque tout faire. Les cours collectifs semblaient trop risqués, alors j''ai commencé par des séances privées où l''instructrice pouvait observer exactement comment mon dos réagissait à chaque mouvement. Les progrès ont d''abord été plus lents que je ne le voulais, ce qui s''est révélé être exactement le bon rythme. Huit mois plus tard, je fais des exercices que je pensais définitivement hors de portée, et mon spécialiste du dos dit que ma récupération est bien en avance sur ce qu''il attendait.',
    (select id from public.course_types where slug = 'private-1-1'),
    22
  ),
  (
    'Stefan Sykes',
    'A note of thanks to Reut',
    'Ein Dankeschön an Reut',
    'Un mot de remerciement pour Reut',
    'I don''t usually write these myself, but Reut deserves an exception. She''s been part of this studio for a while now, and honestly, she makes every class better just by being in the room — the kind of energy and warmth that spreads to everyone around her. She shows up focused, always encourages the people next to her, and somehow remembers to ask how everyone''s week is going before we even start. Teaching is easy when you have participants like her. Reut, if you''re reading this: thank you for being exactly who you are. This studio is better for having you in it.',
    'Normalerweise schreibe ich diese Texte nicht selbst, aber bei Reut mache ich eine Ausnahme. Sie ist schon eine Weile Teil dieses Studios, und ehrlich gesagt macht sie jede Stunde einfach besser, nur indem sie im Raum ist — diese Art von Energie und Wärme, die sich auf alle um sie herum überträgt. Sie kommt konzentriert, ermutigt immer die Leute neben ihr und fragt irgendwie immer noch, wie die Woche bei allen war, bevor wir überhaupt anfangen. Unterrichten fällt leicht, wenn man Teilnehmerinnen wie sie hat. Reut, falls du das liest: Danke, dass du genau die bist, die du bist. Dieses Studio ist besser, weil es dich gibt.',
    'D''habitude, je n''écris pas ces textes moi-même, mais pour Reut, je fais une exception. Elle fait partie de ce studio depuis un moment, et honnêtement, elle rend chaque cours meilleur rien qu''en étant présente — ce genre d''énergie et de chaleur qui se transmet à tous ceux qui l''entourent. Elle arrive concentrée, encourage toujours les personnes à côté d''elle, et trouve quand même le moyen de demander comment s''est passée la semaine de chacun avant même qu''on commence. Enseigner est facile quand on a des participantes comme elle. Reut, si tu lis ceci : merci d''être exactement celle que tu es. Ce studio est meilleur grâce à toi.',
    null,
    23
  )
on conflict do nothing;
