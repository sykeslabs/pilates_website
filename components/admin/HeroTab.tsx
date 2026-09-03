"use client";

import { useState } from "react";
import type { HeroSection } from "@/lib/types";
import { upsertHeroSection } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { PhotoField } from "@/components/admin/PhotoField";

const SLOT_LABELS = [
  "Photo 1 (required for both modes)",
  "Photo 2 (required for collage)",
  "Photo 3 (optional, collage only)",
  "Photo 4 (optional, collage only)",
];

export function HeroTab({ hero }: { hero: HeroSection | null }) {
  const [layout, setLayout] = useState<HeroSection["layout"]>(hero?.layout ?? "illustration");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const slotCount = layout === "single_photo" ? 1 : layout === "collage" ? 4 : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData(e.currentTarget);

      for (let i = 1; i <= 4; i++) {
        const photo = formData.get(`photo_${i}`);
        formData.delete(`photo_${i}`);
        if (photo instanceof File && photo.size > 0) {
          formData.set(`photo_${i}_url`, await uploadPhoto(photo, `hero/photo-${i}`));
        }
      }

      if (layout === "collage") {
        const filled =
          [1, 2, 3, 4].filter((i) => {
            const removed = formData.get(`remove_photo_${i}`) === "on";
            const hasExisting = Boolean(hero?.[`photo_${i}_url` as "photo_1_url"]) && !removed;
            const hasNew = Boolean(formData.get(`photo_${i}_url`));
            return hasExisting || hasNew;
          }).length;
        if (filled < 2) throw new Error("Collage needs at least 2 photos.");
      }
      if (layout === "single_photo") {
        const removed = formData.get("remove_photo_1") === "on";
        const hasExisting = Boolean(hero?.photo_1_url) && !removed;
        const hasNew = Boolean(formData.get("photo_1_url"));
        if (!hasExisting && !hasNew) throw new Error("Single photo mode needs a photo.");
      }

      await upsertHeroSection(formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {hero && <input type="hidden" name="id" value={hero.id} />}
      <div>
        <label className="block text-sm font-medium text-charcoal">Homepage hero layout</label>
        <p className="mt-1 text-xs text-charcoal/50">
          Controls the big banner at the very top of the homepage. &quot;Illustration&quot; shows a
          simple graphic and needs no photo. &quot;Single photo&quot; shows one large photo — upload it
          below. &quot;Collage&quot; shows 2-4 photos scattered and rotated for a playful look — upload
          as many as you have (at least 2).
        </p>
        <select
          name="layout"
          value={layout}
          onChange={(e) => setLayout(e.target.value as HeroSection["layout"])}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        >
          <option value="illustration">Illustration (default, no photo needed)</option>
          <option value="single_photo">Single photo</option>
          <option value="collage">Collage (2-4 photos)</option>
        </select>
      </div>

      {slotCount > 0 && (
        <div className="space-y-4">
          {Array.from({ length: slotCount }, (_, idx) => idx + 1).map((i) => {
            const existingUrl = hero?.[`photo_${i}_url` as "photo_1_url"];
            return (
              <div key={i} className="rounded-xl bg-sage-50/60 p-4">
                <PhotoField
                  name={`photo_${i}`}
                  label={SLOT_LABELS[i - 1]}
                  existingUrl={existingUrl}
                  removeName={`remove_photo_${i}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-sage-700">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sage-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
