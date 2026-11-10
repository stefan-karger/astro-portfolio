import type { Locale } from "@/i18n/locales"

import { de, type Translations } from "./de"
import { en } from "./en"

const translations = {
  de,
  en
} satisfies Record<Locale, Translations>

export function getTranslations(locale: Locale) {
  return translations[locale]
}
