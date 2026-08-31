"use client";

import { useState } from "react";
import type { Instructor } from "@/lib/types";
import { upsertInstructor } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

const GALLERY_SLOTS = [1, 2, 3, 4, 5, 6, 7] as const;

export function AboutTab({ instructor }: { instructor: Instructor | null }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const languages = [
    { suffix: "", flag: "🇬🇧", label: "English", required: true },
    { suffix: "_de", flag: "🇩🇪", label: "German", required: false },
    { suffix: "_fr", flag: "🇫🇷", label: "French", required: false },
  ] as const;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData(e.currentTarget);
      const photo = formData.get("photo");
      formData.delete("photo");

      if (photo instanceof File && photo.size > 0) {
        formData.set("photo_url", await uploadPhoto(photo, "instructor/photo"));
      }

      for (const i of GALLERY_SLOTS) {
        const galleryPhoto = formData.get(`photo_${i}`);
        formData.delete(`photo_${i}`);
        if (galleryPhoto instanceof File && galleryPhoto.size > 0) {
          formData.set(`photo_${i}_url`, await uploadPhoto(galleryPhoto, `instructor/gallery-${i}`));
        }
      }

      await upsertInstructor(formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {instructor && <input type="hidden" name="id" value={instructor.id} />}
      <div>
        <label className="block text-sm font-medium text-charcoal">Name</label>
        <input
          name="name"
          required
          defaultValue={instructor?.name}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      {languages.map((lang) => (
        <div key={lang.suffix} className="space-y-3 rounded-xl bg-sage-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-700">
            {lang.flag} {lang.label}
            {!lang.required && (
              <span className="font-normal text-charcoal/40"> (optional — falls back to English)</span>
            )}
          </p>
          <div>
            <label className="block text-sm font-medium text-charcoal">Credentials</label>
            <input
              name={`credentials${lang.suffix}`}
              placeholder="e.g. Certified Comprehensive Pilates Instructor"
              defaultValue={instructor?.[`credentials${lang.suffix}` as "credentials"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Bio</label>
            <div className="mt-1">
              <RichTextEditor
                name={`bio${lang.suffix}`}
                defaultValue={instructor?.[`bio${lang.suffix}` as "bio"]}
              />
            </div>
          </div>
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-charcoal">Portrait photo</label>
        <input name="photo" type="file" accept="image/*" className="mt-1 w-full text-sm" />
        <p className="mt-1 text-xs text-charcoal/50">
          {instructor?.photo_url ? "Leave empty to keep the current photo." : "Optional for now."}
        </p>
        {instructor?.photo_url && (
          <label className="mt-2 flex items-center gap-2 text-xs text-charcoal/60">
            <input type="checkbox" name="remove_photo" />
            Remove current photo
          </label>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-charcoal">
          Gallery photos <span className="font-normal text-charcoal/40">(up to 7, optional)</span>
        </p>
        {GALLERY_SLOTS.map((i) => {
          const existingUrl = instructor?.[`photo_${i}_url` as "photo_1_url"];
          return (
            <div key={i} className="space-y-2 rounded-xl bg-sage-50/60 p-4">
              <label className="block text-sm font-medium text-charcoal">Photo {i}</label>
              <input name={`photo_${i}`} type="file" accept="image/*" className="w-full text-sm" />
              {existingUrl && (
                <label className="flex items-center gap-2 text-xs text-charcoal/60">
                  <input type="checkbox" name={`remove_photo_${i}`} />
                  Remove current photo
                </label>
              )}
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
