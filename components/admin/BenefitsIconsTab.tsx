"use client";

import { useState } from "react";
import type { HomeBenefitsSettings } from "@/lib/types";
import { upsertHomeBenefitsSettings } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { PhotoField } from "@/components/admin/PhotoField";

const LABELS = ["Stronger body", "Better posture", "Less stress", "More confidence"];

export function BenefitsIconsTab({ settings }: { settings: HomeBenefitsSettings | null }) {
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

      for (let i = 1; i <= 4; i++) {
        const icon = formData.get(`icon_${i}`);
        formData.delete(`icon_${i}`);
        if (icon instanceof File && icon.size > 0) {
          formData.set(`icon_${i}_url`, await uploadPhoto(icon, `home-benefits/icon-${i}`));
        }
      }

      await upsertHomeBenefitsSettings(formData);
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
        On the homepage, the &ldquo;More than a workout&rdquo; section shows four benefit cards.
        Upload a photo or icon for each one, or leave empty to keep the built-in icon.
      </p>
      {LABELS.map((label, idx) => {
        const i = idx + 1;
        const existingUrl = settings?.[`icon_${i}_url` as "icon_1_url"];
        return (
          <div key={i} className="rounded-xl bg-sage-50/60 p-4">
            <PhotoField
              name={`icon_${i}`}
              label={`${label} (optional)`}
              existingUrl={existingUrl}
              removeName={`remove_icon_${i}`}
            />
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
