import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-sage-100 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-sage-700">
          Studio Pilates
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-charcoal">
          <Link href="/#courses" className="hidden hover:text-sage-700 sm:inline">
            Courses
          </Link>
          <Link href="/#stories" className="hidden hover:text-sage-700 sm:inline">
            Success stories
          </Link>
          <Link
            href="/book"
            className="rounded-full bg-sage-700 px-5 py-2 text-white transition hover:bg-sage-500"
          >
            Book a class
          </Link>
        </nav>
      </div>
    </header>
  );
}
