import type { AvailabilitySlot, Booking } from "@/lib/types";

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
