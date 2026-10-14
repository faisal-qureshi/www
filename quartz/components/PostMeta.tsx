import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

import { settings } from "../fq-site-settings"

const SECTIONS = settings.postSections
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function parse(raw: unknown): { d: Date; hasTime: boolean } | null {
  if (!raw) return null
  const str = raw instanceof Date ? raw.toISOString() : String(raw)
  const hasTime = /\d{2}:\d{2}/.test(str)
  const d = new Date(hasTime ? str : str.slice(0, 10) + "T00:00:00Z")
  return isNaN(d.getTime()) ? null : { d, hasTime }
}

function human(d: Date): string {
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export default (() => {
  const PostMeta: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    const [section, ...rest] = slug.split("/")
    if (!settings.showPostMeta || !SECTIONS.includes(section) || rest.length === 0 || /(^|\/)index$/.test(slug)) return null

    const fm = fileData.frontmatter as Record<string, unknown> | undefined
    const created = parse(fm?.created ?? fileData.dates?.created)
    if (!created) return null
    const isMicro = section === "microblog"
    const words = (fileData.text ?? "").split(/\s+/).filter(Boolean).length
    const mins = Math.max(1, Math.ceil(words / 200))
    const utcTime = created.d.toISOString().slice(11, 16)

    return (
      <div class="post-meta">
        <span class="pm-item pm-date">
          <time datetime={created.d.toISOString()} data-fq-ts={created.d.toISOString()} data-fq-full={isMicro && created.hasTime ? "time" : "date"}>
            {human(created.d)}
          </time>
          {isMicro && created.hasTime && <span class="pm-time"> &bull; {utcTime} UTC</span>}
        </span>
        {settings.relativeDates && <span class="pm-item pm-ago" data-fq-ago={created.d.toISOString()}></span>}
        {!isMicro && settings.readingTime && <span class="pm-item">{mins} min read</span>}
      </div>
    )
  }
  return PostMeta
}) satisfies QuartzComponentConstructor
