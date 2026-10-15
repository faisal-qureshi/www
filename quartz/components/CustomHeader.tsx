import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import fs from "fs"
import path from "path"
import { settings } from "../fq-site-settings"

// Resolve "./" links in the html from the site root, whatever the page depth
export function rebaseLinks(html: string, props: QuartzComponentProps): string {
  const slug: string = props.fileData?.slug ?? "index"
  // The 404 page can be served from any depth, so use the absolute site root
  const root =
    props.ctx?.argv?.serve || !props.cfg?.baseUrl
      ? "/"
      : `/${props.cfg.baseUrl.split("/").slice(1).join("/")}/`
  const baseHref: string =
    props.baseHref ??
    (slug === "404" ? root : undefined) ??
    (slug.split("/").length > 1 ? "../".repeat(slug.split("/").length - 1) : "./")
  return html.replace(
    /(href|src)="\.\/([^"]*)"/g,
    (_m, attr, rest) => `${attr}="${baseHref}${rest}"`,
  )
}

export function settingsLinks(html: string): string {
  return html.replace(/\{\{settings-link\}\}/g, () =>
    settings.showSettingsLink ? `<a href="./settings">Settings</a>` : "",
  )
}

export default (() => {
  function CustomHeader(props: QuartzComponentProps) {
    // fq-global is tracked in git (the Obsidian syncer only publishes notes); content/ is a fallback
    const candidates = [
      path.join(process.cwd(), "fq-global", "_header.html"),
      path.join(process.cwd(), "content", "_header.html"),
      path.join(process.cwd(), "content", "header.html"),
      path.join(process.cwd(), "content", "_header.md"),
      path.join(process.cwd(), "content", "header.md"),
    ]

    let content = ""
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        content = fs.readFileSync(file, "utf-8")
        break
      }
    }

    if (!content) {
      return null
    }

    content = rebaseLinks(settingsLinks(content), props)

    return <div class="custom-header-container" dangerouslySetInnerHTML={{ __html: content }} />
  }

  return CustomHeader
}) satisfies QuartzComponentConstructor
