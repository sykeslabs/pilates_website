import Link from "next/link";
import type { Dictionary } from "@/messages/en";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-24 border-t border-sage-100 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-charcoal/70">
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/courses" className="hover:text-sage-700">
            {dict.header.courses}
          </Link>
          <Link href="/prices" className="hover:text-sage-700">
            {dict.footer.pricesLink}
          </Link>
          <Link href="/about" className="hover:text-sage-700">
            {dict.footer.aboutLink}
          </Link>
          <Link href="/faq" className="hover:text-sage-700">
            {dict.footer.faqLink}
          </Link>
          <Link href="/contact" className="hover:text-sage-700">
            {dict.footer.contactLink}
          </Link>
          <Link href="/#stories" className="hover:text-sage-700">
            {dict.header.stories}
          </Link>
        </nav>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Studio Pilates. {dict.footer.rights}
          </p>
          <Link href="/admin" className="hover:text-sage-700">
            {dict.footer.studioLogin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
