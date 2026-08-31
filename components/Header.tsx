import Image from "next/image";
import Link from "next/link";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { MobileNav } from "@/components/MobileNav";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
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
          <Link href="/courses" className="hidden hover:text-sage-700 lg:inline">
            {dict.header.courses}
          </Link>
          <Link href="/prices" className="hidden hover:text-sage-700 lg:inline">
            {dict.footer.pricesLink}
          </Link>
          <Link href="/about" className="hidden hover:text-sage-700 lg:inline">
            {dict.footer.aboutLink}
          </Link>
          <Link href="/faq" className="hidden hover:text-sage-700 lg:inline">
            {dict.footer.faqLink}
          </Link>
          <Link href="/contact" className="hidden hover:text-sage-700 lg:inline">
            {dict.footer.contactLink}
          </Link>
          <LanguageSelector locale={locale} />
          <Link
            href="/book"
            className="rounded-full bg-sage-700 px-5 py-2 text-white transition hover:bg-sage-500"
          >
            {dict.header.book}
          </Link>
          <MobileNav dict={dict} />
        </nav>
      </div>
    </header>
  );
}
