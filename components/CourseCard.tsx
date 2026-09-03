import Image from "next/image";
import Link from "next/link";
import { courseName, courseBriefDescription, courseBadgeLabel } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { CourseType } from "@/lib/types";

export function CourseCard({
  course,
  locale,
  dict,
}: {
  course: CourseType;
  locale: Locale;
  dict: Pick<Dictionary, "common" | "courseCard" | "coursesPage">;
}) {
  const name = courseName(course, locale);
  const badge = courseBadgeLabel(course, locale);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-sm transition hover:bg-sage-50 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-sage-50">
        {course.photo_url && (
          <Image
            src={course.photo_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-terracotta-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">{name}</h3>
          <p className="mt-1 text-sm text-charcoal/70">{courseBriefDescription(course, locale)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm text-charcoal/60">
          <span>
            {course.duration_minutes} {dict.common.minutesShort} ·{" "}
            {course.class_type === "private"
              ? dict.coursesPage.capacityPrivate
              : `${dict.common.maxGroupSize} ${course.capacity_default}`}
          </span>
          {course.price_chf != null && (
            <span className="font-medium text-sage-700">
              CHF {course.price_chf.toFixed(2)}{" "}
              {course.class_type === "private" ? dict.common.perSession : dict.common.perPerson}
            </span>
          )}
        </div>
        <Link
          href={`/book?course=${course.slug}`}
          className="relative z-10 mt-2 inline-flex items-center justify-center rounded-full bg-sage-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-500"
        >
          {dict.courseCard.checkAvailability}
        </Link>
        <Link
          href={`/courses?course=${course.slug}`}
          className="relative z-10 text-center text-sm font-medium text-sage-700 hover:underline"
        >
          {dict.courseCard.learnMore}
        </Link>
      </div>
      <Link
        href={`/courses?course=${course.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-0"
      />
    </div>
  );
}
