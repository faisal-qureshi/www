import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = (props: QuartzComponentProps) => {
  const { cfg, ctx } = props
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = ctx.argv.serve ? "/" : url.pathname

  const homeBase = baseDir.endsWith("/") ? baseDir : baseDir + "/"

  return (
    <div class="nf-wrap">
      <article class="nf popover-hint">
        <div class="nf-code" aria-label="404">
          <span>4</span>
          <span class="nf-zero" aria-hidden="true">
            <span class="nf-eyes">
              <i></i>
              <i></i>
            </span>
          </span>
          <span>4</span>
        </div>
        <h1 class="nf-title">Well, this is awkward.</h1>
        <p class="nf-sub">
          This page went out for coffee and never came back. It may have been moved, renamed, or
          eaten by a particularly hungry gremlin.
        </p>
        <div class="nf-actions">
          <a class="nf-btn" href={homeBase}>
            Take me home
          </a>
          <a class="nf-btn nf-ghost" href={homeBase + "me/whoami"}>
            Meet the human behind this
          </a>
        </div>
        <p class="nf-fine">Error 404 · Page not found · Blame the gremlin, not me.</p>
      </article>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          if (typeof fetchData !== "undefined") {
            fetchData.then(function(index) {
              var basePath = document.body.dataset.basepath || "";
              if (basePath.length > 1 && basePath.endsWith("/")) {
                basePath = basePath.slice(0, -1);
              }
              var pathname = window.location.pathname;
              var hasBasePrefix = basePath.length > 1 && pathname.startsWith(basePath);
              if (hasBasePrefix) {
                pathname = pathname.slice(basePath.length);
              }
              if (pathname.startsWith("/")) {
                pathname = pathname.slice(1);
              }
              if (pathname.endsWith("/")) {
                pathname = pathname.slice(0, -1);
              }
              if (pathname.endsWith(".html")) {
                pathname = pathname.slice(0, -5);
              }
              if (pathname.endsWith("/index")) {
                pathname = pathname.slice(0, -6);
              }
              var lowered = pathname.toLowerCase();
              if (lowered !== pathname && index[lowered] != null) {
                var prefix = hasBasePrefix ? basePath : "";
                var target = prefix + (prefix.endsWith("/") ? "" : "/") + lowered;
                window.location.replace(target);
              }
            });
          }
          `,
        }}
      />
    </div>
  )
}

NotFound.css = `
.nf-wrap { width: 100%; max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }
.nf { text-align: center; padding: 3rem 0 1rem; }
.nf-code {
  display: flex; justify-content: center; align-items: center; gap: 0.6rem;
  font-family: var(--headerFont); font-weight: 800; line-height: 1;
  font-size: clamp(5rem, 22vw, 11rem);
  background: linear-gradient(135deg, var(--secondary), var(--tertiary));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.nf-zero {
  position: relative; display: inline-block; width: 0.72em; height: 0.92em;
  border: 0.16em solid var(--secondary); border-radius: 50%;
  animation: nf-float 3s ease-in-out infinite;
}
.nf-eyes { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; gap: 0.1em; }
.nf-eyes i {
  display: block; width: 0.14em; height: 0.14em; border-radius: 50%; background: var(--dark);
  animation: nf-blink 4s infinite;
}
.nf-title { margin: 1rem 0 0.5rem; font-size: clamp(1.6rem, 5vw, 2.4rem); }
.nf-sub { max-width: 34rem; margin: 0 auto 2rem; color: var(--darkgray); font-size: 1.1rem; }
.nf-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; }
.nf-btn {
  padding: 0.7rem 1.4rem; border-radius: 999px; font-weight: 600;
  background: var(--secondary); color: var(--light) !important; border: 2px solid var(--secondary);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.nf-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18); }
.nf-btn.nf-ghost { background: transparent; color: var(--secondary) !important; }
.nf-fine { margin-top: 2.5rem; font-size: 0.8rem; color: var(--gray); }
@keyframes nf-float { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
@keyframes nf-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
@media (prefers-reduced-motion: reduce) { .nf-zero, .nf-eyes i { animation: none; } }
`

export default (() => NotFound) satisfies QuartzComponentConstructor
