"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyBooking, notifyWaitlistJoin } from "@/app/actions/booking";
import { courseName } from "@/lib/i18n/content";
import { localeTags, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { AvailabilitySlot, CourseType } from "@/lib/types";

type BookingResult = { slot: AvailabilitySlot; course: CourseType; waitlisted: boolean };

export function BookingFlow({
  courses,
  initialCourseSlug,
  locale,
  dict,
}: {
  courses: CourseType[];
  initialCourseSlug?: string;
  locale: Locale;
  dict: Pick<Dictionary, "common" | "book">;
}) {
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeTags[locale], {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [locale],
  );
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(localeTags[locale], { hour: "2-digit", minute: "2-digit" }),
    [locale],
  );

  const initialCourse = useMemo(
    () => courses.find((c) => c.slug === initialCourseSlug) ?? null,
    [courses, initialCourseSlug],
  );

  const [selectedCourses, setSelectedCourses] = useState<CourseType[]>(
    initialCourse ? [initialCourse] : [],
  );
  const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingResults, setBookingResults] = useState<BookingResult[]>([]);
  const [partialFailureCount, setPartialFailureCount] = useState(0);

  function toggleCourse(course: CourseType) {
    setSelectedCourses((prev) =>
      prev.some((c) => c.id === course.id)
        ? prev.filter((c) => c.id !== course.id)
        : [...prev, course],
    );
    setSelectedSlots([]);
    setSlots(null);
    setSlotsError(null);
  }

  function toggleSlot(slot: AvailabilitySlot) {
    setSelectedSlots((prev) =>
      prev.some((s) => s.id === slot.id)
        ? prev.filter((s) => s.id !== slot.id)
        : [...prev, slot],
    );
  }

  const selectedCourseIds = useMemo(
    () =>
      selectedCourses
        .map((c) => c.id)
        .sort()
        .join(","),
    [selectedCourses],
  );

  useEffect(() => {
    if (!selectedCourseIds) return;

    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("availability_slots")
      .select("*")
      .in("course_type_id", selectedCourseIds.split(","))
      .eq("is_active", true)
      .gt("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .returns<AvailabilitySlot[]>()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setSlotsError(dict.book.loadTimesError);
          return;
        }
        setSlots(data ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCourseIds, dict.book.loadTimesError]);

  const anySelectedIsWaitlist = selectedSlots.some((s) => s.booked_count >= s.capacity);
  const allSelectedAreWaitlist =
    selectedSlots.length > 0 && selectedSlots.every((s) => s.booked_count >= s.capacity);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedSlots.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    const supabase = createClient();
    const succeeded: BookingResult[] = [];
    let failedCount = 0;
    let firstErrorMessage: string | null = null;

    for (const slot of selectedSlots) {
      const course = courses.find((c) => c.id === slot.course_type_id);
      if (!course) {
        failedCount += 1;
        continue;
      }
      const isFull = slot.booked_count >= slot.capacity;

      if (isFull) {
        const { error } = await supabase.from("waitlist_entries").insert({
          slot_id: slot.id,
          participant_name: name,
          email,
          phone: phone || null,
          remark: remark || null,
        });
        if (error) {
          failedCount += 1;
          firstErrorMessage ??= error.message || null;
          console.error("waitlist insert failed", error);
          continue;
        }
        notifyWaitlistJoin({
          participantName: name,
          participantEmail: email,
          participantPhone: phone || null,
          courseName: courseName(course, locale),
          startTime: slot.start_time,
        }).catch(() => {});
        succeeded.push({ slot, course, waitlisted: true });
      } else {
        const { error } = await supabase.rpc("book_slot", {
          p_slot_id: slot.id,
          p_participant_name: name,
          p_email: email,
          p_phone: phone || null,
          p_remark: remark || null,
        });
        if (error) {
          failedCount += 1;
          firstErrorMessage ??= error.message || null;
          console.error("book_slot failed", error);
          continue;
        }
        // The booking is already confirmed at this point — email is a
        // best-effort extra, not a condition for showing the confirmation.
        notifyBooking({
          participantName: name,
          participantEmail: email,
          participantPhone: phone || null,
          participantRemark: remark || null,
          courseName: courseName(course, locale),
          startTime: slot.start_time,
        }).catch(() => {});
        succeeded.push({ slot, course, waitlisted: false });
      }
    }

    setSubmitting(false);

    if (succeeded.length === 0) {
      setSubmitError(firstErrorMessage || dict.book.genericBookError);
      return;
    }

    setBookingResults(succeeded);
    setPartialFailureCount(failedCount);
    setConfirmed(true);
  }

  if (confirmed && bookingResults.length > 0) {
    const allWaitlisted = bookingResults.every((r) => r.waitlisted);
    const anyWaitlisted = bookingResults.some((r) => r.waitlisted);
    return (
      <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-charcoal">
          {allWaitlisted ? dict.book.waitlistConfirmedTitle : dict.book.confirmedTitle}
        </h2>
        <ul className="mt-4 space-y-2 text-left">
          {bookingResults.map((r) => (
            <li
              key={r.slot.id}
              className="rounded-lg border border-sage-100 px-4 py-2 text-sm text-charcoal/80"
            >
              <span className="font-medium text-charcoal">{courseName(r.course, locale)}</span>{" "}
              {dict.book.confirmedOn} {dateFormatter.format(new Date(r.slot.start_time))}{" "}
              {dict.book.confirmedAt} {timeFormatter.format(new Date(r.slot.start_time))}
              {r.waitlisted && (
                <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-sage-700">
                  {dict.book.joinWaitlistAction}
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-charcoal/60">
          {(anyWaitlisted ? dict.book.waitlistConfirmedFooter : dict.book.confirmedFooter).replace(
            "{email}",
            email,
          )}
        </p>
        {partialFailureCount > 0 && (
          <p className="mt-3 text-sm text-red-600">{dict.book.genericBookError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
          {dict.book.step1}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {courses.map((course) => {
            const isSelected = selectedCourses.some((c) => c.id === course.id);
            return (
              <button
                key={course.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleCourse(course)}
                className={`rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-sage-700 bg-sage-50"
                    : "border-sage-100 bg-white hover:border-sage-300"
                }`}
              >
                <div className="font-medium text-charcoal">{courseName(course, locale)}</div>
                <div className="text-sm text-charcoal/60">
                  {course.duration_minutes} {dict.common.minutesShort}
                  {course.price_chf != null &&
                    ` · CHF ${course.price_chf.toFixed(2)} ${
                      course.class_type === "private" ? dict.common.perSession : dict.common.perPerson
                    }`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCourses.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
            {dict.book.step2}
          </h2>
          <div className="mt-4">
            {slotsError && <p className="text-sm text-red-600">{slotsError}</p>}
            {!slotsError && slots === null && (
              <p className="text-sm text-charcoal/60">{dict.book.loadingTimes}</p>
            )}
            {!slotsError && slots !== null && slots.length === 0 && (
              <p className="text-sm text-charcoal/60">{dict.book.noTimes}</p>
            )}
            {!slotsError && slots !== null && slots.length > 0 && (
              <>
                <div className="divide-y divide-sage-100 rounded-2xl border border-sage-100 sm:hidden">
                  {slots.map((slot) => {
                    const isFull = slot.booked_count >= slot.capacity;
                    const isSelected = selectedSlots.some((s) => s.id === slot.id);
                    const slotCourse = courses.find((c) => c.id === slot.course_type_id);
                    return (
                      <div key={slot.id} className={`p-4 ${isSelected ? "bg-sage-50" : "bg-white"}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            {slotCourse && (
                              <div className="text-xs font-semibold uppercase tracking-wide text-sage-700">
                                {courseName(slotCourse, locale)}
                              </div>
                            )}
                            <div className="font-medium text-charcoal">
                              {dateFormatter.format(new Date(slot.start_time))}
                            </div>
                            <div className="text-sm text-charcoal/70">
                              {timeFormatter.format(new Date(slot.start_time))}
                            </div>
                          </div>
                          <div className="shrink-0 text-sm text-charcoal/70">
                            {isFull
                              ? dict.book.fullBadge
                              : `${slot.capacity - slot.booked_count} ${dict.book.spotsLeftLabel}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleSlot(slot)}
                          className={`mt-3 w-full rounded-full px-4 py-2 text-sm font-medium transition ${
                            isSelected
                              ? "bg-sage-700 text-white"
                              : isFull
                                ? "border border-sage-100 text-charcoal/60 hover:border-sage-300"
                                : "border border-sage-100 text-charcoal hover:border-sage-300"
                          }`}
                        >
                          {isFull ? dict.book.joinWaitlistAction : dict.book.bookAction}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto rounded-2xl border border-sage-100 sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-sage-50 text-charcoal/70">
                      <tr>
                        <th className="px-4 py-3 font-medium">{dict.book.courseColumn}</th>
                        <th className="px-4 py-3 font-medium">{dict.book.dateColumn}</th>
                        <th className="px-4 py-3 font-medium">{dict.book.timeColumn}</th>
                        <th className="px-4 py-3 font-medium">{dict.book.spotsColumn}</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot) => {
                        const isFull = slot.booked_count >= slot.capacity;
                        const isSelected = selectedSlots.some((s) => s.id === slot.id);
                        const slotCourse = courses.find((c) => c.id === slot.course_type_id);
                        return (
                          <tr
                            key={slot.id}
                            className={`border-t border-sage-100 ${
                              isSelected ? "bg-sage-50" : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-3 text-charcoal">
                              {slotCourse ? courseName(slotCourse, locale) : "—"}
                            </td>
                            <td className="px-4 py-3 text-charcoal">
                              {dateFormatter.format(new Date(slot.start_time))}
                            </td>
                            <td className="px-4 py-3 text-charcoal">
                              {timeFormatter.format(new Date(slot.start_time))}
                            </td>
                            <td className="px-4 py-3 text-charcoal/70">
                              {isFull
                                ? dict.book.fullBadge
                                : `${slot.capacity - slot.booked_count} ${dict.book.spotsLeftLabel}`}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleSlot(slot)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                  isSelected
                                    ? "bg-sage-700 text-white"
                                    : isFull
                                      ? "border border-sage-100 text-charcoal/60 hover:border-sage-300"
                                      : "border border-sage-100 text-charcoal hover:border-sage-300"
                                }`}
                              >
                                {isFull ? dict.book.joinWaitlistAction : dict.book.bookAction}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedSlots.length > 0 && (
        <div className="rounded-2xl border border-sage-100 bg-sage-50 p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
            {dict.book.step3}
          </h2>
          {anySelectedIsWaitlist && (
            <p className="mt-2 text-sm text-charcoal/70">{dict.book.waitlistIntro}</p>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-charcoal">
                {dict.book.nameLabel}
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
                {dict.book.emailLabel}
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
                {dict.book.phoneLabel}
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="remark" className="block text-sm font-medium text-charcoal">
                {dict.book.remarkLabel}
              </label>
              <textarea
                id="remark"
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={dict.book.remarkPlaceholder}
                className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-sage-700 px-4 py-3 font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
            >
              {allSelectedAreWaitlist
                ? submitting
                  ? dict.book.waitlistSubmitting
                  : dict.book.waitlistSubmit
                : submitting
                  ? dict.book.submitting
                  : dict.book.submit}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
