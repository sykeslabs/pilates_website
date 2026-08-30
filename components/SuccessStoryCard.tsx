import Image from "next/image";
import type { SuccessStory } from "@/lib/types";

export function SuccessStoryCard({ story }: { story: SuccessStory }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm">
      <blockquote className="flex-1 text-sm leading-relaxed text-charcoal/80">
        &ldquo;{story.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sage-50">
          {story.photo_url && (
            <Image src={story.photo_url} alt={story.name} fill className="object-cover" />
          )}
        </div>
        <span className="text-sm font-medium text-charcoal">{story.name}</span>
      </figcaption>
    </figure>
  );
}
