/**
 * Small "dev" badge for flagged delegates.
 *
 * To flag someone, add their name to DEV_TAGGED_NAMES below.
 * Matching is case-insensitive and ignores extra whitespace.
 */

/** Names that should render a "dev" tag wherever they appear. */
export const DEV_TAGGED_NAMES = ['Sheikh Ayan']

const NORMALISED = new Set(DEV_TAGGED_NAMES.map((n) => n.trim().toLowerCase()))

export function isDevTagged(name) {
  return NORMALISED.has((name || '').trim().toLowerCase())
}

export default function DevTag({ name, className = '' }) {
  if (!isDevTagged(name)) return null

  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-inset ring-amber-300 ${className}`}
    >
      dev
    </span>
  )
}