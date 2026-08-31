import Image from "next/image";
import Link from "next/link";
import { courseName, courseDescription } from "@/lib/i18n/content";
import { localeTags, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { AvailabilitySlot, CourseType } from "@/lib/types";

export function CourseDetailCard({
  course,
  locale,
  dict,
  upcomingSlots,
}: {
  course: CourseType;
  locale: Locale;
  dict: Pick<Dictionary, "common" | "courseCard" | "coursesPage">;
  upcomingSlots: AvailabilitySlot[];
}) {
  const name = courseName(course, locale);
  const classTypeLabel =
    course.class_type === "private"
      ? dict.common.classTypePrivate
      : course.class_type === "semi_private"
        ? dict.common.classTypeSemiPrivate
        : dict.common.classTypeGroup;

  const dateFormatter = new Intl.DateTimeFormat(localeTags[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeFormatter = new Intl.DateTimeFormat(localeTags[locale], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      id={course.slug}
      className="grid overflow-hidden rounded-3xl bg-white shadow-sm lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2"
    >
      <div className="relative h-72 sm:h-96 lg:h-auto">
        {course.photo_url && (
          <Image
            src={course.photo_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        )}
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <span className="text-sm font-semibold uppercase tracking-wide text-sage-700">
          {classTypeLabel}
        </span>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          {name}
        </h2>

        <div className="mt-6 grid grid-cols-3 gap-4 border-y border-sage-100 py-6">
          <div>
            <div className="text-2xl font-semibold text-charcoal">{course.duration_minutes}</div>
            <div className="text-xs text-charcoal/60">
              {dict.coursesPage.durationLabel} ({dict.common.minutesShort})
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-charcoal">
              {course.class_type === "private"
                ? dict.coursesPage.capacityPrivate
                : course.capacity_default}
            </div>
            <div className="text-xs text-charcoal/60">{dict.coursesPage.capacityLabel}</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-sage-700">
              {course.price_chf != null ? `CHF ${course.price_chf.toFixed(0)}` : "—"}
            </div>
            <div className="text-xs text-charcoal/60">
              {dict.coursesPage.priceLabel}
              {course.price_chf != null &&
                ` ${
                  course.class_type === "private" ? dict.common.perSession : dict.common.perPerson
                }`}
            </div>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-charcoal/70">{courseDescription(course, locale)}</p>

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
            {dict.coursesPage.upcomingHeading}
          </h3>
          {upcomingSlots.length === 0 ? (
            <p className="mt-3 text-sm text-charcoal/60">{dict.coursesPage.noUpcoming}</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {upcomingSlots.map((slot) => (
                <Link
                  key={slot.id}
                  href={`/book?course=${course.slug}`}
                  className="rounded-full border border-sage-100 px-4 py-2 text-sm text-charcoal transition hover:border-sage-300 hover:bg-sage-50"
                >
                  {dateFormatter.format(new Date(slot.start_time))} ·{" "}
                  {timeFormatter.format(new Date(slot.start_time))}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href={`/book?course=${course.slug}`}
          className="mt-10 inline-flex w-fit items-center justify-center rounded-full bg-sage-700 px-8 py-3 text-sm font-semibold text-white shadow transition hover:scale-[1.02] hover:bg-sage-500"
        >
          {dict.courseCard.checkAvailability}
        </Link>
      </div>
    </div>
  );
}
