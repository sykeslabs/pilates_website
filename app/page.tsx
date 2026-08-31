import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/CourseCard";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import { Carousel } from "@/components/Carousel";
import { HeroPhotoCollage } from "@/components/HeroPhotoCollage";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { CourseType, SuccessStory, HeroSection } from "@/lib/types";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const [{ data: courses }, { data: stories }, { data: hero }] = await Promise.all([
    supabase
      .from("course_types")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .returns<CourseType[]>(),
    supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(7)
      .returns<SuccessStory[]>(),
    supabase.from("hero_section").select("*").limit(1).maybeSingle<HeroSection>(),
  ]);

  const heroPhotos = hero
    ? [hero.photo_1_url, hero.photo_2_url, hero.photo_3_url, hero.photo_4_url].filter(
        (url): url is string => Boolean(url),
      )
    : [];

  // Falls back to the illustration if the configured layout doesn't actually
  // have the photos it needs — the hero is never blank.
  const heroLayout =
    hero?.layout === "single_photo" && heroPhotos[0]
      ? "single_photo"
      : hero?.layout === "collage" && heroPhotos.length >= 2
        ? "collage"
        : "illustration";

  const heroCta = (
    <Link
      href="/book"
      className="mt-8 inline-flex items-center justify-center rounded-full bg-sage-700 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-sage-500"
    >
      {dict.home.heroCta}
    </Link>
  );

  return (
    <div>
      {heroLayout === "collage" ? (
        <section className="sticky top-0 z-10 flex min-h-screen items-center bg-cream px-6">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-16 py-24 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <HeroPhotoCollage photos={heroPhotos} />
            </div>
            <div className="order-1 text-center lg:order-2 lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
                {dict.home.heroEyebrow}
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic tracking-tight text-charcoal sm:text-5xl">
                {dict.home.heroTitle}
              </h1>
              <p className="mt-4 text-lg text-charcoal/70">{dict.home.heroSubtitle}</p>
              {heroCta}
            </div>
          </div>
        </section>
      ) : (
        <section
          className="sticky top-0 z-10 flex min-h-screen items-center justify-center bg-cover bg-center px-6 text-center"
          style={{
            backgroundImage:
              heroLayout === "single_photo"
                ? `url(${heroPhotos[0]})`
                : "url(/images/placeholders/hero.svg)",
          }}
        >
          {heroLayout === "single_photo" && <div className="absolute inset-0 bg-black/30" />}
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              {dict.home.heroEyebrow}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic tracking-tight text-white sm:text-5xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-4 text-lg text-white/90">{dict.home.heroSubtitle}</p>
            <Link
              href="/book"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-sage-700 shadow transition hover:bg-cream"
            >
              {dict.home.heroCta}
            </Link>
          </div>
        </section>
      )}

      <section
        id="courses"
        className="sticky top-16 z-20 flex min-h-screen flex-col justify-center bg-cream px-6 py-20"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
              {dict.home.coursesEyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-charcoal sm:text-4xl">
              {dict.home.coursesHeading}
            </h2>
            <p className="mt-4 text-charcoal/70">{dict.home.coursesSubheading}</p>
          </div>
          <div className="mt-12">
            <Carousel previousLabel={dict.common.previous} nextLabel={dict.common.next}>
              {courses?.map((course) => (
                <CourseCard key={course.id} course={course} locale={locale} dict={dict} />
              ))}
            </Carousel>
          </div>
          <div className="mt-8 text-center">
            <Link href="/courses" className="text-sm font-medium text-sage-700 hover:underline">
              {dict.coursesPage.seeAll}
            </Link>
          </div>
        </div>
      </section>

      {stories && stories.length > 0 && (
        <section
          id="stories"
          className="sticky top-16 z-30 flex min-h-screen flex-col justify-center bg-cream px-6 py-20"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
                {dict.home.storiesEyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-charcoal sm:text-4xl">
                {dict.home.storiesHeading}
              </h2>
              <p className="mt-4 text-charcoal/70">{dict.home.storiesSubheading}</p>
            </div>
            <div className="mt-12">
              <Carousel previousLabel={dict.common.previous} nextLabel={dict.common.next}>
                {stories.map((story) => (
                  <SuccessStoryCard key={story.id} story={story} locale={locale} />
                ))}
              </Carousel>
            </div>
            <div className="mt-8 text-center">
              <Link href="/stories" className="text-sm font-medium text-sage-700 hover:underline">
                {dict.storiesPage.seeAll}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="sticky top-16 z-40 flex min-h-screen flex-col justify-center bg-sage-50 px-6 py-20">
        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
            {dict.home.stepsEyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-charcoal sm:text-4xl">
            {dict.home.stepsHeading}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
            {dict.home.steps.map((item, i) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-700 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-charcoal">{item.title}</h3>
                <p className="mt-1 text-sm text-charcoal/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
