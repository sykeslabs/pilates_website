"use client";

import { useState } from "react";
import type { CourseType } from "@/lib/types";
import { setCourseTypeActive, upsertCourseType } from "@/app/actions/admin";

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
      await upsertCourseType(new FormData(e.currentTarget));
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {course && <input type="hidden" name="id" value={course.id} />}
      <div>
        <label className="block text-sm font-medium text-charcoal">Name</label>
        <input
          name="name"
          required
          defaultValue={course?.name}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={course?.description}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
      <div>
        <label className="block text-sm font-medium text-charcoal">Photo</label>
        <input
          name="photo"
          type="file"
          accept="image/*"
          className="mt-1 w-full text-sm"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          {course?.photo_url ? "Leave empty to keep the current photo." : "Optional for now."}
        </p>
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

      {adding ? (
        <CourseForm course={null} onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border border-dashed border-sage-300 py-4 text-sm font-medium text-sage-700 hover:bg-sage-50"
        >
          + Add a course type
        </button>
      )}
    </div>
  );
}
