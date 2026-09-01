import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/CourseCard";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import { Carousel } from "@/components/Carousel";
import { HeroPhotoCollage } from "@/components/HeroPhotoCollage";
import { FindYourClass } from "@/components/FindYourClass";
import { BenefitsSection } from "@/components/BenefitsSection";
import { InstructorTeaser } from "@/components/InstructorTeaser";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type {
  CourseType,
  SuccessStory,
  HeroSection,
  Instructor,
  HomeBenefitsSettings,
} from "@/lib/types";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const [
    { data: courses },
    { data: stories },
    { data: hero },
    { data: instructor },
    { data: benefitsSettings },
  ] = await Promise.all([
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
    supabase.from("instructor").select("*").limit(1).maybeSingle<Instructor>(),
    supabase
      .from("home_benefits_settings")
      .select("*")
      .limit(1)
      .maybeSingle<HomeBenefitsSettings>(),
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
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
      <Link
        href="#find-your-class"
        className="inline-flex items-center justify-center rounded-full bg-sage-700 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-sage-500"
      >
        {dict.home.heroCta}
      </Link>
      <Link
        href="/courses"
        className="inline-flex items-center justify-center rounded-full border border-sage-300 px-8 py-3 text-sm font-semibold text-charcoal transition hover:border-sage-500"
      >
        {dict.home.heroCtaSecondary}
      </Link>
    </div>
  );

  return (
    <div>
      {heroLayout === "collage" ? (
        <section className="flex items-center bg-cream px-6 lg:sticky lg:top-0 lg:z-10 lg:min-h-screen">
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
          className="flex items-center justify-center bg-cover bg-center px-6 py-24 text-center lg:sticky lg:top-0 lg:z-10 lg:min-h-screen lg:py-0"
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
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#find-your-class"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-sage-700 shadow transition hover:bg-cream"
              >
                {dict.home.heroCta}
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-8 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                {dict.home.heroCtaSecondary}
              </Link>
            </div>
          </div>
        </section>
      )}

      <FindYourClass courses={courses ?? []} locale={locale} dict={dict} />

      <section
        id="courses"
        className="flex flex-col justify-center bg-cream px-6 py-20 lg:sticky lg:top-16 lg:z-30 lg:min-h-screen"
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
          className="flex flex-col justify-center bg-sage-50 px-6 py-20 lg:sticky lg:top-16 lg:z-40 lg:min-h-screen"
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
                  <SuccessStoryCard
                    key={story.id}
                    story={story}
                    locale={locale}
                    courses={courses ?? []}
                    compact
                  />
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

      <BenefitsSection dict={dict} settings={benefitsSettings} />

      {instructor && <InstructorTeaser instructor={instructor} locale={locale} dict={dict} />}

      <section className="flex flex-col justify-center bg-cream px-6 py-20 lg:sticky lg:top-16 lg:z-[70] lg:min-h-screen">
        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
            {dict.home.stepsEyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-charcoal sm:text-4xl">
            {dict.home.stepsHeading}
          </h2>
          <p className="mt-4 text-charcoal/70">{dict.home.stepsSubheading}</p>
          <div className="mt-12 flex flex-col sm:flex-row sm:items-stretch">
            {dict.home.steps.map((item, i) => {
              return (
              <div key={item.title} className="flex flex-1 flex-col sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-4 rounded-2xl bg-white p-6 text-left shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-50 text-lg font-semibold text-sage-700">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">{item.title}</h3>
                    <p className="mt-1 text-sm text-charcoal/70">{item.body}</p>
                  </div>
                </div>
                {i < dict.home.steps.length - 1 && (
                  <div className="flex items-center justify-center py-2 sm:px-2 sm:py-0">
                    <span className="text-2xl leading-none text-terracotta-500 sm:hidden">↓</span>
                    <span className="hidden text-2xl leading-none text-terracotta-500 sm:inline">
                      →
                    </span>
                  </div>
                )}
              </div>
              );
            })}
          </div>

          <div className="mx-auto mt-16 max-w-3xl rounded-3xl bg-sage-700 px-8 py-12 text-center text-cream">
            <h2 className="font-[family-name:var(--font-display)] text-3xl italic sm:text-4xl">
              {dict.aboutPage.ctaHeading}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-cream/85">{dict.aboutPage.ctaBody}</p>
            <Link
              href="/book"
              className="mt-6 inline-block rounded-full bg-cream px-8 py-3 text-sm font-semibold text-sage-700 transition hover:bg-white"
            >
              {dict.aboutPage.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
