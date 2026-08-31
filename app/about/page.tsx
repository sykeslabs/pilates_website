import Image from "next/image";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { instructorBio, instructorCredentials } from "@/lib/i18n/content";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Instructor } from "@/lib/types";

export default async function AboutPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const { data: instructor } = await supabase
    .from("instructor")
    .select("*")
    .limit(1)
    .maybeSingle<Instructor>();

  const galleryPhotos = instructor
    ? [
        instructor.photo_1_url,
        instructor.photo_2_url,
        instructor.photo_3_url,
        instructor.photo_4_url,
        instructor.photo_5_url,
        instructor.photo_6_url,
        instructor.photo_7_url,
      ].filter((url): url is string => Boolean(url))
    : [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
          {dict.aboutPage.eyebrow}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic tracking-tight text-charcoal sm:text-5xl">
          {dict.aboutPage.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-charcoal/70">{dict.aboutPage.subheading}</p>
      </div>
      {instructor && (
        <div className="mt-12 grid gap-8 sm:grid-cols-[220px_1fr]">
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-sage-50">
              {instructor.photo_url && (
                <Image
                  src={instructor.photo_url}
                  alt={instructor.name}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              )}
            </div>
            {galleryPhotos.map((src) => (
              <div
                key={src}
                className="relative aspect-square w-full overflow-hidden rounded-2xl bg-sage-50"
              >
                <Image src={src} alt="" fill className="object-cover" sizes="220px" />
              </div>
            ))}
          </div>
          <div className="relative rounded-2xl border border-sage-100 bg-white p-6 sm:p-8">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 left-6 font-[family-name:var(--font-display)] text-7xl italic text-sage-100 sm:-top-8 sm:text-8xl"
            >
              &ldquo;
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-charcoal sm:text-3xl">
              {instructor.name}
            </h2>
            <p className="mt-2 inline-block rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-700">
              {instructorCredentials(instructor, locale)}
            </p>
            <div
              className="rich-content mt-5 whitespace-pre-line text-lg leading-relaxed text-charcoal/80"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(instructorBio(instructor, locale), {
                  allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li"],
                  allowedAttributes: {},
                }),
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-16 rounded-3xl bg-sage-700 px-8 py-12 text-center text-cream">
        <h2 className="font-[family-name:var(--font-display)] text-3xl italic sm:text-4xl">
          {dict.aboutPage.ctaHeading}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-cream/85">{dict.aboutPage.ctaBody}</p>
        <Link
          href="/book"
          className="mt-6 inline-block rounded-full bg-cream px-8 py-3 text-sm font-semibold text-sage-700 transition hover:bg-white"
        >
          {dict.aboutPage.ctaButton}
        </Link>
      </div>
    </div>
  );
}
