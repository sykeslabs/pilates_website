"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { courseName } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/messages/en";
import type { CourseType } from "@/lib/types";

type NavCourse = Pick<CourseType, "id" | "slug" | "name" | "name_de" | "name_fr">;

export function MobileNav({
  dict,
  locale,
  courses,
}: {
  dict: Dictionary;
  locale: Locale;
  courses: NavCourse[];
}) {
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const links = [
    { href: "/prices", label: dict.footer.pricesLink },
    { href: "/stories", label: dict.header.stories },
    { href: "/about", label: dict.footer.aboutLink },
    { href: "/faq", label: dict.footer.faqLink },
    { href: "/contact", label: dict.footer.contactLink },
  ];

  return (
    <div ref={containerRef} className="lg:hidden">
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
            <div>
              <div className="flex items-center justify-between">
                <Link
                  href="/courses"
                  onClick={() => setOpen(false)}
                  className={`hover:font-semibold hover:text-sage-700 ${pathname === "/courses" ? "underline underline-offset-4" : ""}`}
                >
                  {dict.header.courses}
                </Link>
                {courses.length > 0 && (
                  <button
                    type="button"
                    aria-label={dict.header.courses}
                    aria-expanded={coursesOpen}
                    onClick={() => setCoursesOpen((v) => !v)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-charcoal/60 hover:bg-sage-50 hover:text-sage-700"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width={14}
                      height={14}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className={`transition-transform ${coursesOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
              {coursesOpen && (
                <div className="mt-2 flex flex-col gap-3 border-l border-sage-100 pl-3">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses#${course.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-charcoal/70 hover:font-semibold hover:text-sage-700"
                    >
                      {courseName(course, locale)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`hover:font-semibold hover:text-sage-700 ${pathname === link.href ? "underline underline-offset-4" : ""}`}
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
