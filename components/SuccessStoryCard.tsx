import Image from "next/image";
import { storyQuote, storyTitle } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/config";
import type { SuccessStory } from "@/lib/types";

export function SuccessStoryCard({ story, locale }: { story: SuccessStory; locale: Locale }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm">
      <div className="flex-1">
        <h3 className="font-semibold text-charcoal">{storyTitle(story, locale)}</h3>
        <blockquote className="mt-2 text-sm leading-relaxed text-charcoal/80">
          &ldquo;{storyQuote(story, locale)}&rdquo;
        </blockquote>
      </div>
      <figcaption className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sage-50">
          {story.photo_url && (
            <Image src={story.photo_url} alt={story.name} fill className="object-cover" sizes="40px" />
          )}
        </div>
        <span className="text-sm font-medium text-charcoal">{story.name}</span>
      </figcaption>
    </figure>
  );
}
