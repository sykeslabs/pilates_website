import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-sage-100 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-charcoal/70 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Studio Pilates. All rights reserved.</p>
        <Link href="/admin" className="hover:text-sage-700">
          Studio login
        </Link>
      </div>
    </footer>
  );
}
