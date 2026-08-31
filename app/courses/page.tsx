import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CourseDetailCard } from "@/components/CourseDetailCard";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { nowIso } from "@/lib/time";
import type { AvailabilitySlot, CourseType, CoursePageSettings } from "@/lib/types";

export default async function CoursesPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("course_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .returns<CourseType[]>();

  const { data: pageSettings } = await supabase
    .from("course_page_settings")
    .select("*")
    .limit(1)
    .maybeSingle<CoursePageSettings>();
  const valueIcons = [
    pageSettings?.value_icon_1_url ?? null,
    pageSettings?.value_icon_2_url ?? null,
    pageSettings?.value_icon_3_url ?? null,
  ];

  const courseIds = (courses ?? []).map((c) => c.id);
  const { data: allSlots } = courseIds.length
    ? await supabase
        .from("availability_slots")
        .select("*")
        .in("course_type_id", courseIds)
        .eq("is_active", true)
        .gt("start_time", nowIso())
        .order("start_time", { ascending: true })
        .returns<AvailabilitySlot[]>()
    : { data: [] as AvailabilitySlot[] };

  const upcomingByCourseId = new Map<string, AvailabilitySlot[]>();
  for (const slot of allSlots ?? []) {
    if (slot.booked_count >= slot.capacity) continue;
    const existing = upcomingByCourseId.get(slot.course_type_id) ?? [];
    if (existing.length < 4) upcomingByCourseId.set(slot.course_type_id, [...existing, slot]);
  }

  return (
    <div>
      <section className="flex flex-col justify-center bg-cream px-6 py-20 lg:sticky lg:top-16 lg:z-10 lg:min-h-screen">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div className="relative order-2 mx-auto aspect-square w-full max-w-sm lg:order-1">
            <div className="absolute left-0 top-4 h-40 w-40 -rotate-6 overflow-hidden rounded-2xl shadow-lg sm:h-48 sm:w-48">
              <Image
                src="/images/placeholders/mat-pilates.svg"
                alt=""
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
            <div className="absolute right-0 top-0 h-36 w-36 rotate-6 overflow-hidden rounded-2xl shadow-lg sm:h-44 sm:w-44">
              <Image
                src="/images/placeholders/reformer-basics.svg"
                alt=""
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
            <div className="absolute bottom-0 left-12 h-40 w-40 rotate-3 overflow-hidden rounded-2xl shadow-lg sm:h-48 sm:w-48">
              <Image
                src="/images/placeholders/prenatal-pilates.svg"
                alt=""
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              {dict.coursesPage.heading}
            </h1>
            <p className="mt-3 text-lg text-charcoal/70">{dict.coursesPage.tagline}</p>
            <div className="mt-10 space-y-6">
              {dict.coursesPage.values.map((value, i) => (
                <div key={value.title} className="flex items-start gap-4">
                  {valueIcons[i] ? (
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image src={valueIcons[i]!} alt="" fill className="object-cover" sizes="40px" />
                    </span>
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-700 text-lg font-semibold text-white">
                      {i + 1}
                    </span>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-charcoal">{value.title}</h2>
                    <p className="text-charcoal/70">{value.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {courses?.map((course, i) => (
        <section
          key={course.id}
          className={`flex flex-col justify-center px-4 py-6 sm:px-8 sm:py-10 lg:sticky lg:top-16 lg:min-h-screen ${
            i % 2 === 0 ? "bg-sand" : "bg-sage-50"
          }`}
          style={{ zIndex: 20 + i * 10 }}
        >
          <CourseDetailCard
            course={course}
            locale={locale}
            dict={dict}
            upcomingSlots={upcomingByCourseId.get(course.id) ?? []}
          />
        </section>
      ))}
    </div>
  );
}
