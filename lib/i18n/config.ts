export const locales = ["en", "de", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  de: "DE",
  fr: "FR",
};

// BCP 47 tags for Intl.DateTimeFormat, matched to a Swiss audience.
export const localeTags: Record<Locale, string> = {
  en: "en-GB",
  de: "de-CH",
  fr: "fr-CH",
};
