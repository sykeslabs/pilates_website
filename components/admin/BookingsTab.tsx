"use client";

import { useMemo, useState } from "react";
import type { CourseType } from "@/lib/types";
import type { BookingWithSlot, WaitlistEntryWithSlot } from "@/lib/adminTypes";
import { cancelBooking, deleteWaitlistEntry } from "@/app/actions/admin";
import { downloadCsv } from "@/lib/csv";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type CombinedRow = {
  id: string;
  kind: "booking" | "waitlist";
  slotId: string | null;
  when: string | null;
  course: string | null;
  capacity: number | null;
  bookedCount: number | null;
  participantName: string;
  email: string;
  phone: string | null;
  remark: string | null;
  priceChf: number | null;
  status: "confirmed" | "cancelled" | "waiting";
  createdAt: string;
};

type SortKey = "when" | "course" | "capacity" | "status";
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

export function BookingsTab({
  bookings,
  waitlistEntries,
  courses,
  slotFilter,
  onClearSlotFilter,
}: {
  bookings: BookingWithSlot[];
  waitlistEntries: WaitlistEntryWithSlot[];
  courses: CourseType[];
  slotFilter?: string | null;
  onClearSlotFilter?: () => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("when");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const waitlistCountBySlot = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of waitlistEntries) {
      map.set(entry.slot_id, (map.get(entry.slot_id) ?? 0) + 1);
    }
    return map;
  }, [waitlistEntries]);

  const allRows = useMemo<CombinedRow[]>(() => {
    const bookingRows: CombinedRow[] = bookings.map((b) => ({
      id: b.id,
      kind: "booking",
      slotId: b.slot_id,
      when: b.availability_slots?.start_time ?? null,
      course: b.availability_slots?.course_types?.name ?? null,
      capacity: b.availability_slots?.capacity ?? null,
      bookedCount: b.availability_slots?.booked_count ?? null,
      participantName: b.participant_name,
      email: b.email,
      phone: b.phone,
      remark: b.remark,
      priceChf: b.price_chf,
      status: b.status,
      createdAt: b.created_at,
    }));
    const waitlistRows: CombinedRow[] = waitlistEntries.map((w) => ({
      id: w.id,
      kind: "waitlist",
      slotId: w.slot_id,
      when: w.availability_slots?.start_time ?? null,
      course: w.availability_slots?.course_types?.name ?? null,
      capacity: w.availability_slots?.capacity ?? null,
      bookedCount: w.availability_slots?.booked_count ?? null,
      participantName: w.participant_name,
      email: w.email,
      phone: w.phone,
      remark: w.remark,
      priceChf: null,
      status: "waiting",
      createdAt: w.created_at,
    }));
    return [...bookingRows, ...waitlistRows];
  }, [bookings, waitlistEntries]);

  const rows = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    const filtered = allRows.filter((row) => {
      if (slotFilter) return row.slotId === slotFilter;
      if (from || to) {
        if (!row.when) return false;
        const when = new Date(row.when);
        if (from && when < from) return false;
        if (to && when > to) return false;
      }
      if (courseFilter !== "all") {
        const course = courses.find((c) => c.id === courseFilter);
        if (!course || row.course !== course.name) return false;
      }
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "course":
          return (a.course ?? "").localeCompare(b.course ?? "") * dir;
        case "capacity": {
          const aRatio = a.capacity ? (a.bookedCount ?? 0) / a.capacity : -1;
          const bRatio = b.capacity ? (b.bookedCount ?? 0) / b.capacity : -1;
          return (aRatio - bRatio) * dir;
        }
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "when":
        default:
          return (
            (a.when ? new Date(a.when).getTime() : 0) -
              (b.when ? new Date(b.when).getTime() : 0)
          ) * dir;
      }
    });
  }, [allRows, fromDate, toDate, courseFilter, statusFilter, sortKey, sortDir, courses, slotFilter]);

  async function handleCancelBooking(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await cancelBooking(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemoveWaitlist(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await deleteWaitlistEntry(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  function handleExport() {
    downloadCsv(
      `bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((row) => ({
        type: row.kind,
        when: row.when ? dateTimeFormatter.format(new Date(row.when)) : "",
        course: row.course ?? "",
        capacity:
          row.capacity != null && row.bookedCount != null
            ? `${row.bookedCount}/${row.capacity}`
            : "",
        name: row.participantName,
        email: row.email,
        phone: row.phone ?? "",
        price_chf: row.priceChf ?? "",
        status: row.status,
        remark: row.remark ?? "",
      })),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal/60">Bookings and waitlist requests.</p>
        <button
          onClick={handleExport}
          disabled={rows.length === 0}
          className="rounded-full bg-sage-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-500 disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {slotFilter ? (
        <div className="flex items-center justify-between rounded-2xl border border-sage-100 bg-sage-50 px-4 py-3">
          <p className="text-sm text-charcoal">
            Showing participants for the selected session only.
          </p>
          <button
            onClick={onClearSlotFilter}
            className="rounded-full border border-sage-300 bg-white px-4 py-1.5 text-sm font-medium text-charcoal transition hover:border-sage-500"
          >
            Clear filter
          </button>
        </div>
      ) : (
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
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="waiting">Waiting</option>
          </select>
        </div>
      </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-sage-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
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
                label="Capacity"
                sortKeyValue="capacity"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Price</th>
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
            {rows.map((row) => (
              <tr key={`${row.kind}-${row.id}`} className="border-t border-sage-100">
                <td className="px-4 py-3">
                  {row.when ? dateTimeFormatter.format(new Date(row.when)) : "—"}
                </td>
                <td className="px-4 py-3">{row.course ?? "—"}</td>
                <td className="px-4 py-3">
                  {row.capacity != null && row.bookedCount != null
                    ? `${row.bookedCount} / ${row.capacity}`
                    : "—"}
                  {row.slotId && (waitlistCountBySlot.get(row.slotId) ?? 0) > 0 && (
                    <span className="ml-2 rounded-full bg-terracotta-300/40 px-2 py-0.5 text-xs font-medium text-charcoal">
                      {waitlistCountBySlot.get(row.slotId)} waiting
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>{row.participantName}</div>
                  {row.remark && (
                    <div className="mt-1 max-w-xs text-xs italic text-charcoal/60">
                      &ldquo;{row.remark}&rdquo;
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>{row.email}</div>
                  {row.phone && <div className="text-charcoal/60">{row.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  {row.priceChf != null ? `CHF ${row.priceChf.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3 capitalize">
                  {row.kind === "waitlist" ? (
                    <span className="rounded-full bg-terracotta-300/40 px-2 py-0.5 text-xs font-medium text-charcoal">
                      Waiting
                    </span>
                  ) : (
                    row.status
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.kind === "booking" && row.status === "confirmed" && (
                    <button
                      onClick={() => handleCancelBooking(row.id)}
                      disabled={pendingId === row.id}
                      className="rounded-full border border-sage-100 px-3 py-1 text-xs text-red-600 hover:border-red-300 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  )}
                  {row.kind === "waitlist" && (
                    <button
                      onClick={() => handleRemoveWaitlist(row.id)}
                      disabled={pendingId === row.id}
                      className="rounded-full border border-sage-100 px-3 py-1 text-xs text-red-600 hover:border-red-300 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-charcoal/50">
                  {allRows.length === 0
                    ? "No bookings or waitlist requests yet."
                    : "No bookings match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
