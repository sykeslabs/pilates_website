import Image from "next/image";
import { GroupIcon, CertificateIcon, CalendarIcon } from "@/components/BenefitIcons";
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
  const heroPhotos = [
    pageSettings?.hero_photo_1_url ?? "/images/placeholders/mat-pilates.svg",
    pageSettings?.hero_photo_2_url ?? "/images/placeholders/reformer-basics.svg",
    pageSettings?.hero_photo_3_url ?? "/images/placeholders/prenatal-pilates.svg",
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
              <Image src={heroPhotos[0]} alt="" fill className="object-cover" sizes="192px" />
            </div>
            <div className="absolute right-0 top-0 h-36 w-36 rotate-6 overflow-hidden rounded-2xl shadow-lg sm:h-44 sm:w-44">
              <Image src={heroPhotos[1]} alt="" fill className="object-cover" sizes="176px" />
            </div>
            <div className="absolute bottom-0 left-12 h-40 w-40 rotate-3 overflow-hidden rounded-2xl shadow-lg sm:h-48 sm:w-48">
              <Image src={heroPhotos[2]} alt="" fill className="object-cover" sizes="192px" />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
              {dict.coursesPage.eyebrow}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic tracking-tight text-charcoal sm:text-5xl">
              {dict.coursesPage.heading}
            </h1>
            <p className="mt-4 text-lg text-charcoal/70">{dict.coursesPage.tagline}</p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {dict.coursesPage.values.map((value, i) => {
                const FallbackIcon = [GroupIcon, CertificateIcon, CalendarIcon][i] ?? GroupIcon;
                return (
                  <div
                    key={value.title}
                    className="flex items-center gap-4 rounded-2xl bg-white p-6 text-left shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-700">
                      {valueIcons[i] ? (
                        <span className="relative block h-12 w-12 overflow-hidden rounded-full">
                          <Image
                            src={valueIcons[i]!}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </span>
                      ) : (
                        <FallbackIcon />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal">{value.title}</h2>
                      <p className="text-charcoal/70">{value.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {courses?.map((course, i) => (
        <section
          key={course.id}
          className={`flex flex-col justify-center px-4 py-6 sm:px-8 sm:py-10 lg:sticky lg:top-16 lg:min-h-screen ${
            i % 2 === 0 ? "bg-sand" : "bg-cream"
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
