import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { courseName } from "@/lib/i18n/content";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { CourseType } from "@/lib/types";

export default async function PricesPage() {
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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          {dict.pricesPage.heading}
        </h1>
        <p className="mt-3 text-charcoal/70">{dict.pricesPage.subheading}</p>
      </div>
      <div className="mt-12 divide-y divide-sage-100 rounded-2xl border border-sage-100 bg-white sm:hidden">
        {courses?.map((course) => (
          <div key={course.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium text-charcoal">{courseName(course, locale)}</div>
              <div className="shrink-0 text-sm text-sage-700">
                {course.price_chf != null
                  ? `CHF ${course.price_chf.toFixed(2)} ${
                      course.class_type === "private"
                        ? dict.common.perSession
                        : dict.common.perPerson
                    }`
                  : "—"}
              </div>
            </div>
            <div className="mt-1 text-sm text-charcoal/70">
              {course.duration_minutes} {dict.common.minutesShort}
            </div>
            <Link
              href={`/book?course=${course.slug}`}
              className="mt-3 block w-full rounded-full border border-sage-100 px-4 py-2 text-center text-sm font-medium text-charcoal transition hover:border-sage-300"
            >
              {dict.courseCard.checkAvailability}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 hidden overflow-hidden rounded-2xl border border-sage-100 bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage-50 text-charcoal/70">
            <tr>
              <th className="px-6 py-3 font-medium">{dict.pricesPage.courseColumn}</th>
              <th className="px-6 py-3 font-medium">{dict.pricesPage.durationColumn}</th>
              <th className="px-6 py-3 font-medium">{dict.pricesPage.priceColumn}</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {courses?.map((course) => (
              <tr key={course.id} className="border-t border-sage-100">
                <td className="px-6 py-4 font-medium text-charcoal">
                  {courseName(course, locale)}
                </td>
                <td className="px-6 py-4 text-charcoal/70">
                  {course.duration_minutes} {dict.common.minutesShort}
                </td>
                <td className="px-6 py-4 text-sage-700">
                  {course.price_chf != null
                    ? `CHF ${course.price_chf.toFixed(2)} ${
                        course.class_type === "private"
                          ? dict.common.perSession
                          : dict.common.perPerson
                      }`
                    : "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/book?course=${course.slug}`}
                    className="rounded-full border border-sage-100 px-4 py-1.5 text-xs font-medium text-charcoal transition hover:border-sage-300"
                  >
                    {dict.courseCard.checkAvailability}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
