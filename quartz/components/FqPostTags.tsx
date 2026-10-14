import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

export default (() => {
  const FqPostTags: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    const tags = fileData.frontmatter?.tags
    if (!Array.isArray(tags) || tags.length === 0 || /(^|\/)index$/.test(slug) || slug === "404") return null
    return (
      <ul class="fq-post-tags" aria-label="Tags">
        {tags.map((tag) => (
          <li>
            <a class="internal tag-link" href={resolveRelative(slug as FullSlug, `tags/${tag}` as FullSlug)}>
              {tag}
            </a>
          </li>
        ))}
      </ul>
    )
  }
  return FqPostTags
}) satisfies QuartzComponentConstructor
