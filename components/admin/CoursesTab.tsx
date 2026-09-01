"use client";

import { useState } from "react";
import type { CourseType } from "@/lib/types";
import { setCourseTypeActive, upsertCourseType } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { PhotoField } from "@/components/admin/PhotoField";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CourseForm({
  course,
  onDone,
}: {
  course: CourseType | null;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const photo = formData.get("photo");
      formData.delete("photo");
      const name = formData.get("name")?.toString().trim() || "course";

      if (photo instanceof File && photo.size > 0) {
        formData.set("photo_url", await uploadPhoto(photo, `courses/${slugify(name)}`));
      }

      for (let i = 2; i <= 7; i++) {
        const galleryPhoto = formData.get(`photo_${i}`);
        formData.delete(`photo_${i}`);
        if (galleryPhoto instanceof File && galleryPhoto.size > 0) {
          formData.set(
            `photo_${i}_url`,
            await uploadPhoto(galleryPhoto, `courses/${slugify(name)}-${i}`),
          );
        }
      }

      await upsertCourseType(formData);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const languages = [
    { suffix: "", flag: "🇬🇧", label: "English", required: true },
    { suffix: "_de", flag: "🇩🇪", label: "German", required: false },
    { suffix: "_fr", flag: "🇫🇷", label: "French", required: false },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {course && <input type="hidden" name="id" value={course.id} />}
      {languages.map((lang) => (
        <div key={lang.suffix} className="space-y-3 rounded-xl bg-sage-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-700">
            {lang.flag} {lang.label}
            {!lang.required && <span className="font-normal text-charcoal/40"> (optional — falls back to English)</span>}
          </p>
          <div>
            <label className="block text-sm font-medium text-charcoal">Name</label>
            <input
              name={`name${lang.suffix}`}
              required={lang.required}
              defaultValue={course?.[`name${lang.suffix}` as "name"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">
              Brief description <span className="font-normal text-charcoal/40">(homepage)</span>
            </label>
            <input
              name={`brief_description${lang.suffix}`}
              required={lang.required}
              defaultValue={course?.[`brief_description${lang.suffix}` as "brief_description"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">
              Full description <span className="font-normal text-charcoal/40">(course details page)</span>
            </label>
            <textarea
              name={`description${lang.suffix}`}
              rows={3}
              defaultValue={course?.[`description${lang.suffix}` as "description"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">
              Badge <span className="font-normal text-charcoal/40">(optional — e.g. &quot;Most Popular&quot;)</span>
            </label>
            <input
              name={`badge_label${lang.suffix}`}
              defaultValue={course?.[`badge_label${lang.suffix}` as "badge_label"] ?? ""}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-charcoal">Class type</label>
          <select
            name="class_type"
            defaultValue={course?.class_type ?? "group"}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
          >
            <option value="group">Group</option>
            <option value="private">Private</option>
            <option value="semi_private">Semi-private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal">Duration (min)</label>
          <input
            name="duration_minutes"
            type="number"
            min={1}
            required
            defaultValue={course?.duration_minutes ?? 60}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal">Default capacity</label>
          <input
            name="capacity_default"
            type="number"
            min={1}
            required
            defaultValue={course?.capacity_default ?? 6}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal">Price (CHF)</label>
          <input
            name="price_chf"
            type="number"
            step="0.01"
            min={0}
            defaultValue={course?.price_chf ?? ""}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
          />
        </div>
      </div>
      <PhotoField
        name="photo"
        label="Photo"
        existingUrl={course?.photo_url}
        removeName="remove_photo"
        hint={course?.photo_url ? "Leave empty to keep the current photo." : "Optional for now."}
      />

      <div className="space-y-4">
        <p className="text-sm font-medium text-charcoal">
          Course page gallery{" "}
          <span className="font-normal text-charcoal/40">
            (up to 7 photos incl. the one above, shown as a slider on the course details page only —
            auto-advances, with manual left/right arrows)
          </span>
        </p>
        {[2, 3, 4, 5, 6, 7].map((i) => {
          const existingUrl = course?.[`photo_${i}_url` as "photo_2_url"];
          return (
            <div key={i} className="rounded-xl bg-sage-50/60 p-4">
              <PhotoField
                name={`photo_${i}`}
                label={`Photo ${i}`}
                existingUrl={existingUrl}
                removeName={`remove_photo_${i}`}
              />
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sage-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
        >
          {pending ? "Saving…" : course ? "Save changes" : "Add course"}
        </button>
        {course && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-sage-100 px-5 py-2 text-sm font-medium text-charcoal hover:border-sage-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function CoursesTab({ courses }: { courses: CourseType[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleActive(id: string, isActive: boolean) {
    setPendingId(id);
    try {
      await setCourseTypeActive(id, !isActive);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {adding ? (
        <CourseForm course={null} onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl bg-sage-700 py-4 text-sm font-medium text-white transition hover:bg-sage-500"
        >
          + Add a course type
        </button>
      )}

      {courses.map((course) =>
        editingId === course.id ? (
          <CourseForm key={course.id} course={course} onDone={() => setEditingId(null)} />
        ) : (
          <div
            key={course.id}
            className="flex items-center justify-between rounded-2xl border border-sage-100 bg-white p-5"
          >
            <div>
              <div className="font-medium text-charcoal">
                {course.name}
                <span className="ml-2 rounded-full bg-sage-100 px-2 py-0.5 text-xs text-sage-700">
                  {course.class_type === "private"
                    ? "Private"
                    : course.class_type === "semi_private"
                      ? "Semi-private"
                      : "Group"}
                </span>
                {!course.is_active && (
                  <span className="ml-2 rounded-full bg-charcoal/10 px-2 py-0.5 text-xs text-charcoal/60">
                    Hidden
                  </span>
                )}
              </div>
              <div className="text-sm text-charcoal/60">
                {course.duration_minutes} min · capacity {course.capacity_default}
                {course.price_chf != null && ` · CHF ${course.price_chf.toFixed(2)}`}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(course.id)}
                className="rounded-full border border-sage-100 px-4 py-2 text-sm text-charcoal hover:border-sage-300"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(course.id, course.is_active)}
                disabled={pendingId === course.id}
                className="rounded-full border border-sage-100 px-4 py-2 text-sm text-charcoal hover:border-sage-300 disabled:opacity-60"
              >
                {course.is_active ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
