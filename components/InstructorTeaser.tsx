import Image from "next/image";
import Link from "next/link";
import { instructorCredentials } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { Instructor } from "@/lib/types";

export function InstructorTeaser({
  instructor,
  locale,
  dict,
}: {
  instructor: Instructor;
  locale: Locale;
  dict: Pick<Dictionary, "home" | "aboutPage">;
}) {
  return (
    <section className="flex flex-col justify-center bg-sage-50 px-6 py-20 lg:sticky lg:top-16 lg:z-[60] lg:min-h-screen">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
        <div className="relative h-56 w-56 shrink-0 overflow-hidden rounded-3xl bg-sage-50 sm:h-64 sm:w-64">
          {instructor.photo_url && (
            <Image
              src={instructor.photo_url}
              alt={instructor.name}
              fill
              className="object-cover"
              sizes="256px"
            />
          )}
        </div>
        <div className="min-w-0 sm:flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
            {dict.home.instructorEyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-charcoal sm:text-4xl">
            {instructor.name}
          </h2>
          <p className="mt-2 text-charcoal/70">{dict.aboutPage.subheading}</p>
          <Link
            href="/about"
            className="mt-5 block rounded-2xl border border-sage-100 bg-white p-5 text-left shadow-sm transition hover:border-sage-300 hover:bg-sand hover:shadow-md"
          >
            <p className="text-sm font-medium text-charcoal">
              {instructorCredentials(instructor, locale)}
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-sage-700">
              {dict.home.instructorCta} →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
