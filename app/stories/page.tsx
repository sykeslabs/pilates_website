import { createClient } from "@/lib/supabase/server";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { SuccessStory } from "@/lib/types";

export default async function StoriesPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const { data: stories } = await supabase
    .from("success_stories")
    .select("*")
    .order("display_order", { ascending: true })
    .returns<SuccessStory[]>();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
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
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <SuccessStoryCard key={story.id} story={story} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
