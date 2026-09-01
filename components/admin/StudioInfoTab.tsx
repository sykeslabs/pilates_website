"use client";

import { useState } from "react";
import type { StudioInfo } from "@/lib/types";
import { upsertStudioInfo } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { PhotoField } from "@/components/admin/PhotoField";

export function StudioInfoTab({ studio }: { studio: StudioInfo | null }) {
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

      for (let i = 1; i <= 7; i++) {
        const photo = formData.get(`photo_${i}`);
        formData.delete(`photo_${i}`);
        if (photo instanceof File && photo.size > 0) {
          formData.set(`photo_${i}_url`, await uploadPhoto(photo, `studio/photo-${i}`));
        }
      }

      await upsertStudioInfo(formData);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {studio && <input type="hidden" name="id" value={studio.id} />}
      <div>
        <label className="block text-sm font-medium text-charcoal">Phone</label>
        <input
          name="phone"
          defaultValue={studio?.phone}
          placeholder="+41 44 123 45 67"
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Public email</label>
        <input
          name="email"
          type="email"
          defaultValue={studio?.email}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Address</label>
        <textarea
          name="address"
          rows={3}
          defaultValue={studio?.address}
          placeholder={"Studio Pilates\nBahnhofstrasse 10\n8001 Zürich"}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => {
          const existingUrl = studio?.[`photo_${i}_url` as "photo_1_url"];
          return (
            <div key={i} className="rounded-xl bg-sage-50/60 p-4">
              <PhotoField
                name={`photo_${i}`}
                label={`Studio photo ${i}${i > 2 ? " (optional)" : ""}`}
                existingUrl={existingUrl}
                removeName={`remove_photo_${i}`}
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
