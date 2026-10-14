// ============================================================================
//  SITE SETTINGS: the one file to edit to switch things on and off.
//  Save it, and rebuild/redeploy. (Visitors have their own page at /settings.)
// ============================================================================

export const settings = {
  // ---- Themes (definitions live in fq-site-theme.ts) --------------------------
  // Themes visitors can choose from. Remove an id to hide that theme.
  enabledThemes: ["pastel", "simple", "grunge", "meadow", "seaside", "rustic", "evergreen", "midnight"],
  // What a first-time visitor sees: "light", "dark" or "system" (follow their device).
  defaultMode: "light" as "light" | "dark" | "system",
  // Used by the sidebar light/dark button until a visitor picks their own.
  defaultLightTheme: "pastel",
  defaultDarkTheme: "rustic",
  // false = visitors cannot pick themes; they only get the default light/dark pair.
  allowVisitorThemes: true,

  // ---- Interface -----------------------------------------------------------
  showDarkModeButton: true, // the light/dark button in the sidebar
  showSettingsLink: true, // "Settings" link in the header and footer

  // Parts of the page to hide everywhere (true = hidden).
  hide: {
    graph: false,
    backlinks: false,
    toc: false,
    explorer: false,
    breadcrumbs: false,
    search: false,
  },

  // ---- Posts ---------------------------------------------------------------
  // Top-level folders treated as "posts": date line, and comments if enabled.
  postSections: ["blog", "microblog", "videos", "music"],
  showPostMeta: true, // date / reading time line under the title
  relativeDates: true, // "2 days ago" next to dates
  readingTime: true, // "4 min read" on blog-style posts
}

export type SiteSettings = typeof settings
