import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isoDaysAgo } from "@/lib/time";
import type {
  CourseType,
  Instructor,
  Faq,
  HeroSection,
  StudioInfo,
  ContactMessage,
  CoursePageSettings,
} from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const sixtyDaysAgo = isoDaysAgo(60);

  const [
    { data: courses },
    { data: stories },
    { data: slots },
    { data: bookings },
    { data: instructor },
    { data: faqs },
    { data: hero },
    { data: studio },
    { data: messages },
    { data: waitlistEntries },
    { data: coursePageSettings },
  ] = await Promise.all([
    supabase
      .from("course_types")
      .select("*")
      .order("display_order", { ascending: true })
      .returns<CourseType[]>(),
    supabase
      .from("success_stories")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("availability_slots")
      .select("*, course_types(name)")
      .gte("start_time", sixtyDaysAgo)
      .order("start_time", { ascending: true }),
    supabase
      .from("bookings")
      .select("*, availability_slots(start_time, end_time, course_types(name))")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("instructor").select("*").limit(1).maybeSingle<Instructor>(),
    supabase.from("faqs").select("*").order("display_order", { ascending: true }).returns<Faq[]>(),
    supabase.from("hero_section").select("*").limit(1).maybeSingle<HeroSection>(),
    supabase.from("studio_info").select("*").limit(1).maybeSingle<StudioInfo>(),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ContactMessage[]>(),
    supabase
      .from("waitlist_entries")
      .select("*, availability_slots(start_time, end_time, course_types(name))")
      .order("created_at", { ascending: false }),
    supabase
      .from("course_page_settings")
      .select("*")
      .limit(1)
      .maybeSingle<CoursePageSettings>(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <AdminDashboard
        courses={courses ?? []}
        successStories={stories ?? []}
        slots={slots ?? []}
        bookings={bookings ?? []}
        waitlistEntries={waitlistEntries ?? []}
        instructor={instructor}
        faqs={faqs ?? []}
        hero={hero}
        studio={studio}
        messages={messages ?? []}
        coursePageSettings={coursePageSettings}
      />
    </div>
  );
}
