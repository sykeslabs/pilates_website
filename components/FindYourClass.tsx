import Link from "next/link";
import { courseName } from "@/lib/i18n/content";
import {
  SproutIcon,
  StrengthIcon,
  PersonIcon,
  HeartIcon,
  QuestionIcon,
  ChatIcon,
} from "@/components/BenefitIcons";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { CourseType } from "@/lib/types";

const OPTION_ICONS: Record<string, (props: { size?: number }) => React.ReactElement> = {
  "mat-pilates": SproutIcon,
  "reformer-basics": StrengthIcon,
  "private-1-1": PersonIcon,
  "prenatal-pilates": HeartIcon,
};

function CardIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-50 text-sage-700">
      {children}
    </div>
  );
}

export function FindYourClass({
  courses,
  locale,
  dict,
}: {
  courses: CourseType[];
  locale: Locale;
  dict: Pick<Dictionary, "findYourClass">;
}) {
  const options = dict.findYourClass.options
    .map((option) => ({
      ...option,
      course: courses.find((c) => c.slug === option.slug),
    }))
    .filter((option) => option.course);

  if (options.length === 0) return null;

  return (
    <section
      id="find-your-class"
      className="scroll-mt-20 bg-sage-50 px-6 py-20 lg:sticky lg:top-16 lg:z-20 lg:flex lg:min-h-screen lg:flex-col lg:justify-center"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
            {dict.findYourClass.eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-charcoal sm:text-4xl">
            {dict.findYourClass.heading}
          </h2>
          <p className="mt-4 text-charcoal/70">{dict.findYourClass.subheading}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => {
            const Icon = OPTION_ICONS[option.slug] ?? SproutIcon;
            return (
              <Link
                key={option.slug}
                href={`/courses#${option.slug}`}
                className="group rounded-2xl border border-sage-100 bg-white p-6 transition hover:border-sage-300 hover:bg-sage-50 hover:shadow-md"
              >
                <CardIcon>
                  <Icon />
                </CardIcon>
                <div className="font-semibold text-charcoal">{option.question}</div>
                <p className="mt-2 text-sm text-charcoal/60">{option.answer}</p>
                <div className="mt-4 text-sm font-medium text-sage-700">
                  {option.course && courseName(option.course, locale)}{" "}
                  <span className="transition group-hover:translate-x-1 inline-block">→</span>
                </div>
              </Link>
            );
          })}
          <Link
            href="/courses"
            className="group rounded-2xl border border-dashed border-sage-300 bg-white p-6 transition hover:border-sage-500 hover:bg-sage-50 hover:shadow-md"
          >
            <CardIcon>
              <QuestionIcon />
            </CardIcon>
            <div className="font-semibold text-charcoal">{dict.findYourClass.notSureQuestion}</div>
            <p className="mt-2 text-sm text-charcoal/60">{dict.findYourClass.notSureAnswer}</p>
            <div className="mt-4 text-sm font-medium text-sage-700">
              <span className="transition group-hover:translate-x-1 inline-block">→</span>
            </div>
          </Link>
          <Link
            href="/contact#send-message"
            className="group rounded-2xl border border-sage-100 bg-white p-6 transition hover:border-sage-300 hover:shadow-md"
          >
            <CardIcon>
              <ChatIcon />
            </CardIcon>
            <div className="font-semibold text-charcoal">{dict.findYourClass.contactQuestion}</div>
            <p className="mt-2 text-sm text-charcoal/60">{dict.findYourClass.contactAnswer}</p>
            <div className="mt-4 text-sm font-medium text-sage-700">
              <span className="transition group-hover:translate-x-1 inline-block">→</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
