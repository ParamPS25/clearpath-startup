# Clearpath

**Know if the name is taken before you build the brand.**

Clearpath is a startup name and market validation tool. You type in a name
you're considering (and optionally a one line pitch describing what it
does), and Clearpath searches the web for you across several signals at
once: existing companies already using that name, competitors already in
your market, how much people are actively searching for it, and where a
related domain currently ranks on Google. It then turns all of that into one
clear, scored verdict with its sources cited, in under a minute instead of
the 20+ minutes it usually takes to do the same research by hand.

Built for a [SerpApi](https://serpapi.com/) hackathon.

---

## Features

- **Name clash check.** Clearpath searches the web for existing companies,
  apps, and trademarks that use the name you're considering, then scores how
  likely it is to collide with something that already exists. This runs on
  live Google search results (fetched through SerpApi) that get interpreted
  by an AI model, so the score reflects what's actually out there right now,
  not a guess.
- **Market landscape.** Alongside the name check, Clearpath looks for real
  competitors already operating in your space and summarizes who they are.
  Every claim in that summary is tied back to the specific search result it
  came from. Nothing is invented: if the search results don't support a
  claim, the report simply leaves it out.
- **Search interest trend.** Using Google Trends data (also fetched through
  SerpApi), Clearpath pulls the last 12 months of search interest for the
  name and shows whether people are searching for it more, less, or about
  the same as before, with a small graph alongside it. If the name is too
  new or too niche to have any real search history, it says so plainly
  instead of guessing.
- **Comparison mode.** Deciding between 2 or 3 candidate names? Clearpath
  checks all of them at once and lays the results out side by side, then
  recommends a winner. That recommendation isn't an AI's opinion: it's
  calculated directly from the same scores shown on screen (the name with
  the lowest clash risk wins, ties broken by whichever has fewer
  competitors), so it can never contradict its own numbers.
- **SEO rank check.** Give Clearpath a domain and a list of keywords you
  care about, and it finds out where that domain actually ranks in live
  Google search results for each one (or confirms it isn't ranking at all),
  and explains which pages are outranking it and why.
- **Shareable report links.** Every report gets its own permanent link you
  can send to a co-founder or save for later. Since a saved report never
  changes, it's cached indefinitely once created, so opening it again is
  instant.
- **Light and dark theme**, with a real toggle you can switch by hand, not
  just something that silently follows your system settings.

### Grounded, not guessed

Across every feature above, anything numeric or factual (a score, a rank
position, a trend direction, who's ranking above whom) is calculated
directly in code from the raw search results. The AI model is only ever
asked to write the explanation around numbers it's already been given,
never to invent the numbers themselves. That split was a deliberate design
choice made throughout the whole project, not an afterthought.

---

## How it works

```
user input → backend orchestrator → parallel SERP API calls
           → LLM synthesis (structured JSON, validated against a schema)
           → deterministic scoring/ranking/trend logic in code
           → cached in MongoDB + Redis
           → rendered report on the frontend
```

SERP results are cached in Redis (keyed by query) to protect API quota, and
generated reports are persisted in MongoDB so they're retrievable by a
shareable link. The AI layer isn't locked to one provider: Gemini is used
first, with an automatic fallback to Groq if it's rate limited or returns an
error.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | [Next.js](https://nextjs.org/) 16 (App Router, TypeScript, Tailwind CSS v4) |
| Backend | [NestJS](https://nestjs.com/) (TypeScript) |
| Database | [MongoDB](https://www.mongodb.com/atlas) (via Mongoose) for persisted reports |
| Cache | [Redis](https://redis.io/cloud/) (via ioredis) for SERP result caching |
| LLM | [Gemini](https://aistudio.google.com/) as primary, [Groq](https://console.groq.com/) as fallback |
| Search data | [SerpApi](https://serpapi.com/), using its Google Search and Google Trends engines |
| Validation | Zod (LLM output schema validation), class-validator (request DTOs) |
| Analytics | Vercel Speed Insights |

---

## Getting started

### Prerequisites

- Node.js 20+ and npm
- Free tier accounts for: [SerpApi](https://serpapi.com/), [Google AI Studio](https://aistudio.google.com/) (Gemini), [Groq](https://console.groq.com/), [MongoDB Atlas](https://www.mongodb.com/atlas), [Redis Cloud](https://redis.io/cloud/)

### 1. Clone and install

```bash
git clone https://github.com/ParamPS25/clearpath-startup.git
cd clearpath-startup

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy each app's `.env.example` to `.env` and fill in your own keys.

**`backend/.env`**

```
PORT=3001
SERP_API_KEY=

LLM_PROVIDER=gemini   # or groq
GEMINI_API_KEY=
GROQ_API_KEY=

MONGODB_URI=
REDIS_URL=
```

**`frontend/.env`**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run both apps

```bash
# terminal 1
cd backend && npm run start:dev

# terminal 2
cd frontend && npm run dev
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:3001`
(health check at `/health`).

---

## Project structure

```
backend/src/
  validate/     POST /validate, POST /validate/compare
  synthesis/    LLM prompt, schema validation, trend classification
  seo/          POST /seo-rank
  serp/         SerpApi wrapper (Google Search + Trends)
  llm/          Gemini/Groq provider abstraction
  reports/      GET /reports/:id, MongoDB persistence
  cache/        Redis wrapper

frontend/src/
  app/          /  /validate  /compare  /seo-check  /report/[id]
  components/   Shared UI (forms, report cards, header, footer, theme toggle)
  lib/          API client, shared types
```

---

## License

MIT, see [LICENSE](./LICENSE).

## Contributor

Built by [@ParamPS25](https://github.com/ParamPS25).
