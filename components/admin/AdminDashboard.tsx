"use client";

import { useState } from "react";
import type {
  CourseType,
  SuccessStory,
  Instructor,
  Faq,
  HeroSection,
  StudioInfo,
  ContactMessage,
  CoursePageSettings,
  HomeBenefitsSettings,
} from "@/lib/types";
import type { SlotWithCourse, BookingWithSlot, WaitlistEntryWithSlot } from "@/lib/adminTypes";
import { CoursesTab } from "@/components/admin/CoursesTab";
import { AvailabilityTab } from "@/components/admin/AvailabilityTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { StoriesTab } from "@/components/admin/StoriesTab";
import { AboutTab } from "@/components/admin/AboutTab";
import { FaqTab } from "@/components/admin/FaqTab";
import { HeroTab } from "@/components/admin/HeroTab";
import { StudioInfoTab } from "@/components/admin/StudioInfoTab";
import { MessagesTab } from "@/components/admin/MessagesTab";
import { CoursePageTab } from "@/components/admin/CoursePageTab";
import { BenefitsIconsTab } from "@/components/admin/BenefitsIconsTab";
import { LogoutButton } from "@/components/admin/LogoutButton";

const TABS = [
  "Courses",
  "Availability",
  "Bookings",
  "Success stories",
  "About",
  "FAQ",
  "Hero",
  "Courses page",
  "Benefits icons",
  "Contact info",
  "Messages",
] as const;
type Tab = (typeof TABS)[number];

export function AdminDashboard({
  courses,
  successStories,
  slots,
  bookings,
  waitlistEntries,
  instructor,
  faqs,
  hero,
  studio,
  messages,
  coursePageSettings,
  homeBenefitsSettings,
}: {
  courses: CourseType[];
  successStories: SuccessStory[];
  slots: SlotWithCourse[];
  bookings: BookingWithSlot[];
  waitlistEntries: WaitlistEntryWithSlot[];
  instructor: Instructor | null;
  faqs: Faq[];
  hero: HeroSection | null;
  studio: StudioInfo | null;
  messages: ContactMessage[];
  coursePageSettings: CoursePageSettings | null;
  homeBenefitsSettings: HomeBenefitsSettings | null;
}) {
  const [tab, setTab] = useState<Tab>("Courses");
  const [bookingsSlotFilter, setBookingsSlotFilter] = useState<string | null>(null);

  function handleSelectSlot(slotId: string) {
    setBookingsSlotFilter(slotId);
    setTab("Bookings");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Studio dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mt-1 text-sm text-charcoal/60">
        Hey there! Stay humble - peace, love &amp; harmony.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-sage-100">
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
        {tab === "Availability" && (
          <AvailabilityTab
            courses={courses}
            slots={slots}
            waitlistEntries={waitlistEntries}
            onSelectSlot={handleSelectSlot}
          />
        )}
        {tab === "Bookings" && (
          <BookingsTab
            bookings={bookings}
            waitlistEntries={waitlistEntries}
            courses={courses}
            slotFilter={bookingsSlotFilter}
            onClearSlotFilter={() => setBookingsSlotFilter(null)}
          />
        )}
        {tab === "Success stories" && (
          <StoriesTab stories={successStories} courses={courses} />
        )}
        {tab === "About" && <AboutTab instructor={instructor} />}
        {tab === "FAQ" && <FaqTab faqs={faqs} />}
        {tab === "Hero" && <HeroTab hero={hero} />}
        {tab === "Courses page" && <CoursePageTab settings={coursePageSettings} />}
        {tab === "Benefits icons" && <BenefitsIconsTab settings={homeBenefitsSettings} />}
        {tab === "Contact info" && <StudioInfoTab studio={studio} />}
        {tab === "Messages" && <MessagesTab messages={messages} />}
      </div>
    </div>
  );
}
