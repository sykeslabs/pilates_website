export type CourseType = {
  id: string;
  slug: string;
  name: string;
  description: string;
  photo_url: string | null;
  duration_minutes: number;
  capacity_default: number;
  price_chf: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type SuccessStory = {
  id: string;
  name: string;
  quote: string;
  photo_url: string | null;
  course_type_id: string | null;
  display_order: number;
  created_at: string;
};

export type AvailabilitySlot = {
  id: string;
  course_type_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  is_active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  slot_id: string;
  participant_name: string;
  email: string;
  phone: string | null;
  status: "confirmed" | "cancelled";
  payment_status: "not_required" | "pending" | "paid";
  created_at: string;
};
