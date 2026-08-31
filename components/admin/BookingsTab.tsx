"use client";

import { useMemo, useState } from "react";
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
  when: string | null;
  course: string | null;
  participantName: string;
  email: string;
  phone: string | null;
  remark: string | null;
  priceChf: number | null;
  status: string;
  createdAt: string;
};

export function BookingsTab({
  bookings,
  waitlistEntries,
}: {
  bookings: BookingWithSlot[];
  waitlistEntries: WaitlistEntryWithSlot[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo<CombinedRow[]>(() => {
    const bookingRows: CombinedRow[] = bookings.map((b) => ({
      id: b.id,
      kind: "booking",
      when: b.availability_slots?.start_time ?? null,
      course: b.availability_slots?.course_types?.name ?? null,
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
      when: w.availability_slots?.start_time ?? null,
      course: w.availability_slots?.course_types?.name ?? null,
      participantName: w.participant_name,
      email: w.email,
      phone: w.phone,
      remark: w.remark,
      priceChf: null,
      status: "waiting",
      createdAt: w.created_at,
    }));
    return [...bookingRows, ...waitlistRows].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    );
  }, [bookings, waitlistEntries]);

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
        <p className="text-sm text-charcoal/60">Bookings and waitlist requests, most recent first.</p>
        <button
          onClick={handleExport}
          disabled={rows.length === 0}
          className="rounded-full border border-sage-100 px-4 py-2 text-sm text-charcoal hover:border-sage-300 disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage-50 text-charcoal/70">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
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
                <td colSpan={7} className="px-4 py-6 text-center text-charcoal/50">
                  No bookings or waitlist requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
