"use client";

import { useState } from "react";
import type { CourseType, SuccessStory } from "@/lib/types";
import type { SlotWithCourse, BookingWithSlot } from "@/lib/adminTypes";
import { CoursesTab } from "@/components/admin/CoursesTab";
import { AvailabilityTab } from "@/components/admin/AvailabilityTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { StoriesTab } from "@/components/admin/StoriesTab";
import { LogoutButton } from "@/components/admin/LogoutButton";

const TABS = ["Courses", "Availability", "Bookings", "Success stories"] as const;
type Tab = (typeof TABS)[number];

export function AdminDashboard({
  courses,
  successStories,
  slots,
  bookings,
}: {
  courses: CourseType[];
  successStories: SuccessStory[];
  slots: SlotWithCourse[];
  bookings: BookingWithSlot[];
}) {
  const [tab, setTab] = useState<Tab>("Courses");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Studio dashboard</h1>
        <LogoutButton />
      </div>

      <div className="mt-8 flex gap-2 border-b border-sage-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? "border-b-2 border-sage-700 text-sage-700"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "Courses" && <CoursesTab courses={courses} />}
        {tab === "Availability" && <AvailabilityTab courses={courses} slots={slots} />}
        {tab === "Bookings" && <BookingsTab bookings={bookings} />}
        {tab === "Success stories" && (
          <StoriesTab stories={successStories} courses={courses} />
        )}
      </div>
    </div>
  );
}
