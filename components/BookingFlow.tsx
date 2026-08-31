"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyBooking, notifyWaitlistJoin } from "@/app/actions/booking";
import { courseName } from "@/lib/i18n/content";
import { localeTags, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { AvailabilitySlot, CourseType } from "@/lib/types";

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

  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(initialCourse);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function selectCourse(course: CourseType) {
    setSelectedCourse(course);
    setSelectedSlot(null);
    setJoiningWaitlist(false);
    setSlots(null);
    setSlotsError(null);
  }

  function selectSlot(slot: AvailabilitySlot, waitlist: boolean) {
    setSelectedSlot(slot);
    setJoiningWaitlist(waitlist);
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
          setSlotsError(dict.book.loadTimesError);
          return;
        }
        setSlots(data ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCourse, dict.book.loadTimesError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !selectedCourse) return;

    setSubmitting(true);
    setSubmitError(null);

    const supabase = createClient();

    if (joiningWaitlist) {
      const { error } = await supabase.from("waitlist_entries").insert({
        slot_id: selectedSlot.id,
        participant_name: name,
        email,
        phone: phone || null,
        remark: remark || null,
      });

      setSubmitting(false);

      if (error) {
        setSubmitError(error.message || dict.book.genericWaitlistError);
        return;
      }

      notifyWaitlistJoin({
        participantName: name,
        participantEmail: email,
        participantPhone: phone || null,
        courseName: courseName(selectedCourse, locale),
        startTime: selectedSlot.start_time,
      }).catch(() => {});

      setConfirmed(true);
      return;
    }

    const { error } = await supabase.rpc("book_slot", {
      p_slot_id: selectedSlot.id,
      p_participant_name: name,
      p_email: email,
      p_phone: phone || null,
      p_remark: remark || null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message || dict.book.genericBookError);
      return;
    }

    // The booking is already confirmed at this point — email is a
    // best-effort extra, not a condition for showing the confirmation.
    notifyBooking({
      participantName: name,
      participantEmail: email,
      participantPhone: phone || null,
      participantRemark: remark || null,
      courseName: courseName(selectedCourse, locale),
      startTime: selectedSlot.start_time,
    }).catch(() => {});

    setConfirmed(true);
  }

  if (confirmed && selectedCourse && selectedSlot) {
    return (
      <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-charcoal">
          {joiningWaitlist ? dict.book.waitlistConfirmedTitle : dict.book.confirmedTitle}
        </h2>
        <p className="mt-3 text-charcoal/70">
          {courseName(selectedCourse, locale)} {dict.book.confirmedOn}{" "}
          {dateFormatter.format(new Date(selectedSlot.start_time))} {dict.book.confirmedAt}{" "}
          {timeFormatter.format(new Date(selectedSlot.start_time))}.
        </p>
        <p className="mt-1 text-sm text-charcoal/60">
          {(joiningWaitlist ? dict.book.waitlistConfirmedFooter : dict.book.confirmedFooter).replace(
            "{email}",
            email,
          )}
        </p>
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
              <div className="font-medium text-charcoal">{courseName(course, locale)}</div>
              <div className="text-sm text-charcoal/60">
                {course.duration_minutes} {dict.common.minutesShort}
                {course.price_chf != null &&
                  ` · CHF ${course.price_chf.toFixed(2)} ${
                    course.class_type === "private" ? dict.common.perSession : dict.common.perPerson
                  }`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedCourse && (
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
                    return (
                      <div
                        key={slot.id}
                        className={`p-4 ${selectedSlot?.id === slot.id ? "bg-sage-50" : "bg-white"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
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
                          onClick={() => selectSlot(slot, isFull)}
                          className={`mt-3 w-full rounded-full px-4 py-2 text-sm font-medium transition ${
                            selectedSlot?.id === slot.id
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
                        <th className="px-4 py-3 font-medium">{dict.book.dateColumn}</th>
                        <th className="px-4 py-3 font-medium">{dict.book.timeColumn}</th>
                        <th className="px-4 py-3 font-medium">{dict.book.spotsColumn}</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot) => {
                        const isFull = slot.booked_count >= slot.capacity;
                        return (
                          <tr
                            key={slot.id}
                            className={`border-t border-sage-100 ${
                              selectedSlot?.id === slot.id ? "bg-sage-50" : "bg-white"
                            }`}
                          >
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
                                onClick={() => selectSlot(slot, isFull)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                  selectedSlot?.id === slot.id
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

      {selectedSlot && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-700">
            {dict.book.step3}
          </h2>
          {joiningWaitlist && (
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
              {joiningWaitlist
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
