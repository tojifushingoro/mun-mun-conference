# MUN Conference Manager — Developer Handoff

You are picking up **MUN Conference Manager**, a single-page web app for running an
in-school Model United Nations conference. This document is the full handoff: what
the app is, what has been built, every tool to install, where every file lives, how
to run it, how to change the database, and how to deploy.

Read this top to bottom before touching anything.

---

## 1. What this app is

A shared dashboard for conference staff ("the Dias") used on multiple laptops at once:

- **Admin Dashboard** — create/edit/delete committees and register/edit/remove delegates.
- **Dias Roster** — searchable, sortable, filterable grid of delegates; click a card to
  open a profile modal (committee, country, grade, role, notes, score history).
- **Live Scoreboard** — per-committee scoreboard. Chairs define their own scoring
  categories (each with a per-delegate cap), score inline in each delegate's row, and
  see a chronological turn log. Totals rank delegates automatically.
- **Realtime** — Supabase Realtime keeps every open laptop in sync for `delegates`
  and `scores`.

- **Live app:** https://mundashboarddias.vercel.app/
- **GitHub:** https://github.com/tojifushingoro/mun-mun-conference (branch `main`)
- **Supabase project:** "TFL_MUN", project ref `ojzdfqwcsubrunhktvvy`
  (`https://ojzdfqwcsubrunhktvvy.supabase.co`)

---

## 2. Tools to install on the new machine

| Tool | Version on the old machine | Why / install |
|------|---------------------------|----------------|
| **Git** | 2.56.0 | Clone repo, push deploys. https://git-scm.com/ |
| **Node.js** | v24.21.0 | Vite needs Node 18+; the browser test harness needs Node 22+ for global `WebSocket`. Install Node 22 LTS or 24. https://nodejs.org/ |
| **npm** | ships with Node | Dependencies. |
| **Supabase CLI** | 2.119.0 | Run SQL against the linked database. `npm install -g supabase` |
| **Vercel CLI** | 62.1.0 | **Optional — not required.** Deploys happen automatically on `git push`. Install only if you want it: `npm install -g vercel` |
| **Google Chrome** | — | Only for the headless browser test harness (see Appendix B). |

### Windows / PowerShell tip

On the old machine PowerShell script execution is disabled, so the `.ps1` shims
(`npm.ps1`, `supabase.ps1`, `vercel.ps1`) fail with *"running scripts is disabled on
this system."* **Call the `.cmd` shims instead:**

```powershell
npm.cmd install
supabase.cmd --version
vercel.cmd --version
```

This is why every command in this doc uses `.cmd`. On the new machine you can either
do the same, or enable scripts once with
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

---

## 3. Get the code

```powershell
git clone https://github.com/tojifushingoro/mun-mun-conference.git
cd mun-mun-conference
npm.cmd install
```

---

## 4. Environment file (GITIGNORED — will NOT come with the clone)

The app reads Supabase credentials from `.env.local`, which is gitignored. **You must
recreate it on the new machine.** Either copy `.env.local` across from the old machine,
or make a new one:

```powershell
Copy-Item .env.example .env.local
```

Then fill in the values (from **Supabase → Project Settings → API**):

```env
VITE_SUPABASE_URL=https://ojzdfqwcsubrunhktvvy.supabase.co
VITE_SUPABASE_ANON_KEY=<the project's anon/public key>
```

- The URL is public and safe to keep in a file; the anon key is also public (it ships
  in the browser bundle), but do not commit `.env.local`.
- Restart the Vite dev server after editing `.env.local`.
- If lost, the anon key is in the Supabase dashboard (Project Settings → API).

### Run locally

```powershell
npm.cmd run dev      # http://localhost:5173/
npm.cmd run build    # production build into dist/
npm.cmd run preview  # preview the production build
```

---

## 5. Database (Supabase)

The database is **Supabase-hosted Postgres**. There is no local Postgres/Docker setup
in use — all changes are applied to the linked remote project.

### Link the CLI (do this once on the new machine)

```powershell
supabase.cmd login                        # open browser, log into your Supabase account
supabase.cmd link --project-ref ojzdfqwcsubrunhktvvy
```

`supabase link` may ask for the project's database password (keep it in your password
manager). Linking writes to `supabase/.temp/`, which is gitignored, so this must be
redone on every new machine.

### Applying SQL changes

All schema changes are kept as **idempotent `.sql` scripts** in `supabase/`. Apply one
with:

```powershell
supabase.cmd db query --linked --file supabase\<script>.sql
```

**Gotchas (learned the hard way):**

- `supabase.cmd db query --linked` sometimes throws a transient
  `DbConfigConnectTempRoleError` (temp role password auth). **Just retry.**
- `--linked --file` only surfaces the **last** statement's result set in the output.
  To verify something, run it as its own single query.
- Don't run DB queries in parallel — they can race/auth-collide.
- **Alternative with no CLI:** paste any script into the Supabase dashboard's SQL Editor.

### The SQL scripts in `supabase/`

| File | Purpose | Applied? |
|------|---------|----------|
| `schema.sql` | Original schema: `committees`, `delegates`, `scores`, `score_totals` view, indexes, `updated_at` triggers, realtime, RLS. | Yes |
| `create_score_categories.sql` | **Most important recent migration.** Creates `score_categories` (per-committee, `UNIQUE(committee_id, name)`, `max_points > 0`), drops the old `scores.category` default + sets `NOT NULL`, adds realtime + RLS, and creates the **`enforce_score_category_limit`** trigger. | Yes |
| `rename_vice_chair.sql` | Renamed all "Vice Chair" delegates to "ACD". | Yes |
| `migrate_grades.sql`, `migrate_grades_v2.sql` | Migrated legacy grade values to the current grade system. | Yes |
| `allow_null_country.sql` | Made `delegates.country` nullable (staff roles don't represent a nation). | Yes |
| `names_fk_constraint.sql` | Renamed FK constraints to the `*_single_committee_link` convention used by the `.select()` embeds. | Yes |
| `fix_scores_table.sql`, `recreate_scores.sql`, `repair_scores.sql` | Earlier fixes to the `scores` table. | Yes |
| `diagnose_scores.sql`, `inspect_scores_row.sql` | Read-only diagnostics. | N/A |

**Current DB facts:** 7 committees (C4, PNA, UNESCO, UNHRC, UNICEF, UNSC, WHO) and
180 delegates (165 Delegate / 8 ACD / 7 Chair). C4 has one member and no scored
delegates.

### The cap trigger (the real enforcement boundary)

RLS is wide open, so the app cannot be trusted as the boundary. `create_score_categories.sql`
installs a `BEFORE INSERT OR UPDATE` trigger on `scores` that:

1. Rejects a score whose category is not declared for the delegate's committee.
2. Rejects a **positive** score that would push the delegate past `max_points` for that
   category. Negative entries (corrections) stay allowed even when already over.

The UI mirrors these rules for good UX, but the trigger is the guarantee.

---

## 6. Deploy

**Deploys are automatic via git.** Vercel is connected to the GitHub repo, so:

```powershell
git add -A
git commit -m "your message"
git push origin main
```

Vercel builds and deploys `main` to https://mundashboarddias.vercel.app/ in ~15–60s.
No CLI step needed.

- `vercel.cmd --prod` **fails with "Not authorized"** (the linked project belongs to a
  team scope the logged-in user can't deploy to directly). Don't use it — use git push.
- `.vercel/` is gitignored, so it won't exist after cloning. That's fine; deploys go
  through GitHub integration.

---

## 7. File map — where everything lives

```
mun-mun-conference/
├── index.html                 # HTML shell: meta, Open Graph, favicon, fonts
├── package.json               # scripts + deps (dev/build/preview)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example               # template for .env.local
├── .env.local                 # GITIGNORED — real Supabase creds (recreate it)
├── README.md                  # older user-facing docs (partly out of date)
├── HANDOFF.md                 # this file
│
├── public/                    # static assets copied to the build as-is
│   ├── globe.svg              # favicon
│   ├── og-image.png           # 1200x630 Open Graph image (real app screenshot)
│   ├── 404.html               # custom 404 page
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── App.jsx                # shell + tab nav; sets per-tab <title>/description
│   ├── main.jsx               # React entry
│   ├── index.css              # Tailwind layers + .card/.btn-*/.input-field + keyframes
│   │
│   ├── config/
│   │   └── supabase.js        # Supabase client (reads VITE_* env vars)
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── DiasRoster.jsx
│   │   └── LiveScoreboard.jsx
│   │
│   ├── hooks/
│   │   ├── useCommittees.js
│   │   ├── useDelegates.js
│   │   ├── useScores.js
│   │   ├── useScoreCategories.js   # NEW: score categories CRUD + realtime
│   │   └── useRealtimeScores.js    # realtime channel subscriptions
│   │
│   ├── lib/
│   │   ├── categories.js      # NEW: categoryTotal() / remainingPoints() cap helpers
│   │   ├── grades.js          # canonical grade list + gradeSort()
│   │   ├── sfx.js             # playScoreAdded / playScoreRemoved / playError
│   │   ├── utils.js           # cn(), formatGrade(), isStaffRole(), ...
│   │   └── connectionStatus.js
│   │
│   └── components/
│       ├── Admin/
│       │   ├── CommitteePanel.jsx
│       │   └── DelegatePanel.jsx
│       ├── Common/
│       │   ├── ConnectionBadge.jsx
│       │   ├── DevTag.jsx      # the "dev" badge name list lives here
│       │   ├── LoadingSpinner.jsx
│       │   ├── NavTabs.jsx
│       │   └── SoundToggle.jsx
│       ├── Roster/
│       │   ├── DelegateCard.jsx
│       │   ├── DelegateModal.jsx   # opens via React portal to <body> (see §9)
│       │   ├── FilterDropdown.jsx
│       │   └── RosterFilters.jsx
│       └── Scoreboard/
│           ├── CategoryManager.jsx  # NEW: top-of-page category CRUD
│           ├── CommitteeTab.jsx
│           ├── ScoreboardTable.jsx  # NEW: inline scoring + caps
│           └── ScoreLog.jsx
│
└── supabase/
    ├── schema.sql
    ├── create_score_categories.sql   # the categories table + cap trigger
    ├── rename_vice_chair.sql
    ├── migrate_grades.sql / migrate_grades_v2.sql
    ├── allow_null_country.sql
    ├── names_fk_constraint.sql
    ├── fix_scores_table.sql / recreate_scores.sql / repair_scores.sql
    ├── diagnose_scores.sql / inspect_scores_row.sql
    └── .temp/                        # GITIGNORED — CLI link state
```

---

## 8. What has been built (feature/change history)

Recent work, newest first:

```
b12ec86  Fix roster delegate modal appearing off-screen
02e8c98  Custom per-committee scoring categories with per-delegate caps
3228766  Scroll the edit form back into view when editing a delegate
8461e95  Fix blank roster page and consolidate grade ladder
f6b9226  Grade list stops at Grade 4
8d86f1f  Rename Vice Chair role to ACD
1712483  Rework grade hierarchy, trim roles, multi-select filters
b45f74e  Add role sorting to roster, sortable admin delegate table
681a9f9  Hide staff from the roster by default
e607ac6  Add subtle sound effects for scoring actions
55c701a  Add roster sorting/role filters, connection badge, and UI animations
538fcdc  Correct schema.sql to match live bigint IDs
60d7001  Exclude staff Dias from the scoreboard
5b102a9  Show dev tag for flagged delegates
```

### The two most recent pieces of work in detail

**A. Custom per-committee scoring categories with caps (`02e8c98`)**

- Removed the 10 hardcoded categories (Speech, Caucus, Diplomacy, Resolution,
  Amendment, POI, Opening Speech, Closing Speech, Moderated/Unmoderated Caucus) and the
  old dropdown "Turn Logger" form (`TurnLogger.jsx` was deleted).
- Chairs now define **per-committee** categories, each with a **per-delegate max**, in a
  `CategoryManager` panel at the top of the Scoreboard.
- Scoring is **inline**: click a category cell in a delegate's row, type points, Enter.
  The cell shows `value /cap` with remaining points in a tooltip.
- Caps and category existence are enforced in the **UI** (toast + error sound) **and in
  the DB** by the `enforce_score_category_limit` trigger.
- Categories still showing scored points remain visible even if the definition is
  deleted, so earned points never silently disappear.
- Realtime: another laptop sees category changes live.

**B. Roster modal off-screen fix (`b12ec86`)**

- Symptom: clicking a delegate blurred the screen but showed nothing.
- Cause: the modal was rendered inside the page's `animate-slide-up` wrapper. That
  animation's `animation-fill-mode: both` permanently retains `transform`, which makes
  the wrapper a **containing block for `position: fixed`** — so the fixed overlay was
  positioned relative to the ~8000px-tall roster container, not the viewport.
- Fix: render `DelegateModal` through **`createPortal(..., document.body)`** so it always
  anchors to the viewport. Verified locally and against production.

---

## 9. Important conventions & gotchas

- **React portal for overlays.** Any `position: fixed` overlay must not live under the
  animated page wrapper. `DelegateModal` portals to `<body>`; follow that pattern.
- **`supabase .select()` embeds** use the named FK constraints, e.g.
  `committees!delegates_single_committee_link ( id, name )`, and the result lands under
  the key `committees`.
- **IDs are `bigint`**; code compares ids as `String(id)` where needed.
- **Windows:** use `.cmd` shims (`npm.cmd`, `supabase.cmd`, `vercel.cmd`).
- **Deploy = `git push origin main`.** Never `vercel --prod`.
- **`index.html` and `public/robots.txt` hardcode the production domain**
  (`https://mundashboarddias.vercel.app`). If the domain ever changes, update the
  `og:image`/`og:url`/`twitter:image` values in `index.html` and the `Sitemap:` line in
  `public/robots.txt`, and the `<loc>` in `public/sitemap.xml`.
- **Per-page meta** is set in `src/App.jsx` (`PAGE_META` + a `useEffect` on the active tab).
- **The "dev" badge** is name-based; edit `DEV_TAGGED_NAMES` in
  `src/components/Common/DevTag.jsx` (currently `['Sheikh Ayan']`).
- **Grades** are canonical in `src/lib/grades.js`; `normalizeGrade()` maps legacy values.
- **Staff roles** (Chair, ACD, Observer) are excluded from the scoreboard via
  `isStaffRole()` and don't need a country.

---

## 10. Known issues to fix before the conference (carried over)

1. **No error boundary anywhere.** One render error blanks the entire app. Add a
   top-level React error boundary.
2. **RLS is fully open (anonymous read/write) and `delegates.notes` contains student
   names.** The app is on a public URL with no auth. This is the biggest risk — flagged
   repeatedly. Either add Supabase Auth + real RLS policies, or remove/host-lock the
   public deployment before real student data is on it.
3. **Committee changes have no dedicated realtime subscription** (only `delegates` and
   `scores` do); a committee-only change may need a manual reload on other laptops.
4. `README.md` is partly out of date (it still describes hardcoded default score
   categories and no `score_categories` table). This `HANDOFF.md` is the current source
   of truth.

---

## Appendix A — Quick start checklist for the new machine

```powershell
# 1. install git, node 22/24, then:
npm.cmd install -g supabase        # (optional) npm.cmd install -g vercel

# 2. clone
git clone https://github.com/tojifushingoro/mun-mun-conference.git
cd mun-mun-conference
npm.cmd install

# 3. create .env.local (copy from old machine, or):
Copy-Item .env.example .env.local   # then paste VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

# 4. run
npm.cmd run dev                     # http://localhost:5173/

# 5. (only if you need to run SQL) link Supabase
supabase.cmd login
supabase.cmd link --project-ref ojzdfqwcsubrunhktvvy
supabase.cmd db query --linked --file supabase\create_score_categories.sql

# 6. deploy
git push origin main                # Vercel auto-deploys
```

## Appendix B — How the browser tests were run (no test framework)

There is **no automated test suite in the repo**. Verification was done with a throwaway
Node script driving **headless Chrome over the DevTools Protocol (CDP)**:

1. Launch Chrome headless with a remote debugging port:
   `chrome.exe --headless=new --remote-debugging-port=9223 --user-data-dir=<temp> about:blank`
2. In Node (22+ has a global `WebSocket`), fetch `http://127.0.0.1:9223/json` to get the
   page's `webSocketDebuggerUrl`, connect, and send `Runtime.evaluate` / `Page.navigate`
   / `Page.captureScreenshot` commands.
3. To set React-controlled inputs, use the native value setter + dispatch `input`/`change`
   events; dispatch a `KeyboardEvent('keydown', { key: 'Enter' })` to submit inline cells.

Those scripts lived in the old machine's temp folder
(`C:\Users\notsm\AppData\Local\Temp\opencode\*.mjs`) and do **not** travel with the repo.
They are easy to recreate from the pattern above if needed. Nothing in the repo depends on
them.
