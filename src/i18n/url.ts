import { getRelativeLocaleUrl } from "astro:i18n"

import { routes, type RouteId } from "@/i18n/routes"
import type { Locale } from "@/i18n/locales"

function trimSlashes(path: string) {
  return path.replace(/^\/+|\/+$/g, "")
}

function stripLocale(pathname: string, locale: Locale): string {
  const path = trimSlashes(pathname)
  const root = trimSlashes(getRelativeLocaleUrl(locale))

  if (path === root) return ""

  return root && path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path
}

export function routeUrl(locale: Locale, route: RouteId): string {
  return getRelativeLocaleUrl(locale, routes[route][locale])
}

export function switchLocale(pathname: string, from: Locale, to: Locale): string {
  const path = stripLocale(pathname, from)
  const route = Object.values(routes).find((route) => route[from] === path)

  return getRelativeLocaleUrl(to, route?.[to] ?? path)
}
