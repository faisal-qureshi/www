import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { featuredImageSrc, getFeaturedImage } from "../util/featuredImage"
import { FullSlug } from "../util/path"

export default (() => {
  const FeaturedImage: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const img = getFeaturedImage(fileData.frontmatter, fileData.frontmatter?.title ?? "")
    if (!img || !fileData.slug) return null

    return (
      <figure class="featured-image">
        <img src={featuredImageSrc(img, fileData.slug as FullSlug)} alt={img.alt} loading="eager" />
        {img.caption && <figcaption>{img.caption}</figcaption>}
      </figure>
    )
  }

  return FeaturedImage
}) satisfies QuartzComponentConstructor
