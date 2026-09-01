"use client";

import { useMemo, useState } from "react";
import type { CourseType } from "@/lib/types";
import type { SlotWithCourse, WaitlistEntryWithSlot } from "@/lib/adminTypes";
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
    const form = e.currentTarget;
    setPending(true);
    setError(null);
    try {
      const formData = new FormData(form);
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
      form.reset();
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
          className="w-full rounded-full bg-sage-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
        >
          {pending ? "Adding…" : "+ Add availability"}
        </button>
      </div>
    </form>
  );
}

type SortKey = "when" | "course" | "booked" | "status";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  sortKeyValue,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  sortKeyValue: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === sortKeyValue;
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(sortKeyValue)}
        className={`flex items-center gap-1 hover:text-sage-700 ${active ? "text-sage-700" : ""}`}
      >
        {label}
        {active && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

export function AvailabilityTab({
  courses,
  slots,
  waitlistEntries,
  onSelectSlot,
}: {
  courses: CourseType[];
  slots: SlotWithCourse[];
  waitlistEntries: WaitlistEntryWithSlot[];
  onSelectSlot?: (slotId: string) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const waitlistCountBySlot = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of waitlistEntries) {
      map.set(entry.slot_id, (map.get(entry.slot_id) ?? 0) + 1);
    }
    return map;
  }, [waitlistEntries]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("when");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const visibleSlots = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    const filtered = slots.filter((slot) => {
      const start = new Date(slot.start_time);
      if (from && start < from) return false;
      if (to && start > to) return false;
      if (courseFilter !== "all" && slot.course_type_id !== courseFilter) return false;
      if (statusFilter === "open" && !slot.is_active) return false;
      if (statusFilter === "hidden" && slot.is_active) return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "course":
          return (a.course_types?.name ?? "").localeCompare(b.course_types?.name ?? "") * dir;
        case "booked":
          return (a.booked_count / a.capacity - b.booked_count / b.capacity) * dir;
        case "status":
          return (Number(a.is_active) - Number(b.is_active)) * dir;
        case "when":
        default:
          return (new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) * dir;
      }
    });
  }, [slots, fromDate, toDate, courseFilter, statusFilter, sortKey, sortDir]);

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

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-sage-100 bg-white p-4 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-charcoal/60">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal/60">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal/60">Course</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 text-sm"
          >
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal/60">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage-50 text-charcoal/70">
            <tr>
              <SortHeader
                label="When"
                sortKeyValue="when"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Course"
                sortKeyValue="course"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Booked"
                sortKeyValue="booked"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Status"
                sortKeyValue="status"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visibleSlots.map((slot) => (
              <tr
                key={slot.id}
                onClick={() => onSelectSlot?.(slot.id)}
                className={`border-t border-sage-100 transition ${
                  onSelectSlot ? "cursor-pointer hover:bg-sage-50" : ""
                }`}
              >
                <td className="px-4 py-3">{dateTimeFormatter.format(new Date(slot.start_time))}</td>
                <td className="px-4 py-3">{slot.course_types?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {slot.booked_count} / {slot.capacity}
                  {(waitlistCountBySlot.get(slot.id) ?? 0) > 0 && (
                    <span className="ml-2 rounded-full bg-terracotta-300/40 px-2 py-0.5 text-xs font-medium text-charcoal">
                      {waitlistCountBySlot.get(slot.id)} waiting
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{slot.is_active ? "Open" : "Hidden"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {slot.is_active && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeactivate(slot.id);
                        }}
                        disabled={pendingId === slot.id}
                        className="rounded-full border border-sage-100 px-3 py-1 text-xs hover:border-sage-300 disabled:opacity-60"
                      >
                        Hide
                      </button>
                    )}
                    {slot.booked_count === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(slot.id);
                        }}
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
            {visibleSlots.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-charcoal/50">
                  {slots.length === 0
                    ? "No upcoming availability yet."
                    : "No availability matches these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
