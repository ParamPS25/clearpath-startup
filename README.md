# Clearpath — Startup Name & Market Validator

## What this is

A tool that takes a startup name (and optionally 2–3 candidate names) and returns a
validation report covering:

1. **Name Clash Score** — existing companies/products with similar names, domain-adjacent
   signals, social handle overlap.
2. **Market Landscape Brief** — competitors, recent news/funding activity, a synthesized
   summary of who else is playing in this space.

Output is a single combined verdict (e.g. "Low name risk, moderately crowded market — 3
direct competitors found") backed by cited sources, generated in seconds instead of 20+
minutes of manual searching.

**Core pipeline:** user input → backend orchestrator → parallel SERP API calls → LLM
synthesis (structured JSON, scored, cited) → cache in MongoDB/Redis → rendered report on
the frontend. Anything numeric or factual (scores, rank positions, who's above whom) is
computed deterministically in code from the raw search results — the LLM is only ever
asked to write the prose explanation around numbers it's handed, never to invent them.

---

## Status

Phases 1–6 below are done, plus two things not in the original phase plan:

- **`/seo-check`** (`POST /seo-rank`) — see the write-up under Phase 7.5. Built ahead of
  PDF export because it was judged more valuable for the demo.
- **A real landing page + site header** (`/`, with nav to Validate / Compare / SEO
  Check) — folded into the frontend work rather than left for Phase 8's polish pass.

**Phase 7 (PDF export) is deprioritized for now** — not started, revisit if time allows
after the features in Phase 7.6.

Currently in progress: **Phase 7.6 — search interest trend + domain/handle
availability** (see below).

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js** (TypeScript, App Router, Tailwind) | Fast DX, easy Vercel deploy, can colocate lightweight API routes if ever needed, good default for a judged demo. |
| Backend | **NestJS** (TypeScript) | Structured, modular, decorator-based — easier for an agent to extend cleanly phase-by-phase than raw Express, built-in support for guards (rate limiting), pipes (validation), and DI (clean SERP/LLM service separation). |
| Primary DB | **MongoDB** | Report shape is naturally document-like (nested SERP results + synthesis blob); no need for relational joins here. |
| Cache | **Redis** | Cache raw SERP results (TTL-based) to protect API quota during a live demo with concurrent judges, and for basic rate limiting. |
| External APIs | **SERP API**, **LLM API** (OpenAI or Claude — pick one and keep it swappable via an interface) | Core engine of the product. |

Deployment is deliberately out of scope for now — everything below runs locally. A
deployment phase can be added back in once the product itself is solid.

No SQL layer needed for MVP — everything here is document-shaped and doesn't need joins.
Skip it unless a later phase introduces genuinely relational data.

---

## How to work through this repo

This README is split into **phases**, not days. Work one phase at a time, in order.

**After finishing a phase:**
1. Stop.
2. Do not start the next phase automatically.
3. Summarize what was built, list any deviations from the spec below and why, and state
   clearly what needs manual review/testing.
4. Wait for explicit human confirmation ("phase N approved, move to phase N+1") before
   continuing.

If a phase's acceptance criteria can't be fully met, say so explicitly rather than marking
it done — partial progress with a clear list of what's missing is more useful than a
false "complete."

Commit at the end of each phase with a message like `phase-2: SERP + LLM core pipeline`.

---

## Environment variables (master list — add to `.env.example` as phases introduce them)

```
# Phase 1+
SERP_API_KEY=
LLM_PROVIDER=gemini   # or groq
GEMINI_API_KEY=
GROQ_API_KEY=

# Phase 3+
MONGODB_URI=
REDIS_URL=

# Phase 4+ (frontend)
NEXT_PUBLIC_API_BASE_URL=

# Phase 8+
RATE_LIMIT_WINDOW_MS=
RATE_LIMIT_MAX_REQUESTS=
```

---

## Phase 1 — Foundation & environment setup *(done)*

**Goal:** a running skeleton, deployed early, before any real feature work.

**Scope:**
- Monorepo or two-repo structure (agent's choice, document the decision) with `frontend/`
  (Next.js + TS + Tailwind) and `backend/` (NestJS + TS).
- Backend: health check endpoint (`GET /health`).
- Frontend: single placeholder page that calls `/health` (running locally, e.g.
  `http://localhost:3001/health`) and displays the result.
- `.env.example` files in both apps.
- Public GitHub repo initialized with `.gitignore`, base README (this file), and MIT or
  similar license.

**Acceptance criteria (manual test):**
- [ ] `npm install && npm run dev` works cleanly from a fresh clone for both apps.
- [ ] The local frontend page shows the health check result pulled from the local
      backend.

---

## Phase 2 — Core pipeline: SERP + LLM synthesis (backend only) *(done)*

**Goal:** prove the hard part works before building any UI around it.

**Scope:**
- `SerpService`: given a startup name, runs two SERP API queries:
  - **Name search** — the name plus terms like "company", "startup", "trademark",
    "app" to surface existing similarly-named entities.
  - **Market search** — a one-line description/pitch plus "competitors" to surface
    existing players in that space.
  - Run these two calls in parallel (`Promise.all`).
- `SynthesisService`: sends both raw result sets to the LLM with a system prompt that:
  - Returns **JSON only**, matching a fixed schema (see below).
  - Produces a `nameClashScore` (0–100, lower = more clash risk) with a short reason.
  - Produces a `marketSummary` (2–4 sentences) and a `competitors` list (name + one-line
    description) drawn from the search results — no inventing competitors not present in
    the results.
  - Produces an `overallVerdict` (one sentence) combining both signals.
  - Includes light source attribution (e.g. domain/title of the SERP result each claim is
    drawn from) so the report doesn't feel like unsupported vibes.
- Validate the LLM's JSON output against the schema; on parse failure, retry once with a
  stricter reminder before failing gracefully.
- One endpoint: `POST /validate` — body `{ name: string, pitch?: string }` — returns the
  full synthesis JSON. No auth, no DB yet.

**Suggested response schema:**
```json
{
  "name": "string",
  "nameClashScore": 0,
  "nameClashReason": "string",
  "marketSummary": "string",
  "competitors": [{ "name": "string", "description": "string" }],
  "overallVerdict": "string",
  "sources": [{ "title": "string", "url": "string" }]
}
```

**Acceptance criteria (manual test):**
- [ ] `POST /validate` with a real, well-known startup name returns a sensible,
      non-hallucinated report within a few seconds.
- [ ] `POST /validate` with a made-up, clearly unique name returns a low clash score and
      an empty or near-empty competitor list — i.e. the model isn't inventing results.
- [ ] Malformed LLM output doesn't crash the endpoint (test by temporarily forcing a bad
      prompt, or reviewing the retry/error-handling code path).

---

## Phase 3 — Data layer: MongoDB persistence + Redis caching *(done)*

**Goal:** stop re-spending API quota and start persisting reports.

**Scope:**
- MongoDB `reports` collection: store the full `/validate` request + response, plus a
  generated `_id` (used later for shareable links) and `createdAt`.
- Redis: cache raw SERP results keyed by normalized query (e.g. lowercased name), with a
  sensible TTL (e.g. 1 hour) — this is the layer that protects the demo from quota issues
  when several judges try it back to back.
- `/validate` now: check Redis cache for SERP results first → only call SERP API on a
  miss → always run LLM synthesis fresh (or cache the whole report by exact
  name+pitch if acceptable — document the tradeoff you pick) → save the final report to
  MongoDB → return it.

**Acceptance criteria (manual test):**
- [ ] Calling `/validate` twice with the same input is visibly faster the second time
      (cache hit) — confirm via logs or response time.
- [ ] Reports are visible in MongoDB after each call (spot-check via Compass/Atlas UI or
      a quick script).
- [ ] Redis TTL actually expires (verify a cached key disappears after the TTL window).

---

## Phase 4 — Frontend MVP *(done)*

**Goal:** an actual usable product, not just an API.

**Scope:**
- Landing/input page: name field, optional pitch field, submit button.
- Loading state while `/validate` runs.
- Report page/section rendering:
  - Name clash score (visually — a simple colored badge/gauge is enough, no need for a
    chart library yet).
  - Market summary + competitor list as cards.
  - Overall verdict, prominently displayed.
  - Sources listed at the bottom.
- Basic error state (API failure, timeout) with a retry option.
- Reasonably clean styling with Tailwind — doesn't need to be a design masterpiece yet,
  but should not look like an unstyled form.

**Acceptance criteria (manual test):**
- [ ] Full flow works end to end from the deployed frontend URL: type a name → see a
      real, correctly rendered report.
- [ ] Killing the backend or forcing a network error shows a clear error state, not a
      blank screen or console-only failure.

---

## Phase 5 — Shareable report links & history *(done)*

**Goal:** turn a one-off lookup into something judges (or you) can revisit.

**Scope:**
- `GET /reports/:id` backend endpoint returning a saved report by its Mongo `_id`.
- Frontend route `/report/[id]` that fetches and renders a saved report using the same
  UI components as Phase 4.
- After generating a report, show/copy a shareable link to that report's page.
- (Optional, only if time allows) a simple `/reports` list page showing recently
  generated reports.

**Acceptance criteria (manual test):**
- [ ] Generating a report, copying its link, and opening that link in a fresh
      incognito/private window renders the same report correctly.
- [ ] An invalid/nonexistent report ID shows a clean "not found" state, not a crash.

*Deviation: the optional `/reports` list page was skipped (explicitly optional in this
doc). Saved reports are cached indefinitely on the frontend once fetched, since a report
is immutable once created.*

---

## Phase 6 — Differentiator: comparison mode *(done)*

**Goal:** the headline "wow" feature — turn a lookup tool into a decision tool.

**Scope:**
- Frontend: allow input of 2–3 candidate names (with a shared or per-candidate pitch).
- Backend: `POST /validate/compare` — runs the same pipeline for each candidate (in
  parallel), returns an array of reports plus a simple recommendation (e.g. "Candidate B
  has the lowest name clash risk and a less crowded market").
- Frontend: side-by-side card layout for the candidates, with the recommended one
  visually highlighted.

**Acceptance criteria (manual test):**
- [ ] Submitting 3 real candidate names returns 3 distinct, correctly attributed reports
      (no cross-contamination between candidates).
- [ ] The recommendation logic is visibly grounded in the actual scores shown, not a
      generic statement.

*Deviation: the recommendation is deterministic (highest `nameClashScore`, tie-broken by
fewer competitors), not another LLM call — cheaper, faster, and can't drift from the
numbers actually shown on the cards.*

---

## Phase 7 — PDF export *(deprioritized, not started)*

**Goal:** make the report feel like a deliverable artifact, not just a webpage.

**Scope:**
- A "Download PDF" button on the single-report view (and optionally the comparison view).
- Server-side or client-side generation (Puppeteer for fidelity if the backend can afford
  it; a lighter library like `pdf-lib`/`react-pdf` if not) — pick based on what's fast to
  implement well, and document the choice.
- PDF should be a clean, readable rendering of the report — not a raw screenshot dump.

**Acceptance criteria (manual test):**
- [ ] Downloaded PDF opens correctly and is legible, matching the on-screen report
      content.

---

## Phase 7.5 — SEO rank checking *(done)*

**Goal:** answer "now that I've launched, where do I actually show up on Google for my
target keywords, and who's outranking me?" — the future phase originally sketched at the
bottom of this doc, picked up ahead of PDF export.

**Scope:**
- `POST /seo-rank` — body `{ businessName, domain, keywords: string[] (1-10), location? }`.
- For each keyword: a real SerpApi search (up to 20 results), then **in code, not the
  LLM** — find the domain's position in those results (or `null` if not present) and the
  competitors ranking above it. The LLM only writes a one-line explanation per keyword
  plus an overall summary, grounded in the same titles/urls it's handed, and is told not
  to invent authority/traffic numbers it wasn't given.
- Frontend `/seo-check` page: business name + domain + keyword list (+ optional
  location), results as color-coded rank badges with an expandable "who's ranking above
  you" list.

**Acceptance criteria (manual test):**
- [x] A well-known domain with a keyword it should plausibly rank for shows a real
      position with a real competitor list above it.
- [x] A domain not found in the checked results shows `null`/"not in top 20" plainly,
      instead of a guessed position.
- [x] The explanation text is traceable to the actual titles/urls shown, not generic SEO
      advice.

**Bugs found and fixed while building this** (both verified against live SerpApi calls
before/after): generic keyword queries without an explicit `hl`/`gl` locale matched
loosely on individual words instead of the phrase (e.g. "note taking app" surfaced a CNBC
article and a YouTube video, matching only on unrelated senses of "taking"); even with
locale set, some phrases still did this until the keyword was wrapped in an exact-phrase
quote (e.g. "issue tracking software" surfaced fitness-tracker results until quoted).

---

## Phase 7.6 — Search interest trend *(in progress)*

**Goal:** a small, high-signal addition to the existing `/validate` report, computed from
real data, not an LLM guess.

*Domain & social handle availability (originally scoped as part of this phase, research
above) was explicitly dropped — trend only for now.*

Show whether interest in the candidate name is rising, flat, or declining over the last
12 months, using SerpApi's `google_trends` engine (`data_type=TIMESERIES`,
`date=today 12-m`) — same API, same account, just a different `engine` param, so this
doesn't introduce a new integration pattern.

- Weekly interest-over-time points (0–100 relative scale) for the name, cached like other
  SerpApi calls.
- Direction is computed deterministically: compare the average of the earliest 3 complete
  weeks vs. the most recent 3 complete weeks (excluding the current, `partial_data` week)
  against a threshold — `rising` / `declining` / `flat`. No LLM involved in the number.
- **Verified real behavior to design around:** most invented/candidate startup names have
  *no* Trends data at all (Google Trends only has data for terms people already search).
  This is the correct, honest outcome for a brand-new name, not a bug — the UI needs an
  explicit "not enough search volume to show a trend" state, not just three options.
- Attached to the report as `searchTrend` (computed after LLM synthesis, alongside the
  existing bolted-on `id` field — never part of the LLM-validated schema).
- Frontend: a small sparkline + a direction badge next to the verdict on both the single
  report and comparison cards.

**Acceptance criteria (manual test):**
- [ ] A well-known, actively-searched name shows a real 12-month sparkline and a
      direction that matches what a manual Google Trends check shows.
- [ ] A made-up name shows the explicit "not enough data" state, not a fabricated flat
      line.

*Note on the dropped domain/handle idea, kept for whoever picks it up later: RDAP
(https://rdap.org) is a reliable, keyless way to check `.com` registration (`200` =
taken, `404` = available), but its public bootstrap redirector gives false "available"
results for `.io`/`.co`/`.so` (verified against `github.io`, `vercel.co`, `notion.so` —
all wrongly reported as free). GitHub's `api.github.com/users/<handle>` is a reliable,
free way to check a handle. Twitter/X, Instagram, and TikTok have no reliable free
method — scraping their profile pages is blocked/unreliable enough to risk a wrong
answer live in a demo.*

---

## Phase 8 — Hardening & polish

**Goal:** make sure the live demo can't be broken by normal judge behavior.

**Scope:**
- Rate limiting on `/validate` and `/validate/compare` (NestJS guard + Redis-backed
  counter) to prevent quota exhaustion if multiple people hit it at once.
- Input validation (empty name, absurdly long input, obvious spam) with clear frontend
  error messages.
- Loading/error states audited across every page, not just the happy path.
- Visual polish pass: consistent spacing, color-coding by risk score (e.g. green/amber/
  red), a proper landing page rather than a bare form.
- Cross-browser/mobile sanity check (at minimum: Chrome desktop + one mobile viewport).

**Acceptance criteria (manual test):**
- [ ] Rapidly submitting the form multiple times triggers a graceful rate-limit message,
      not a crash or silent failure.
- [ ] Every known error path (bad input, API timeout, not-found report) has been
      manually triggered and shows a sensible UI state.

---

## Phase 9 — Demo prep (local)

**Goal:** ready to present from a local environment, with a safety net. Deployment can be
tackled as a separate phase later if there's time before submission.

**Scope:**
- `README.md` rewritten for judges (not the agent): problem statement, screenshots/GIF,
  architecture summary, tech stack, and clear local setup instructions (`git clone` →
  `.env` setup → `npm run dev` for both apps).
- Record a short demo video/GIF of the full flow running locally — this doubles as your
  submission asset and a safety net if anything breaks live.
- Pre-test 5–10 real example inputs and note which produce the cleanest-looking reports —
  use one of these as the primary live demo input rather than an untested cold input.
- Confirm the public GitHub repo is actually public and the final commit is pushed.

**Acceptance criteria (manual test):**
- [ ] A person with no prior context can open the GitHub repo, read the README, and get
      the app running locally within a few minutes by following the setup steps alone.
- [ ] The recorded demo video/GIF accurately reflects the current state of the app.

---

## Future phase (not started): deployment

Once the product is solid and demo-ready locally, add a deployment phase covering
frontend (e.g. Vercel), backend (e.g. Render/Railway), MongoDB Atlas, and Redis Cloud —
plus a check that the live deployed link works from a device that never touched the local
dev environment. Not scoped in detail here since it's deliberately deferred.

---

## Agent working notes

- Keep the LLM synthesis prompt and schema in one clearly named, easy-to-find file (e.g.
  `backend/src/synthesis/prompt.ts`) — this is the project's core IP and will likely need
  manual tuning between phases.
- Keep the SERP query construction logic isolated and easy to tweak (query wording has a
  large effect on result quality).
- Prefer boring, well-documented libraries over clever ones — this needs to survive a live
  demo, not win a code-golf contest.
- Do not skip a phase's manual review gate even if the next phase seems trivial to start.
