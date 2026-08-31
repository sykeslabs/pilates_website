import { en } from "@/messages/en";
import { de } from "@/messages/de";
import { fr } from "@/messages/fr";
import type { Locale } from "./config";

const dictionaries = { en, de, fr };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
