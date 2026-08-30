import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isoDaysAgo } from "@/lib/time";
import type { CourseType } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const sixtyDaysAgo = isoDaysAgo(60);

  const [{ data: courses }, { data: stories }, { data: slots }, { data: bookings }] =
    await Promise.all([
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
    ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <AdminDashboard
        courses={courses ?? []}
        successStories={stories ?? []}
        slots={slots ?? []}
        bookings={bookings ?? []}
      />
    </div>
  );
}
