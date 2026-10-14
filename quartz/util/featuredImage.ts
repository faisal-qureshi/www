import { FullSlug, joinSegments, pathToRoot } from "./path"

export type FeaturedImage = {
  /** Path relative to the content root, or an absolute URL */
  path: string
  isExternal: boolean
  alt: string
  caption?: string
}

const isAbsoluteUrl = (s: string) => /^https?:\/\//i.test(s)

/** Reads the `image` frontmatter field. Accepts a path, a URL or an Obsidian wikilink. */
export function getFeaturedImage(
  frontmatter: Record<string, any> | undefined,
  fallbackAlt: string,
): FeaturedImage | undefined {
  const raw = frontmatter?.image
  if (typeof raw !== "string") return undefined

  const cleaned = raw
    .trim()
    .replace(/^!?\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0]
    .replace(/^\/+/, "")
    .trim()
  if (!cleaned) return undefined

  return {
    path: cleaned,
    isExternal: isAbsoluteUrl(cleaned),
    alt: String(frontmatter?.imageAlt ?? "").trim() || fallbackAlt,
    caption: String(frontmatter?.imageCaption ?? "").trim() || undefined,
  }
}

/** Relative src that works from the page at `slug`. */
export function featuredImageSrc(img: FeaturedImage, slug: FullSlug): string {
  return img.isExternal ? img.path : encodeURI(joinSegments(pathToRoot(slug), img.path))
}

/** Absolute URL for og:image / twitter:image. */
export function featuredImageAbsoluteUrl(img: FeaturedImage, baseUrl?: string): string | undefined {
  if (img.isExternal) return img.path
  if (!baseUrl) return undefined
  return `https://${baseUrl}/${encodeURI(img.path)}`
}
