// Fills in missing frontmatter (and a starter outline for empty files) across the vault.
// Uses the same templates as Obsidian's Templater (www/templates/*.md), so both agree.
//   npm run frontmatter            fix every note
//   npm run frontmatter -- --check list notes that need fixing, change nothing
import fs from "node:fs"
import path from "node:path"

const vault = path.resolve(process.cwd(), "content")
const check = process.argv.includes("--check")
const skip = new Set([".obsidian", "templates", "private", "node_modules", ".git"])
const sectionTemplates = {
  blog: "blog.md",
  microblog: "microblog.md",
  videos: "video.md",
  music: "music.md",
}

const nowUtc = () => new Date().toISOString().replace(/\.\d+Z$/, "Z")
const dateOnly = (d) => d.toISOString().slice(0, 10)

function splitFm(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return m ? { fm: m[1], body: m[2] } : { fm: null, body: text }
}

// A "block" is a top-level key plus its indented / list continuation lines
function blocks(fm) {
  const out = new Map()
  let key = null
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*):/)
    if (m) {
      key = m[1]
      out.set(key, [line])
    } else if (key) out.get(key).push(line)
  }
  return out
}

function render(text, title, stamp) {
  return text
    .replace(/<%\s*tp\.file\.title\s*%>/g, title)
    .replace(/<%\s*moment\(\)[^%]*%>/g, stamp)
    .replace(/<%\s*tp\.date\.now\([^%]*%>/g, stamp.slice(0, 10))
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(e.name) || e.name.startsWith("_")) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith(".md")) out.push(p)
  }
  return out
}

let changed = 0
for (const file of walk(vault)) {
  const rel = path.relative(vault, file)
  const section = rel.split(path.sep)[0]
  const tplName = sectionTemplates[section] && rel.includes(path.sep) && path.basename(rel) !== "index.md" ? sectionTemplates[section] : "default.md"
  const tplText = fs.readFileSync(path.join(vault, "templates", tplName), "utf-8")
  const st = fs.statSync(file)
  const title = path.basename(file, ".md")
  const original = fs.readFileSync(file, "utf-8")
  const { fm, body } = splitFm(original)
  const isNew = original.trim() === "" || (fm !== null && body.trim() === "" && !/^title:/m.test(fm))

  const created = nowUtc()
  const tpl = splitFm(render(tplText, title, created))
  const tplBlocks = blocks(tpl.fm)

  let next
  if (isNew) {
    next = render(tplText, title, created)
  } else {
    const have = fm === null ? new Map() : blocks(fm)
    const adds = []
    for (const [key, lines] of tplBlocks) {
      if (have.has(key)) continue
      let l = lines
      // Existing notes are not drafts, are private until you say otherwise, and keep their real dates
      if (key === "draft") l = ["draft: false"]
      if (key === "title") l = [`title: "${title}"`]
      if (key === "created") l = [`created: ${section === "microblog" ? st.birthtime.toISOString().replace(/\.\d+Z$/, "Z") : dateOnly(st.birthtime)}`]
      adds.push(...l)
    }
    if (adds.length === 0) continue
    const head = fm === null ? "" : fm.replace(/\s+$/, "") + "\n"
    next = `---\n${head}${adds.join("\n")}\n---\n${fm === null ? "\n" + body : body}`
  }
  if (next === original) continue
  changed++
  console.log((check ? "needs: " : "fixed: ") + rel)
  if (!check) fs.writeFileSync(file, next)
}
console.log(changed === 0 ? "All notes have complete frontmatter." : `${changed} note(s) ${check ? "need" : "updated"}.`)
