const slugReplacements: Record<string, string> = {
  "+": "plus",
  "#": "sharp",
  "&": "and",
  "@": "at",
  ß: "ss"
}

export function uniqueTags(tags: string[]): string[] {
  const names = new Map<string, string>()
  for (const tag of tags) {
    const name = tag.trim()
    const key = name.toLowerCase()
    if (key && !names.has(key)) names.set(key, name)
  }
  return [...names.values()]
}

export function tagSlug(tag: string): string {
  let slug = tag.normalize("NFKD").toLowerCase()
  for (const [symbol, replacement] of Object.entries(slugReplacements)) {
    slug = slug.replaceAll(symbol, replacement)
  }
  return slug
    .replace(/\p{Mark}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
}
