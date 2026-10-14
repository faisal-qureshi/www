import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import fs from "fs"
import path from "path"
import { rebaseLinks, settingsLinks } from "./CustomHeader"

export default (() => {
  function CustomFooter(props: QuartzComponentProps) {
    // fq-global is tracked in git (the Obsidian syncer only publishes notes); content/ is a fallback
    const candidates = [
      path.join(process.cwd(), "fq-global", "_footer.html"),
      path.join(process.cwd(), "content", "_footer.html"),
      path.join(process.cwd(), "content", "footer.html"),
      path.join(process.cwd(), "content", "_footer.md"),
      path.join(process.cwd(), "content", "footer.md"),
    ]

    let content = ""
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        content = fs.readFileSync(file, "utf-8")
        break
      }
    }

    if (!content) {
      return (
        <footer class="custom-footer">
          <p>© {new Date().getFullYear()} Faisal Qureshi. All rights reserved.</p>
        </footer>
      )
    }

    return (
      <footer
        class="custom-footer"
        dangerouslySetInnerHTML={{ __html: rebaseLinks(settingsLinks(content), props) }}
      />
    )
  }

  return CustomFooter
}) satisfies QuartzComponentConstructor
