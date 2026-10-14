import { settings } from "./fq-site-settings"

// Theme registry. To add a theme: add an entry here, add its colours to the
// `$themes` map in quartz/styles/custom.scss under the same id, then add the id
// to `enabledThemes` in fq-site-settings.ts.
export const allThemes: Record<
  string,
  { label: string; mode: "light" | "dark"; blurb: string; swatch: [string, string, string] }
> = {
  pastel: { label: "Summer", mode: "light", blurb: "Soft rose, peach and mint", swatch: ["#fde2e4", "#c2527a", "#e4f1ec"] },
  meadow: { label: "Meadow", mode: "light", blurb: "Fresh greens and butter yellow", swatch: ["#e6efd0", "#4f7d45", "#f6f1d9"] },
  simple: { label: "Simple", mode: "light", blurb: "Clean white, strong contrast", swatch: ["#ffffff", "#111111", "#0b57d0"] },
  grunge: { label: "Grunge Pastel", mode: "light", blurb: "Paper grain, dotted shadows", swatch: ["#ffd9e0", "#ff4f8b", "#cfe8ff"] },
  seaside: { label: "Seaside", mode: "light", blurb: "Sea glass, sand and coral", swatch: ["#d9ecf5", "#2a6f9e", "#fbeedb"] },
  rustic: { label: "Winter", mode: "dark", blurb: "Wine, holly and gold: rustic Christmas", swatch: ["#5a1f2b", "#e6b85c", "#1f4030"] },
  evergreen: { label: "Evergreen", mode: "dark", blurb: "Deep forest with brass accents", swatch: ["#234a38", "#d8b86a", "#14231c"] },
  midnight: { label: "Midnight", mode: "dark", blurb: "Ink blue with a warm lantern glow", swatch: ["#1e2f55", "#9bbcff", "#111a2c"] },
}

export const themes = Object.fromEntries(
  settings.enabledThemes.filter((id) => allThemes[id]).map((id) => [id, allThemes[id]]),
)

function firstOfMode(mode: "light" | "dark"): string {
  return Object.keys(themes).find((id) => themes[id].mode === mode) ?? "pastel"
}

export const defaultLightTheme =
  themes[settings.defaultLightTheme]?.mode === "light" ? settings.defaultLightTheme : firstOfMode("light")
export const defaultDarkTheme =
  themes[settings.defaultDarkTheme]?.mode === "dark" ? settings.defaultDarkTheme : firstOfMode("dark")

export const defaultTheme = settings.defaultMode === "dark" ? defaultDarkTheme : defaultLightTheme

export function themeScript(): string {
  const cfg = {
    themes,
    defL: defaultLightTheme,
    defD: defaultDarkTheme,
    defMode: settings.defaultMode,
    allow: settings.allowVisitorThemes,
  }
  return `
(function () {
  var C = ${JSON.stringify(cfg)};
  var root = document.documentElement;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function pick(k, mode, def) {
    var t = C.allow ? get(k) : null;
    return C.themes[t] && C.themes[t].mode === mode ? t : def;
  }
  function state() {
    var mode = get("fq-mode");
    if (mode !== "light" && mode !== "dark") {
      mode = C.defMode === "system"
        ? (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : C.defMode;
    }
    return { mode: mode, light: pick("fq-light", "light", C.defL), dark: pick("fq-dark", "dark", C.defD) };
  }
  function current() { var s = state(); return s.mode === "dark" ? s.dark : s.light; }
  function apply() {
    var t = current(), m = C.themes[t].mode;
    root.setAttribute("data-site-theme", t);
    if (root.getAttribute("saved-theme") !== m) root.setAttribute("saved-theme", m);
    set("theme", m);
  }
  function announce() {
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: root.getAttribute("saved-theme") } }));
  }
  window.fqTheme = {
    themes: C.themes,
    allow: C.allow,
    state: state,
    setMode: function (m) { set("fq-mode", m); apply(); announce(); },
    setTheme: function (id) {
      if (!C.themes[id] || !C.allow) return;
      var m = C.themes[id].mode;
      set(m === "dark" ? "fq-dark" : "fq-light", id);
      set("fq-mode", m);
      apply(); announce();
    },
    reset: function () {
      ["fq-mode", "fq-light", "fq-dark"].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
      apply(); announce();
    }
  };
  apply();
  // The sidebar light/dark button flips saved-theme; translate that into our light/dark theme pair.
  new MutationObserver(function () {
    var m = root.getAttribute("saved-theme");
    if (C.themes[current()].mode !== m) { set("fq-mode", m); apply(); }
  }).observe(root, { attributes: true, attributeFilter: ["saved-theme"] });
  if (!window.__fqThemeBound) {
    window.__fqThemeBound = true;
    document.addEventListener("nav", apply);
  }
})();
`
}
