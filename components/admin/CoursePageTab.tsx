"use client";

import { useState } from "react";
import type { CoursePageSettings } from "@/lib/types";
import { upsertCoursePageSettings } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { PhotoField } from "@/components/admin/PhotoField";

const VALUE_LABELS = ["Small groups", "Certified instructor", "Flexible booking"];

export function CoursePageTab({ settings }: { settings: CoursePageSettings | null }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData(e.currentTarget);

      for (let i = 1; i <= 3; i++) {
        const icon = formData.get(`value_icon_${i}`);
        formData.delete(`value_icon_${i}`);
        if (icon instanceof File && icon.size > 0) {
          formData.set(`value_icon_${i}_url`, await uploadPhoto(icon, `course-page/icon-${i}`));
        }
        const heroPhoto = formData.get(`hero_photo_${i}`);
        formData.delete(`hero_photo_${i}`);
        if (heroPhoto instanceof File && heroPhoto.size > 0) {
          formData.set(
            `hero_photo_${i}_url`,
            await uploadPhoto(heroPhoto, `course-page/hero-${i}`),
          );
        }
      }

      await upsertCoursePageSettings(formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-sage-100 bg-white p-6">
      {settings && <input type="hidden" name="id" value={settings.id} />}

      <div className="space-y-4">
        <p className="text-sm text-charcoal/60">
          On the /courses page, the icons next to Small groups / Certified instructor / Flexible
          booking can each be replaced with your own photo. Leave any of these empty to keep the
          built-in icon.
        </p>
        {[1, 2, 3].map((i) => {
          const existingUrl = settings?.[`value_icon_${i}_url` as "value_icon_1_url"];
          return (
            <div key={i} className="rounded-xl bg-sage-50/60 p-4">
              <PhotoField
                name={`value_icon_${i}`}
                label={`${VALUE_LABELS[i - 1]} icon (optional)`}
                existingUrl={existingUrl}
                removeName={`remove_value_icon_${i}`}
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-4 border-t border-sage-100 pt-6">
        <p className="text-sm text-charcoal/60">
          The three rotated photos on the left of the /courses page intro can also be replaced.
          Leave any of these empty to keep the placeholder illustration.
        </p>
        {[1, 2, 3].map((i) => {
          const existingUrl = settings?.[`hero_photo_${i}_url` as "hero_photo_1_url"];
          return (
            <div key={i} className="rounded-xl bg-sage-50/60 p-4">
              <PhotoField
                name={`hero_photo_${i}`}
                label={`Hero photo ${i} (optional)`}
                existingUrl={existingUrl}
                removeName={`remove_hero_photo_${i}`}
              />
            </div>
          );
        })}
      </div>

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
