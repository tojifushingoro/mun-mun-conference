/**
 * Canonical grade levels for the conference.
 *
 * Listed top to bottom: Year 3 is the most senior, Grade 1 the least.
 * `sort` values are ascending, so Year 3 = 13 sits above Grade 1 = 1.
 *
 *  Year 1-3        senior secondary
 *  8/9/10 Matric  matric phase
 *  Pre-IGCSE       bridge year
 *  Grade 1-6       primary
 */

/** Senior to junior. Index order is also display order. */
export const GRADE_LEVELS = [
  { value: 'Year 3', label: 'Year 3', sort: 13 },
  { value: 'Year 2', label: 'Year 2', sort: 12 },
  { value: 'Year 1', label: 'Year 1', sort: 11 },
  { value: '10 Matric', label: '10 Matric', sort: 10 },
  { value: '9 Matric', label: '9 Matric', sort: 9 },
  { value: '8 Matric', label: '8 Matric', sort: 8 },
  { value: 'Pre-IGCSE', label: 'Pre-IGCSE', sort: 7 },
  { value: 'Grade 6', label: 'Grade 6', sort: 6 },
  { value: 'Grade 5', label: 'Grade 5', sort: 5 },
  { value: 'Grade 4', label: 'Grade 4', sort: 4 },
  { value: 'Grade 3', label: 'Grade 3', sort: 3 },
  { value: 'Grade 2', label: 'Grade 2', sort: 2 },
  { value: 'Grade 1', label: 'Grade 1', sort: 1 },
]

export const GRADE_VALUES = GRADE_LEVELS.map((g) => g.value)

const SORT_MAP = new Map(GRADE_LEVELS.map((g) => [g.value, g.sort]))

/**
 * Legacy values that predate the current list, mapped to their current label.
 * Keeps older delegate records displaying and filtering correctly even before
 * supabase/migrate_grades.sql has been run.
 */
const LEGACY_ALIASES = new Map([
  ['grade 1', 'Grade 1'],
  ['grade 2', 'Grade 2'],
  ['grade 3', 'Grade 3'],
  ['grade 4', 'Grade 4'],
  ['grade 5', 'Grade 5'],
  ['grade 6', 'Grade 6'],
  // Grade 7 was replaced by Pre-IGCSE
  ['grade 7', 'Pre-IGCSE'],
  ['7', 'Pre-IGCSE'],
  ['pre igcse', 'Pre-IGCSE'],
  ['preigcse', 'Pre-IGCSE'],
  ['pre-igcse', 'Pre-IGCSE'],
  ['grade 8', '8 Matric'],
  ['grade 9', '9 Matric'],
  ['grade 10', '10 Matric'],
  ['8', '8 Matric'],
  ['9', '9 Matric'],
  ['10', '10 Matric'],
  ['grade 11', 'Year 1'],
  ['grade 12', 'Year 2'],
  ['11', 'Year 1'],
  ['12', 'Year 2'],
  ['13', 'Year 3'],
])

/** Resolve any stored or typed variant of a grade to its canonical label. */
export function normalizeGrade(grade) {
  if (!grade) return ''
  const raw = grade.toString().trim()
  if (!raw) return ''

  const exact = GRADE_VALUES.find((v) => v.toLowerCase() === raw.toLowerCase())
  if (exact) return exact

  return LEGACY_ALIASES.get(raw.toLowerCase()) || raw
}

/** Sort key for a grade. Unrecognised values sort last. */
export function gradeSort(grade) {
  const canonical = normalizeGrade(grade)
  if (SORT_MAP.has(canonical)) return SORT_MAP.get(canonical)

  const num = parseInt(canonical.replace(/\D/g, ''), 10)
  return Number.isNaN(num) ? 999 : num
}

/** Display label for a grade value. */
export function formatGrade(grade) {
  if (!grade) return 'N/A'
  return normalizeGrade(grade)
}