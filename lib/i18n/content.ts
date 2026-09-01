import type { Locale } from "./config";
import type { CourseType, SuccessStory, Instructor, Faq } from "@/lib/types";

// Tolerates a column being entirely absent (undefined), not just empty —
// e.g. if this code ever runs before its matching migration, so a page
// falls back to blank/English rather than throwing on `undefined.trim()`.
function pickLocalized(en: string, de: string, fr: string, locale: Locale): string {
  const preferred = locale === "de" ? de : locale === "fr" ? fr : en;
  if (preferred && preferred.trim()) return preferred;
  return en ?? "";
}

export function courseName(course: Pick<CourseType, "name" | "name_de" | "name_fr">, locale: Locale) {
  return pickLocalized(course.name, course.name_de, course.name_fr, locale);
}

export function courseDescription(
  course: Pick<CourseType, "description" | "description_de" | "description_fr">,
  locale: Locale,
) {
  return pickLocalized(course.description, course.description_de, course.description_fr, locale);
}

export function courseBriefDescription(
  course: Pick<
    CourseType,
    "brief_description" | "brief_description_de" | "brief_description_fr" | "description" | "description_de" | "description_fr"
  >,
  locale: Locale,
) {
  const brief = pickLocalized(
    course.brief_description,
    course.brief_description_de,
    course.brief_description_fr,
    locale,
  );
  return brief ? brief : courseDescription(course, locale);
}

export function courseBadgeLabel(
  course: Pick<CourseType, "badge_label" | "badge_label_de" | "badge_label_fr">,
  locale: Locale,
): string | null {
  const preferred =
    locale === "de"
      ? course.badge_label_de
      : locale === "fr"
        ? course.badge_label_fr
        : course.badge_label;
  if (preferred && preferred.trim()) return preferred;
  return course.badge_label && course.badge_label.trim() ? course.badge_label : null;
}

export function storyQuote(story: Pick<SuccessStory, "quote" | "quote_de" | "quote_fr">, locale: Locale) {
  return pickLocalized(story.quote, story.quote_de, story.quote_fr, locale);
}

export function storyTitle(story: Pick<SuccessStory, "title" | "title_de" | "title_fr">, locale: Locale) {
  return pickLocalized(story.title, story.title_de, story.title_fr, locale);
}

export function instructorBio(
  instructor: Pick<Instructor, "bio" | "bio_de" | "bio_fr">,
  locale: Locale,
) {
  return pickLocalized(instructor.bio, instructor.bio_de, instructor.bio_fr, locale);
}

export function instructorCredentials(
  instructor: Pick<Instructor, "credentials" | "credentials_de" | "credentials_fr">,
  locale: Locale,
) {
  return pickLocalized(
    instructor.credentials,
    instructor.credentials_de,
    instructor.credentials_fr,
    locale,
  );
}

export function faqQuestion(faq: Pick<Faq, "question" | "question_de" | "question_fr">, locale: Locale) {
  return pickLocalized(faq.question, faq.question_de, faq.question_fr, locale);
}

export function faqAnswer(faq: Pick<Faq, "answer" | "answer_de" | "answer_fr">, locale: Locale) {
  return pickLocalized(faq.answer, faq.answer_de, faq.answer_fr, locale);
}
