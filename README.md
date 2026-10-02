# MUN Conference Manager

A lightweight single-page web app for running an in-school Model United Nations conference. It gives conference staff a shared dashboard for managing committees and delegates, viewing the roster, and tracking delegate scores across multiple Dias laptops.

**Live app:** https://mundashboarddias.vercel.app/

## Features

### Admin Dashboard
- Create, edit, and delete committees.
- Register, edit, and remove delegates.
- Delegate fields include:
  - Name
  - Grade
  - Committee
  - Country
  - Role
  - Notes
- Country is required for normal delegates but optional for staff roles.
- Displays total committee and delegate counts.
- Automatically normalises legacy grade values into the current grade system.

### Dias Roster
- Search delegates by name, country, or role.
- Filter by committee and grade.
- Responsive grid of delegate cards.
- Open a delegate profile modal showing:
  - Committee information
  - Country and grade
  - Role and notes
  - Score history
  - Total score
- Scores can be removed from the delegate profile.

### Live Scoreboard
- Switch between committees using committee tabs.
- Spreadsheet-style scoreboard.
- Delegates are ranked by total score.
- Score categories are generated from recorded scores.
- Click a category cell to add points directly.
- Log scores through the Turn Logger.
- Includes default categories such as Speech, Caucus, Diplomacy, Resolution, Amendment, POI, Opening Speech, Closing Speech, Moderated Caucus, and Unmoderated Caucus.
- Supports custom scoring categories.
- Supports decimal and negative point values.
- Includes a chronological Turn Log.
- Scores can be removed with confirmation.

### Real-time collaboration
Supabase Realtime is used for live changes to the `delegates` and `scores` tables. Open dashboards receive delegate and score INSERT, UPDATE, and DELETE events and update their local state accordingly.

Committee data is fetched from Supabase when dashboards load. Committee changes are not subscribed to through the dedicated Realtime hook, so a manual reload may be required for another already-open dashboard to see a committee-only change.

### Developer tag
A small `dev` badge can be displayed beside specifically flagged delegate names throughout the Admin, Roster, Scoreboard, and Turn Logger interfaces.

The current tagged-name list is maintained in:

`src/components/Common/DevTag.jsx`

## Tech stack

- Vite
- React 18
- Tailwind CSS
- Supabase JavaScript client
- Supabase PostgreSQL
- Supabase Realtime
- Lucide React
- React Hot Toast

## Project structure

```text
src/
├── components/
│   ├── Admin/
│   ├── Common/
│   ├── Roster/
│   └── Scoreboard/
├── hooks/
│   ├── useCommittees.js
│   ├── useDelegates.js
│   ├── useRealtimeScores.js
│   └── useScores.js
├── lib/
│   ├── grades.js
│   └── utils.js
├── pages/
│   ├── AdminDashboard.jsx
│   ├── DiasRoster.jsx
│   └── LiveScoreboard.jsx
├── config/
│   └── supabase.js
└── App.jsx

supabase/
└── schema.sql
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create the Supabase database

Create a Supabase project, then open its SQL Editor and run:

```text
supabase/schema.sql
```

The schema creates:

- `committees`
- `delegates`
- `scores`
- `score_totals` view
- Required indexes
- `updated_at` triggers
- Realtime configuration for delegates and scores
- Row Level Security policies

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then set:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The application reads these values from `import.meta.env`. Supabase credentials should **not** be hard-coded into `src/config/supabase.js`.

For local development, restart the Vite server after changing `.env.local`.

### 4. Run the app

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Database and security

The current database policies allow anonymous full access to the three application tables. This is intended for a trusted in-school conference environment where staff are operating the dashboard on a controlled network.

**This setup should not be treated as production-grade authentication or authorization.**

If the dashboard is exposed beyond a trusted conference environment, add Supabase Auth and replace the open policies with role-based Row Level Security policies.

The Supabase anon/public key is designed to be used by a browser application, but database permissions must still be restricted with appropriate RLS policies.

## Grade system

The application uses these canonical grade levels:

- Grade 3
- Grade 4
- Grade 5
- Grade 6
- Grade 7
- 8 Matric
- 9 Matric
- 10 Matric
- Year 1
- Year 2
- Year 3

Legacy values such as `8`, `Grade 8`, `11`, and `Grade 11` are normalised to the current labels.

## Scoring

Scores are stored as individual records rather than overwriting a delegate's total.

Each score contains:

- Delegate
- Category
- Points
- Optional note
- Creation/update timestamps

Totals are calculated from the stored score records. This makes it possible to maintain a turn-by-turn score log and remove individual mistakes.

## Current limitations

- There is currently no authentication or staff account system.
- Database policies intentionally allow anonymous full access.
- Committee changes do not have a dedicated Realtime subscription.
- The scoreboard only displays scoring categories that have at least one recorded score in the active committee.
- There is no automated test suite currently documented in the project.
- The `dev` badge is intentionally name-based and is controlled in source code.

## Repository

GitHub: https://github.com/tojifushingoro/mun-mun-conference

The README is kept focused on project usage and setup so the repository remains easy to understand and maintain. GitHub recommends using a README to explain what a project does, how to get started, and where to find help.