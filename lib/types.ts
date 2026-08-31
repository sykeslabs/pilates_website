export type CourseType = {
  id: string;
  slug: string;
  name: string;
  name_de: string;
  name_fr: string;
  description: string;
  description_de: string;
  description_fr: string;
  brief_description: string;
  brief_description_de: string;
  brief_description_fr: string;
  photo_url: string | null;
  duration_minutes: number;
  capacity_default: number;
  price_chf: number | null;
  class_type: "group" | "private" | "semi_private";
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export type SuccessStory = {
  id: string;
  name: string;
  title: string;
  title_de: string;
  title_fr: string;
  quote: string;
  quote_de: string;
  quote_fr: string;
  photo_url: string | null;
  instagram_url: string | null;
  course_type_id: string | null;
  display_order: number;
  created_at: string;
};

export type HeroSection = {
  id: string;
  layout: "illustration" | "single_photo" | "collage";
  photo_1_url: string | null;
  photo_2_url: string | null;
  photo_3_url: string | null;
  photo_4_url: string | null;
  updated_at: string;
};

export type StudioInfo = {
  id: string;
  phone: string;
  email: string;
  address: string;
  photo_1_url: string | null;
  photo_2_url: string | null;
  photo_3_url: string | null;
  photo_4_url: string | null;
  photo_5_url: string | null;
  photo_6_url: string | null;
  photo_7_url: string | null;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type Instructor = {
  id: string;
  name: string;
  credentials: string;
  credentials_de: string;
  credentials_fr: string;
  bio: string;
  bio_de: string;
  bio_fr: string;
  photo_url: string | null;
  photo_1_url: string | null;
  photo_2_url: string | null;
  photo_3_url: string | null;
  photo_4_url: string | null;
  photo_5_url: string | null;
  photo_6_url: string | null;
  photo_7_url: string | null;
  updated_at: string;
};

export type CoursePageSettings = {
  id: string;
  value_icon_1_url: string | null;
  value_icon_2_url: string | null;
  value_icon_3_url: string | null;
  updated_at: string;
};

export type Faq = {
  id: string;
  question: string;
  question_de: string;
  question_fr: string;
  answer: string;
  answer_de: string;
  answer_fr: string;
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
  customer_id: string | null;
  participant_name: string;
  email: string;
  phone: string | null;
  status: "confirmed" | "cancelled";
  payment_status: "not_required" | "pending" | "paid";
  price_chf: number | null;
  remark: string | null;
  created_at: string;
};

export type WaitlistEntry = {
  id: string;
  slot_id: string;
  participant_name: string;
  email: string;
  phone: string | null;
  remark: string | null;
  status: "waiting" | "notified" | "converted" | "cancelled";
  created_at: string;
};
