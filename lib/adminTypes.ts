import type { AvailabilitySlot, Booking, WaitlistEntry } from "@/lib/types";

export type SlotWithCourse = AvailabilitySlot & {
  course_types: { name: string } | null;
};

export type BookingWithSlot = Booking & {
  availability_slots:
    | (Pick<AvailabilitySlot, "start_time" | "end_time"> & {
        course_types: { name: string } | null;
      })
    | null;
};

export type WaitlistEntryWithSlot = WaitlistEntry & {
  availability_slots:
    | (Pick<AvailabilitySlot, "start_time" | "end_time"> & {
        course_types: { name: string } | null;
      })
    | null;
};
