import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import { ScrollToElement } from "@/components/ScrollToElement";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { CourseType, SuccessStory } from "@/lib/types";

export default async function StoriesPage({ searchParams }: PageProps<"/stories">) {
  const params = await searchParams;
  const highlightedStoryId = typeof params.story === "string" ? params.story : undefined;

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const [{ data: stories }, { data: courses }] = await Promise.all([
    supabase
      .from("success_stories")
      .select("*")
      .order("display_order", { ascending: true })
      .returns<SuccessStory[]>(),
    supabase.from("course_types").select("*").returns<CourseType[]>(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <ScrollToElement id={highlightedStoryId ? `story-${highlightedStoryId}` : undefined} />
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
          {dict.storiesPage.eyebrow}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic tracking-tight text-charcoal sm:text-5xl">
          {dict.storiesPage.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-charcoal/70">{dict.storiesPage.subheading}</p>
      </div>

      {stories && stories.length > 0 && (
        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {stories.map((story) => (
            <div
              key={story.id}
              id={`story-${story.id}`}
              className="mb-6 scroll-mt-20 break-inside-avoid"
            >
              <SuccessStoryCard
                story={story}
                locale={locale}
                courses={courses ?? []}
                highlighted={story.id === highlightedStoryId}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto mt-16 max-w-3xl rounded-3xl bg-sage-700 px-8 py-12 text-center text-cream">
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
