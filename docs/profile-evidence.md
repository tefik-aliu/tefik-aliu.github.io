# Profile evidence — review of 15 October 2026

This is the maintenance record behind the English/Swedish portfolio and CVs. The profile describes independent software projects, not software employment, seniority, customer outcomes or production scale. The GitHub profile repository already uses a broad software-engineering profile and was left unchanged.

## What the projects demonstrate

| Area | Implementation evidence | Scope |
| --- | --- | --- |
| Web applications | [IssuePilot API and browser assets](https://github.com/tefik-aliu/issuepilot/tree/39599c477e198fe1dc2bb9f4efc2f64cd25fb001/app), this portfolio's HTML/CSS/JavaScript | JavaScript interfaces, REST APIs, input validation, search/filtering, responsive pages and bilingual navigation. TypeScript is used in the service/simulator browser tests, not claimed as a frontend application framework. |
| Databases and integrity | [IssuePilot concurrency tests](https://github.com/tefik-aliu/issuepilot/blob/39599c477e198fe1dc2bb9f4efc2f64cd25fb001/tests/test_concurrency.py), [Service Lab transaction implementation](https://github.com/tefik-aliu/service-observability-lab/blob/18f6e6da090982d341ee03bba0defb7539d5445a/app/job_creation.py) | IssuePilot uses parametrised SQLite SQL, roles, transactional history and version checks. Service Lab uses SQLAlchemy, SQLite/PostgreSQL and persistent idempotency receipts. |
| Data processing and reporting | [Ops Report validation](https://github.com/tefik-aliu/ops-report-automator/blob/d3b0513004c7bfb8f87df8b2892b9136b87c0b8b/ops_reporter/core.py), [report generation](https://github.com/tefik-aliu/ops-report-automator/blob/d3b0513004c7bfb8f87df8b2892b9136b87c0b8b/ops_reporter/report.py), [LinePulse analytics](https://github.com/tefik-aliu/linepulse-industrial-intelligence/blob/643350db705fd21ba02123e3877678e1073358ac/app/analytics.py) | Pandas/OpenPyXL, schema validation, aggregation, charts, HTML and XLSX export. LinePulse events are synthetic; no measured factory improvement is claimed. |
| Service tooling | [Service Lab configuration](https://github.com/tefik-aliu/service-observability-lab/tree/18f6e6da090982d341ee03bba0defb7539d5445a), [health/readiness implementation](https://github.com/tefik-aliu/service-observability-lab/blob/18f6e6da090982d341ee03bba0defb7539d5445a/app/main.py) | Docker Compose, PostgreSQL, Prometheus/Grafana, optional OpenTelemetry and Kubernetes manifests. Configuration and local integration are not evidence of production operations. Job status is managed through CRUD; there is no background worker. |
| Automated verification | [IssuePilot QA](https://github.com/tefik-aliu/issuepilot-qa-automation/tree/bbd8d9d75c8a43a9206e6e9ee78dfac81aaad8b2), project test folders and this site's scripts | Python/Pytest/HTTPX/Playwright in the separate QA repository; TypeScript/Playwright in Service Lab and LinePulse. CI, regression checks, failure traces and semantic browser locators. |

## Reproduced locally

Each application was checked at the revision linked above, with its own development dependencies. No application source was changed.

- **IssuePilot:** 52 API/regression tests and all four opt-in browser cases passed. The browser cases cover roles, history, responsive layout and isolated concurrent sessions. One older end-to-end case is deselected by the project configuration.
- **Service Observability Lab:** 17 Python tests passed; Ruff passed. These local database tests use SQLite. PostgreSQL verification below is from CI, not this local run.
- **Ops Report Automator:** 26 tests and Ruff passed. The CLI generated an XLSX workbook and HTML report from `sample_data/operations_sample.csv`.
- **LinePulse:** 9 Python tests and Ruff passed. An XLSX response was opened successfully with OpenPyXL; it contains `Shift Summary` and `Production Events`. All values are simulated.
- **IssuePilot QA Automation:** 4 API tests passed against a disposable local IssuePilot instance. The live public demo was only read during this review.

The numbers describe dated checks, not a persistent uptime or quality guarantee. Do not add them to the CV without retaining the revision/date context.

## CI evidence inspected

| Project | Run | Recorded result |
| --- | --- | --- |
| Service Lab | [2 October 2026](https://github.com/tefik-aliu/service-observability-lab/actions/runs/36991272179) | 17 Python tests; 12 idempotency contracts also run against PostgreSQL 16; 4 Playwright tests; Ruff and TypeScript checks passed. The 12 PostgreSQL checks repeat contract cases and are not 12 additional unique features. |
| Ops Report | [1 October 2026](https://github.com/tefik-aliu/ops-report-automator/actions/runs/36853817326) | 26 tests, lint and generation of XLSX/HTML reports passed. |
| IssuePilot QA | [12 October 2026](https://github.com/tefik-aliu/issuepilot-qa-automation/actions/runs/38259293697) | 6 API/browser tests passed. An earlier failed run is superseded by this successful integration run; CI follows IssuePilot's current main branch. |

## Content boundaries

- Existing employment, education and language facts are preserved in `content/cv.json`; industrial employment is separate from independent development.
- No seniority, paid software experience, unsupported frameworks, 3D/game work, AI-model expertise or commercial scale is inferred.
- IssuePilot's public demo is shared and anonymous. Private-mode roles are implemented; no SSO, MFA or tamper-proof audit log is claimed.
- LinePulse has no real PLC/MES connection. PostgreSQL experience is evidenced by Service Lab, not by LinePulse's roadmap.
- Service Lab's k6 file is a defined health-endpoint scenario, not a published performance result. Kubernetes manifests are not proof of a production cluster.
- Ops Report is a batch tool for a fixed schema; it does not automatically deduplicate input records.
- QA Evidence Lab reports are fictional examples, labelled on the homepage and case page.

## Maintenance finding outside this change

IssuePilot's broad dependency range permits FastAPI 0.116.1, which failed app import at its logout route with a 204 response-body assertion in a separate compatibility check. A fresh installation using FastAPI 0.143.2 passed the 52 tests. This review does not claim compatibility with every version allowed by its requirements file; dependency support should be resolved in the application repository.

## Rebuild and site verification

See the README for CV/social-preview regeneration and the existing structural, browser, interaction and media checks. These checks cover both languages and every case page. Review the rendered CVs and homepage after content changes. Public Render demos may need time to wake up; they are supplementary to source code and local evidence.

### Portfolio checks completed for this change

- Structural, metadata, JSON-LD, ID, local-link and sitemap checks passed across all 14 pages.
- 84 page/viewport checks passed (14 pages at six widths), including axe WCAG A/AA/2.1 AA checks. Automated accessibility checks do not establish full conformance.
- Keyboard navigation, menu, filtering, disclosures, no-JavaScript access, reduced motion, clipboard success/failure and stable initial layout passed.
- Both LinePulse recordings/captions, deferred media loading and evidence downloads passed.
- Both CVs rendered and visually reviewed: one page and 10 link annotations each; the legacy English alias is byte-identical. Regeneration is deterministic.
- English/Swedish homepages visually reviewed at 390 and 1440 pixels; sharing cards inspected at 1200 × 630.
- Existing external destinations and 14 newly linked GitHub destinations returned HTTP 200. Both live demos served their actual application pages after wake-up. New sharing-image URLs require deployment before public validation.
