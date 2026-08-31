"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import { locales, localeLabels, type Locale } from "@/lib/i18n/config";

export function LanguageSelector({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  function handleSelect(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Change language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal hover:bg-sage-50"
      >
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.75}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 3.75 5.5 3.75 9s-1.25 6.5-3.75 9c-2.5-2.5-3.75-5.5-3.75-9S9.5 5.5 12 3z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[6rem] rounded-xl border border-sage-100 bg-cream py-1 shadow-lg">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleSelect(l)}
              aria-current={l === locale}
              className={`block w-full px-4 py-2 text-left text-sm ${
                l === locale
                  ? "font-semibold text-sage-700"
                  : "text-charcoal/70 hover:bg-sage-50 hover:text-charcoal"
              }`}
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
