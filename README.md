# MUN Conference Manager

A lightweight single-page web app for running an in-school Model United Nations conference (Grade 3+). Multiple Committee Chairs (Dias) can work at the same time on different laptops — every change syncs instantly through Supabase Realtime.

## Stack

- Vite + React 18
- Tailwind CSS
- `@supabase/supabase-js`

## Features

1. **Configuration & Management Dashboard (Admin)** — add/edit/delete committees, register delegates (Name, Grade, Committee, Country, Role, Notes).
2. **Main Roster & Delegate Profile Popup (Dias)** — searchable, filterable grid by Committee/Grade; clicking a delegate opens a modal with profile, total score, per-category score breakdown and notes.
3. **Spreadsheet-Style Live Scoreboard (Turn Tracker)** — tabbed by committee, columns for Country / Delegate / dynamic scoring categories, automatic Total Score, ranked rows. Log a turn via the Turn Logger, or click any category cell to add points inline.
4. **Real-time DB integration** — `.on('postgres_changes', ...)` on the `scores` and `delegates` tables for INSERT, UPDATE and DELETE. Local state updates immediately on every browser.

## Setup

### 1. Install

```bash
cd mun-mun-conference
npm install
```

### 2. Create the database

In your Supabase project → **SQL Editor**, run `supabase/schema.sql` (it creates the three tables, RLS policies, realtime publication entries and `updated_at` triggers).

### 3. Add your keys

Open `src/config/supabase.js` and paste your values at the top:

```js
const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_URL_HERE'
const SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE'
```

Find them in Supabase → **Project Settings → API**.

### 4. Run

```bash
npm run dev      # development
npm run build    # production build
npm run preview  # preview production build
```

## Realtime checklist

- Tables must be in the `supabase_realtime` publication (handled by `schema.sql`).
- Realtime must be enabled for the tables in Supabase → **Database → Replication**.
- Only the `id` column needs to be in the replica identity for DELETE events; the schema sets `REPLICA IDENTITY FULL`.

## Notes

- Policies in `schema.sql` allow anonymous full access — convenient for a trusted in-school conference on a shared network. For anything beyond that, add Supabase Auth and tighten the policies.
- Grades are free text so you can use `3`, `Grade 9`, or `9th` as you like; the UI normalises them for display.