import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { featuredImageAbsoluteUrl, getFeaturedImage } from "../util/featuredImage"

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const pageTitle = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const seoTitle = String(fileData.frontmatter?.seoTitle ?? "").trim()
    const title = seoTitle || (pageTitle === cfg.pageTitle ? pageTitle : pageTitle + titleSuffix)
    const nonEmpty = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined)
    const description =
      nonEmpty(fileData.frontmatter?.socialDescription) ??
      nonEmpty(fileData.frontmatter?.description) ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    // The featured image doubles as the social card; the og-image plugin reads `socialImage`
    const featured = getFeaturedImage(fileData.frontmatter, description)
    const featuredUrl = featured ? featuredImageAbsoluteUrl(featured, cfg.baseUrl) : undefined
    // Quartz copies `image` into `socialImage`, which the plugin resolves under /static, so replace it
    const existingSocial = fileData.frontmatter?.socialImage
    if (
      featuredUrl &&
      fileData.frontmatter &&
      (!existingSocial || existingSocial === fileData.frontmatter.image)
    ) {
      fileData.frontmatter.socialImage = featuredUrl
    }
    const isArticle = /^(blog|microblog)\//.test(fileData.slug ?? "")
    const siteUrl = cfg.baseUrl ? `https://${cfg.baseUrl}/` : undefined
    const jsonLd =
      fileData.slug === "index" && siteUrl
        ? {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                name: "Faisal Qureshi",
                url: siteUrl,
                description,
                jobTitle: ["Journalist", "TV Host", "Tech Entrepreneur"],
                image: featuredUrl,
                sameAs: ["https://x.com/faisalqureshi", "https://instagram.com/faisalqureshi"],
              },
              { "@type": "WebSite", name: cfg.pageTitle, url: siteUrl },
            ],
          }
        : undefined

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some((e) => e.name === "CustomOgImages")
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={featured?.alt ?? description} />
        <meta name="twitter:image:alt" content={featured?.alt ?? description} />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
