"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { courseName } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/config";
import type { CourseType } from "@/lib/types";

type NavCourse = Pick<CourseType, "id" | "slug" | "name" | "name_de" | "name_fr">;

export function CoursesNavDropdown({
  courses,
  locale,
  label,
}: {
  courses: NavCourse[];
  locale: Locale;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = pathname === "/courses";

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

  return (
    <div ref={containerRef} className="relative flex items-center">
      <Link
        href="/courses"
        className={`rounded-full px-3 py-1.5 transition hover:bg-sage-50 hover:font-semibold hover:text-sage-700 ${isActive ? "underline underline-offset-4" : ""}`}
      >
        {label}
      </Link>
      {courses.length > 0 && (
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-charcoal/60 hover:bg-sage-50 hover:text-sage-700"
        >
          <svg
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {open && courses.length > 0 && (
        <div className="absolute left-0 top-full mt-2 min-w-[12rem] rounded-xl border border-sage-100 bg-white py-1 shadow-lg">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses?course=${course.slug}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-charcoal hover:bg-sage-50 hover:font-semibold hover:text-sage-700"
            >
              {courseName(course, locale)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
