"use client";

import { useState } from "react";
import type { CoursePageSettings } from "@/lib/types";
import { upsertCoursePageSettings } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {settings && <input type="hidden" name="id" value={settings.id} />}
      <p className="text-sm text-charcoal/60">
        On the /courses page, the &ldquo;1, 2, 3&rdquo; badges next to Small groups / Certified
        instructor / Flexible booking can each be replaced with a photo or icon.
        Leave any of these empty to keep the plain numbered badge.
      </p>
      {[1, 2, 3].map((i) => {
        const existingUrl = settings?.[`value_icon_${i}_url` as "value_icon_1_url"];
        return (
          <div key={i} className="space-y-2 rounded-xl bg-sage-50/60 p-4">
            <label className="block text-sm font-medium text-charcoal">
              Icon/photo {i} <span className="font-normal text-charcoal/40">(optional)</span>
            </label>
            <input
              name={`value_icon_${i}`}
              type="file"
              accept="image/*"
              className="w-full text-sm"
            />
            {existingUrl && (
              <label className="flex items-center gap-2 text-xs text-charcoal/60">
                <input type="checkbox" name={`remove_value_icon_${i}`} />
                Remove current photo
              </label>
            )}
          </div>
        );
      })}
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
