export const locales = ["de", "en"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale = "de" satisfies Locale

export function resolveLocale(value: string | undefined): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale
}
