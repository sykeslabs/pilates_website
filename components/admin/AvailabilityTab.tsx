"use client";

import { useState } from "react";
import type { CourseType } from "@/lib/types";
import type { SlotWithCourse } from "@/lib/adminTypes";
import {
  createAvailabilitySlots,
  deactivateAvailabilitySlot,
  deleteAvailabilitySlot,
} from "@/app/actions/admin";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function NewSlotForm({ courses }: { courses: CourseType[] }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeCourses = courses.filter((c) => c.is_active);
  const [courseId, setCourseId] = useState(activeCourses[0]?.id ?? "");
  const selectedCourse = activeCourses.find((c) => c.id === courseId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const date = formData.get("date")?.toString();
      const startTime = formData.get("start_time")?.toString();
      const repeatWeeks = Math.max(1, Number(formData.get("repeat_weeks")) || 1);

      if (!courseId || !date || !startTime || !selectedCourse) {
        throw new Error("All fields are required.");
      }

      // Parsed with the browser's local timezone (the studio's), not the
      // server's — this is what keeps class times correct across DST.
      const [year, month, day] = date.split("-").map(Number);
      const [hour, minute] = startTime.split(":").map(Number);

      const starts: string[] = [];
      for (let week = 0; week < repeatWeeks; week++) {
        const start = new Date(year, month - 1, day, hour, minute);
        start.setDate(start.getDate() + week * 7);
        starts.push(start.toISOString());
      }

      await createAvailabilitySlots({
        course_type_id: courseId,
        starts,
        duration_minutes: selectedCourse.duration_minutes,
        capacity: selectedCourse.capacity_default,
      });
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (activeCourses.length === 0) {
    return (
      <p className="text-sm text-charcoal/60">
        Add a course type first before opening availability.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 rounded-2xl border border-sage-100 bg-white p-6 sm:grid-cols-5"
    >
      <div className="col-span-2 sm:col-span-2">
        <label className="block text-sm font-medium text-charcoal">Course</label>
        <select
          name="course_type_id"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2"
        >
          {activeCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Date</label>
        <input
          name="date"
          type="date"
          required
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Start time</label>
        <input
          name="start_time"
          type="time"
          required
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Repeat weekly</label>
        <input
          name="repeat_weeks"
          type="number"
          min={1}
          max={26}
          defaultValue={1}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2"
        />
      </div>
      {selectedCourse && (
        <p className="col-span-full text-xs text-charcoal/50">
          Uses this course&apos;s defaults: {selectedCourse.duration_minutes} min, capacity{" "}
          {selectedCourse.capacity_default}.
        </p>
      )}
      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
      <div className="col-span-full">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sage-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add availability"}
        </button>
      </div>
    </form>
  );
}

export function AvailabilityTab({
  courses,
  slots,
}: {
  courses: CourseType[];
  slots: SlotWithCourse[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDeactivate(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await deactivateAvailabilitySlot(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await deleteAvailabilitySlot(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <NewSlotForm courses={courses} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage-50 text-charcoal/70">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Booked</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id} className="border-t border-sage-100">
                <td className="px-4 py-3">{dateTimeFormatter.format(new Date(slot.start_time))}</td>
                <td className="px-4 py-3">{slot.course_types?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {slot.booked_count} / {slot.capacity}
                </td>
                <td className="px-4 py-3">{slot.is_active ? "Open" : "Hidden"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {slot.is_active && (
                      <button
                        onClick={() => handleDeactivate(slot.id)}
                        disabled={pendingId === slot.id}
                        className="rounded-full border border-sage-100 px-3 py-1 text-xs hover:border-sage-300 disabled:opacity-60"
                      >
                        Hide
                      </button>
                    )}
                    {slot.booked_count === 0 && (
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={pendingId === slot.id}
                        className="rounded-full border border-sage-100 px-3 py-1 text-xs text-red-600 hover:border-red-300 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {slots.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-charcoal/50">
                  No upcoming availability yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
