import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
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
      <h1 className="text-center text-3xl font-semibold tracking-tight text-charcoal">
        {dict.aboutPage.heading}
      </h1>
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
          <div>
            <h2 className="text-xl font-semibold text-charcoal">{instructor.name}</h2>
            <p className="mt-1 text-sm font-medium text-sage-700">
              {instructorCredentials(instructor, locale)}
            </p>
            <div
              className="rich-content mt-4 whitespace-pre-line leading-relaxed text-charcoal/70"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(instructorBio(instructor, locale)),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
