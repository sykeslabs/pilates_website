"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import { locales, localeLabels, type Locale } from "@/lib/i18n/config";

export function LanguageSelector({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSelect(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-charcoal/20">|</span>}
          <button
            type="button"
            onClick={() => handleSelect(l)}
            disabled={pending}
            aria-current={l === locale}
            className={
              l === locale
                ? "font-semibold text-sage-700"
                : "text-charcoal/50 transition hover:text-charcoal"
            }
          >
            {localeLabels[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
