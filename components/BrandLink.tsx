"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BrandLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      // eslint-disable-next-line @next/next/no-html-link-for-pages -- already on "/"; this only resets scroll position, not a real navigation
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href="/" className={className}>
      {children}
    </Link>
  );
}
