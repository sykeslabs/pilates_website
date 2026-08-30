"use client";

import { useState } from "react";
import type { BookingWithSlot } from "@/lib/adminTypes";
import { cancelBooking } from "@/app/actions/admin";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function BookingsTab({ bookings }: { bookings: BookingWithSlot[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel(id: string) {
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

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage-50 text-charcoal/70">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-sage-100">
                <td className="px-4 py-3">
                  {booking.availability_slots
                    ? dateTimeFormatter.format(new Date(booking.availability_slots.start_time))
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {booking.availability_slots?.course_types?.name ?? "—"}
                </td>
                <td className="px-4 py-3">{booking.participant_name}</td>
                <td className="px-4 py-3">
                  <div>{booking.email}</div>
                  {booking.phone && <div className="text-charcoal/60">{booking.phone}</div>}
                </td>
                <td className="px-4 py-3 capitalize">{booking.status}</td>
                <td className="px-4 py-3 text-right">
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={pendingId === booking.id}
                      className="rounded-full border border-sage-100 px-3 py-1 text-xs text-red-600 hover:border-red-300 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-charcoal/50">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
