import Image from "next/image";
import Link from "next/link";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { MobileNav } from "@/components/MobileNav";
import { CoursesNavDropdown } from "@/components/CoursesNavDropdown";
import { BookNavLink } from "@/components/BookNavLink";
import { NavLink } from "@/components/NavLink";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { CourseType } from "@/lib/types";

export function Header({
  locale,
  dict,
  courses,
}: {
  locale: Locale;
  dict: Dictionary;
  courses: Pick<CourseType, "id" | "slug" | "name" | "name_de" | "name_fr">[];
}) {
  return (
    <header className="sticky top-0 z-[100] border-b border-sage-100 bg-cream/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-sage-700"
        >
          <Image src="/images/placeholders/logo-mark.svg" alt="" width={28} height={28} />
          {dict.header.brand}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-charcoal sm:gap-6">
          <div className="hidden lg:flex">
            <CoursesNavDropdown courses={courses} locale={locale} label={dict.header.courses} />
          </div>
          <NavLink
            href="/prices"
            label={dict.footer.pricesLink}
            className="hidden rounded-full px-3 py-1.5 transition hover:bg-sage-50 hover:font-semibold hover:text-sage-700 lg:inline"
          />
          <NavLink
            href="/stories"
            label={dict.header.stories}
            className="hidden rounded-full px-3 py-1.5 transition hover:bg-sage-50 hover:font-semibold hover:text-sage-700 lg:inline"
          />
          <NavLink
            href="/about"
            label={dict.footer.aboutLink}
            className="hidden rounded-full px-3 py-1.5 transition hover:bg-sage-50 hover:font-semibold hover:text-sage-700 lg:inline"
          />
          <NavLink
            href="/faq"
            label={dict.footer.faqLink}
            className="hidden rounded-full px-3 py-1.5 transition hover:bg-sage-50 hover:font-semibold hover:text-sage-700 lg:inline"
          />
          <NavLink
            href="/contact"
            label={dict.footer.contactLink}
            className="hidden rounded-full px-3 py-1.5 transition hover:bg-sage-50 hover:font-semibold hover:text-sage-700 lg:inline"
          />
          <LanguageSelector locale={locale} />
          <BookNavLink
            label={dict.header.book}
            className="rounded-full bg-sage-700 px-5 py-2 text-white transition hover:bg-sage-500"
          />
          <MobileNav dict={dict} locale={locale} courses={courses} />
        </nav>
      </div>
    </header>
  );
}
