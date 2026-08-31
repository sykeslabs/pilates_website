"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BookNavLink({ label, className }: { label: string; className?: string }) {
  const pathname = usePathname();

  if (pathname === "/book") {
    return (
      <a
        href="/book"
        onClick={(e) => {
          e.preventDefault();
          window.location.reload();
        }}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href="/book" className={className}>
      {label}
    </Link>
  );
}
