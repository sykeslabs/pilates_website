import Image from "next/image";
import { courseName, storyQuote, storyTitle } from "@/lib/i18n/content";
import { InstagramEmbed } from "@/components/InstagramEmbed";
import { TruncatedQuote } from "@/components/TruncatedQuote";
import { localeTags, type Locale } from "@/lib/i18n/config";
import type { CourseType, SuccessStory } from "@/lib/types";

export function SuccessStoryCard({
  story,
  locale,
  compact = false,
  courses = [],
}: {
  story: SuccessStory;
  locale: Locale;
  compact?: boolean;
  courses?: CourseType[];
}) {
  const submittedDate = new Intl.DateTimeFormat(localeTags[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(story.created_at));
  const relatedCourse = courses.find((c) => c.id === story.course_type_id);

  return (
    <figure
      className={`flex flex-col gap-4 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm transition hover:bg-sage-50 ${
        compact ? "h-[340px] sm:h-[380px] lg:h-[420px]" : "h-full"
      }`}
    >
      <div className={`flex flex-1 flex-col ${compact ? "overflow-hidden" : ""}`}>
        <h3 className="shrink-0 font-semibold text-charcoal line-clamp-1">
          {storyTitle(story, locale)}
        </h3>
        {relatedCourse && (
          <span className="mt-1 inline-block w-fit shrink-0 rounded-full bg-sage-50 px-2.5 py-0.5 text-xs font-medium text-sage-700">
            {courseName(relatedCourse, locale)}
          </span>
        )}
        {story.instagram_url ? (
          compact ? (
            <a
              href={story.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-sage-50 text-center transition hover:bg-sage-100"
            >
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.75}>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
              </svg>
              <span className="text-sm font-medium text-sage-700">View on Instagram ↗</span>
            </a>
          ) : (
            <div className="mt-2">
              <InstagramEmbed url={story.instagram_url} maxWidth={540} />
            </div>
          )
        ) : compact ? (
          <div className="mt-2 flex-1 overflow-hidden">
            <TruncatedQuote>{storyQuote(story, locale)}</TruncatedQuote>
          </div>
        ) : (
          <blockquote className="mt-2 text-sm leading-relaxed text-charcoal/80">
            &ldquo;{storyQuote(story, locale)}&rdquo;
          </blockquote>
        )}
      </div>
      <figcaption className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sage-50">
          {story.photo_url && (
            <Image src={story.photo_url} alt={story.name} fill className="object-cover" sizes="40px" />
          )}
        </div>
        <div>
          <span className="block text-sm font-medium text-charcoal">{story.name}</span>
          <span className="block text-xs text-charcoal/50">{submittedDate}</span>
        </div>
      </figcaption>
    </figure>
  );
}
