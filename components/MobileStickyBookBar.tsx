"use client";

import { usePathname } from "next/navigation";
import { BookNavLink } from "@/components/BookNavLink";

export function MobileStickyBookBar({ label }: { label: string }) {
  const pathname = usePathname();

  if (pathname === "/book" || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-sage-100 bg-cream/95 p-3 backdrop-blur lg:hidden">
      <BookNavLink
        label={label}
        className="flex w-full items-center justify-center rounded-full bg-sage-700 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sage-500"
      />
    </div>
  );
}
