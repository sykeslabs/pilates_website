"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyBooking } from "@/app/actions/booking";
import type { AvailabilitySlot, CourseType } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export function BookingFlow({
  courses,
  initialCourseSlug,
}: {
  courses: CourseType[];
  initialCourseSlug?: string;
}) {
  const initialCourse = useMemo(
    () => courses.find((c) => c.slug === initialCourseSlug) ?? null,
    [courses, initialCourseSlug],
  );

  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(initialCourse);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function selectCourse(course: CourseType) {
    setSelectedCourse(course);
    setSelectedSlot(null);
    setSlots(null);
    setSlotsError(null);
  }

  useEffect(() => {
    if (!selectedCourse) return;

    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("availability_slots")
      .select("*")
      .eq("course_type_id", selectedCourse.id)
      .eq("is_active", true)
      .gt("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .returns<AvailabilitySlot[]>()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setSlotsError("Could not load available times. Please try again.");
          return;
        }
        setSlots((data ?? []).filter((slot) => slot.booked_count < slot.capacity));
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCourse]);

  const slotsByDate = useMemo(() => {
    if (!slots) return [];
    const groups = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const key = new Date(slot.start_time).toDateString();
      const existing = groups.get(key);
      if (existing) existing.push(slot);
      else groups.set(key, [slot]);
    }
    return Array.from(groups.values());
  }, [slots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !selectedCourse) return;

    setSubmitting(true);
    setSubmitError(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("book_slot", {
      p_slot_id: selectedSlot.id,
      p_participant_name: name,
      p_email: email,
      p_phone: phone || null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message || "This slot could not be booked. Please pick another time.");
      return;
    }

    // The booking is already confirmed at this point — email is a
    // best-effort extra, not a condition for showing the confirmation.
    notifyBooking({
      participantName: name,
      participantEmail: email,
      participantPhone: phone || null,
      courseName: selectedCourse.name,
      startTime: selectedSlot.start_time,
    }).catch(() => {});

    setConfirmed(true);
  }

  if (confirmed && selectedCourse && selectedSlot) {
    return (
      <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-charcoal">You&apos;re booked!</h2>
        <p className="mt-3 text-charcoal/70">
          {selectedCourse.name} on {dateFormatter.format(new Date(selectedSlot.start_time))} at{" "}
          {timeFormatter.format(new Date(selectedSlot.start_time))}.
        </p>
        <p className="mt-1 text-sm text-charcoal/60">
          We&apos;ve got your details ({email}) — see you on the mat!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
          1. Choose a course
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => selectCourse(course)}
              className={`rounded-xl border p-4 text-left transition ${
                selectedCourse?.id === course.id
                  ? "border-sage-700 bg-sage-50"
                  : "border-sage-100 bg-white hover:border-sage-300"
              }`}
            >
              <div className="font-medium text-charcoal">{course.name}</div>
              <div className="text-sm text-charcoal/60">
                {course.duration_minutes} min
                {course.price_chf != null && ` · CHF ${course.price_chf.toFixed(2)}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
            2. Choose a time
          </h2>
          <div className="mt-4">
            {slotsError && <p className="text-sm text-red-600">{slotsError}</p>}
            {!slotsError && slots === null && (
              <p className="text-sm text-charcoal/60">Loading available times…</p>
            )}
            {!slotsError && slots !== null && slots.length === 0 && (
              <p className="text-sm text-charcoal/60">
                No upcoming times are open for this course right now. Please check back soon.
              </p>
            )}
            <div className="space-y-6">
              {slotsByDate.map((group) => (
                <div key={group[0].id}>
                  <div className="mb-2 text-sm font-medium text-charcoal/70">
                    {dateFormatter.format(new Date(group[0].start_time))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selectedSlot?.id === slot.id
                            ? "border-sage-700 bg-sage-700 text-white"
                            : "border-sage-100 bg-white text-charcoal hover:border-sage-300"
                        }`}
                      >
                        {timeFormatter.format(new Date(slot.start_time))}
                        <span className="ml-1 text-xs opacity-70">
                          ({slot.capacity - slot.booked_count} left)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedSlot && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
            3. Your details
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal">
                Full name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-charcoal">
                Phone (optional)
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-sage-700 px-4 py-3 font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
