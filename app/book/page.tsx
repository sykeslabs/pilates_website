import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/BookingFlow";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { CourseType } from "@/lib/types";

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const params = await searchParams;
  const courseSlug = typeof params.course === "string" ? params.course : undefined;

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("course_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .returns<CourseType[]>();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          {dict.book.heading}
        </h1>
        <p className="mt-3 text-charcoal/70">{dict.book.subheading}</p>
      </div>
      <div className="mt-12">
        <BookingFlow
          courses={courses ?? []}
          initialCourseSlug={courseSlug}
          locale={locale}
          dict={dict}
        />
      </div>
    </div>
  );
}
