import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/CourseCard";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import type { CourseType, SuccessStory } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: courses }, { data: stories }] = await Promise.all([
    supabase
      .from("course_types")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .returns<CourseType[]>(),
    supabase
      .from("success_stories")
      .select("*")
      .order("display_order", { ascending: true })
      .returns<SuccessStory[]>(),
  ]);

  return (
    <div>
      <section
        className="relative flex min-h-[70vh] items-center justify-center bg-cover bg-center px-6 text-center"
        style={{ backgroundImage: "url(/images/placeholders/hero.svg)" }}
      >
        <div className="max-w-2xl py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Pilates that fits your life
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Mat, Reformer, Prenatal and Private sessions — see what&apos;s available and
            book your spot in under a minute.
          </p>
          <Link
            href="/book"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-sage-700 shadow transition hover:bg-cream"
          >
            Book a class
          </Link>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Our courses</h2>
          <p className="mt-3 text-charcoal/70">
            Every class is small enough for real attention, whatever your level.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses?.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>

      <section className="bg-sage-50 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Booking in three steps
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
            {[
              { step: "1", title: "Pick a course", body: "Choose the class type that fits you." },
              { step: "2", title: "Pick a time", body: "See only the times that are actually free." },
              { step: "3", title: "Confirm", body: "Enter your details and your spot is booked instantly." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-700 text-sm font-semibold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold text-charcoal">{item.title}</h3>
                <p className="mt-1 text-sm text-charcoal/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {stories && stories.length > 0 && (
        <section id="stories" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
              Success stories
            </h2>
            <p className="mt-3 text-charcoal/70">Real progress from real participants.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <SuccessStoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
