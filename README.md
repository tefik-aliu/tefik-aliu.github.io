# Tefik Aliu — Software Engineering Portfolio

A static portfolio at https://tefik-aliu.github.io/. The website connects selected systems to their architecture, implementation, tests and deployment configuration.

## Pages

- `index.html` — selected work, engineering capabilities, background and contact.
- `issuepilot.html` — roles, sessions and transactional history case study.
- `linepulse.html` — event simulation, analytics, reporting and verification case study.
- `service-observability-lab.html` — service topology, operational contracts and quality gates.
- `qa-evidence-lab.html` — fictional findings, severity filters and native expandable evidence.
- `release-rescue.html` — supplementary fixed-scope QA service.
- `404.html` — recovery route for missing pages.

## Local preview

From the repository root, run:

```sh
python -m http.server 4173
```

Open http://localhost:4173/. No package installation, compilation or framework is needed.

## Design and implementation

- Shared CSS tokens and responsive layouts at 600px, 820px and 1100px.
- System fonts keep the first render independent of font services and avoid font swaps.
- Semantic landmarks, visible keyboard focus, a skip link and native `details` controls.
- Content and mobile navigation remain usable without JavaScript. JavaScript enhances the menu, active navigation and finding filters.
- Reduced-motion preferences disable smooth scrolling and transitions.
- Diagrams describe repository architecture; source excerpts are real code, with file and line references. No simulated uptime or CI badges.
- No analytics, trackers or third-party runtime requests.

## Validation

Run the dependency-free structural and local-link check:

```sh
python scripts/validate_site.py
```

Browser checks are in `scripts/browser-checks.cjs`. They require Playwright in the environment and a local HTTP server on port 4173. Set `BROWSER_CHANNEL=msedge` to use installed Edge, or leave it unset for Playwright Chromium.

```sh
node scripts/browser-checks.cjs
```

The browser checks cover fourteen English/Swedish pages at 360, 390, 768, 1024, 1440 and 1920 pixels, overflow, runtime errors, navigation, keyboard interaction, filtering, no-JavaScript content and reduced motion. Development tools are optional and are not loaded by the website.

## Deployment

`.github/workflows/deploy-pages.yml` deploys the repository root to GitHub Pages on a push to `main`, or by manual dispatch. Redesign work belongs on a separate branch and is reviewed through a pull request before merging. `.nojekyll` keeps serving static assets straightforward. Pages configuration should use GitHub Actions.

## Content maintenance

- CVs are available in English and Swedish at `assets/Tefik_Aliu_CV_EN.pdf` and `assets/Tefik_Aliu_CV_SV.pdf`. The original CV URL remains an English alias.
- All PDFs and the original profile image remain available at their existing paths.
- When changing page titles or descriptions, also update canonical, Open Graph, Twitter and JSON-LD metadata. Keep `sitemap.xml` in sync with public pages.
- The social preview is a locally generated 1200 × 630 PNG, with no remote assets.
- Recheck linked source excerpts when the project implementations change.
- LinePulse uses synthetic data. Observability Lab demonstrates operational patterns, not a production SLO history. QA Evidence Lab uses fictional findings.

Public demos are externally hosted and may take time to wake after inactivity.

## Languages and demonstration media

Every English page has a static `*.sv.html` Swedish counterpart. Language links point to the equivalent page, work without JavaScript and include reciprocal hreflang metadata. `content/sv.json` is the original translation reference; the HTML pages are the current source of truth; generated pages are committed so deployment does not need a build step. Update both language pages when changing content.

The homepage includes three real browser recordings with native controls, no autoplay, on-demand video loading and written walkthroughs. Posters and videos live in `assets/demos/`. The recordings use local demonstration data; the observability recording uses SQLite and does not show the full Compose monitoring stack.

When changing CSS or JavaScript, refresh their content version parameters in all HTML pages. This prevents returning visitors from mixing old assets with new markup.

## Signature design

`signature.css` supplies the shared visual layer. `signature.js` progressively enhances the three-project architecture selector, email copying and reading progress. All project panels remain readable without JavaScript. Diagrams are simplified architecture views, not live operational dashboards. Social previews are local 1200 × 630 images in English and Swedish.

Run `node scripts/signature-checks.cjs` for keyboard, project switching, clipboard fallback, lazy media and no-JavaScript checks. The test stubs clipboard writes so it does not alter the system clipboard.
