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
  dict: Pick<Dictionary, "home">;
}) {
  return (
    <section className="flex flex-col justify-center bg-sage-50 px-6 py-20 lg:sticky lg:top-16 lg:z-[60] lg:min-h-screen">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-sage-50">
          {instructor.photo_url && (
            <Image
              src={instructor.photo_url}
              alt={instructor.name}
              fill
              className="object-cover"
              sizes="128px"
            />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
            {dict.home.instructorEyebrow}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-charcoal">
            {instructor.name}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-sage-700">
            {instructorCredentials(instructor, locale)}
          </p>
          <Link
            href="/about"
            className="mt-4 inline-block text-sm font-medium text-sage-700 hover:underline"
          >
            {dict.home.instructorCta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
