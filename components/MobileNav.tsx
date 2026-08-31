"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/messages/en";

export function MobileNav({ dict }: { dict: Dictionary }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/courses", label: dict.header.courses },
    { href: "/prices", label: dict.footer.pricesLink },
    { href: "/about", label: dict.footer.aboutLink },
    { href: "/faq", label: dict.footer.faqLink },
    { href: "/contact", label: dict.footer.contactLink },
  ];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:bg-sage-50"
      >
        {open ? (
          <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-sage-100 bg-cream/95 px-6 py-4 backdrop-blur">
          <nav className="flex flex-col gap-4 text-sm font-medium text-charcoal">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:text-sage-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
