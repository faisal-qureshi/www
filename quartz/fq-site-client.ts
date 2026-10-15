import { settings } from "./fq-site-settings"

// Client-side polish: relative dates, local time for microblogs, compact list dates.
export function siteClientScript(): string {
  return `
(function () {
  var REL = ${JSON.stringify(settings.relativeDates)};
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function ago(d) {
    if (!REL) return "";
    var days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days < 0) return "";
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 7) return days + " days ago";
    var w = Math.floor(days / 7);
    if (days < 30) return w === 1 ? "1 week ago" : w + " weeks ago";
    var m = Math.floor(days / 30);
    if (days < 365) return m === 1 ? "1 month ago" : m + " months ago";
    return "";
  }
  function run() {
    document.querySelectorAll("article a[href^=http]").forEach(function (a) {
      if (a.hostname === location.hostname) return;
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    document.querySelectorAll("time[data-fq-ts][data-fq-full=time]").forEach(function (t) {
      var d = new Date(t.getAttribute("data-fq-ts"));
      if (isNaN(d)) return;
      var date = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      var time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
      t.textContent = date;
      var s = t.parentElement.querySelector(".pm-time");
      if (s) s.textContent = " \\u2022 " + time;
    });
    document.querySelectorAll("[data-fq-ago]").forEach(function (el) {
      var d = new Date(el.getAttribute("data-fq-ago"));
      el.textContent = isNaN(d) ? "" : ago(d);
    });
    document.querySelectorAll(".section-li .section").forEach(function (sec) {
      var t = sec.querySelector(".meta time");
      if (!t || sec.getAttribute("data-fq-done")) return;
      var d = new Date(t.getAttribute("datetime"));
      if (isNaN(d)) return;
      sec.setAttribute("data-fq-done", "1");
      t.textContent = d.getUTCDate() + " " + MON[d.getUTCMonth()] + " " + d.getUTCFullYear();
      var a = ago(d);
      if (a) {
        var s = document.createElement("span");
        s.className = "section-ago";
        s.textContent = a;
        sec.appendChild(s);
      }
    });
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function group(title, mode, st, T) {
    var cards = Object.keys(T.themes).filter(function (id) { return T.themes[id].mode === mode; }).map(function (id) {
      var t = T.themes[id], on = st[mode] === id;
      return '<button type="button" class="fq-card" data-fq-theme="' + id + '" aria-pressed="' + on + '">'
        + '<span class="fq-swatch">' + t.swatch.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + '</span>'
        + '<strong>' + esc(t.label) + '</strong><small>' + esc(t.blurb) + '</small></button>';
    }).join("");
    return '<h2>' + title + '</h2>' + (cards ? '<div class="fq-cards">' + cards + '</div>' : '<p>No themes available.</p>');
  }
  function settingsPage() {
    var host = document.getElementById("fq-settings");
    var T = window.fqTheme;
    if (!host || !T) return;
    var st = T.state();
    var html = '<h2>Appearance</h2><div class="fq-seg" role="group" aria-label="Mode">'
      + '<button type="button" data-fq-mode="light" aria-pressed="' + (st.mode === "light") + '">Light</button>'
      + '<button type="button" data-fq-mode="dark" aria-pressed="' + (st.mode === "dark") + '">Dark</button></div>'
      + '<p class="fq-note">The light/dark button in the sidebar switches between your chosen light and dark themes below.</p>';
    if (T.allow) {
      html += group("Your light theme", "light", st, T) + group("Your dark theme", "dark", st, T)
        + '<p><button type="button" class="fq-reset" data-fq-reset="1">Reset to site defaults</button></p>'
        + '<p class="fq-note">Saved in this browser only. No account, no cookies.</p>';
    }
    host.innerHTML = html;
    if (!host.__fq) {
      host.__fq = true;
      host.addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button");
        if (!b) return;
        if (b.dataset.fqTheme) T.setTheme(b.dataset.fqTheme);
        else if (b.dataset.fqMode) T.setMode(b.dataset.fqMode);
        else if (b.dataset.fqReset) T.reset();
        settingsPage();
      });
    }
  }
  if (!window.__fqSettingsBound) {
    window.__fqSettingsBound = true;
    document.addEventListener("themechange", settingsPage);
  }
  document.addEventListener("nav", function () { run(); settingsPage(); });
  run();
  settingsPage();
})();
`
}
