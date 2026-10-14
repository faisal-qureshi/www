/**
 * Component options that cannot be expressed in quartz.config.yaml (e.g. functions).
 * Keyed by plugin name; merged over the yaml options in config-loader.
 */
export const siteComponentOptions: Record<string, Record<string, unknown>> = {
  explorer: {
    // Serialised with toString() and run in the browser, so it must be self-contained.
    sortFn: (a: any, b: any) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
      if (!a.isFolder) {
        return (a.displayName || "").localeCompare(b.displayName || "", undefined, {
          numeric: true,
          sensitivity: "base",
        })
      }
      const order = ["me", "microblog", "blog", "videos", "music"]
      const ia = order.indexOf(a.slugSegment)
      const ib = order.indexOf(b.slugSegment)
      const diff = (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib)
      if (diff !== 0) return diff
      return (a.displayName || "").localeCompare(b.displayName || "", undefined, {
        numeric: true,
        sensitivity: "base",
      })
    },
  },
}
