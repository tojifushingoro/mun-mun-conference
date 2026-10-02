/**
 * Canonical grade levels for the conference.
 * Order matters: it drives sorting everywhere (roster, filters, scoreboard).
 *
 *  - Grades 3-7   : unchanged
 *  - Grades 8-10  : renamed to "8 Matric" / "9 Matric" / "10 Matric"
 *  - Grades 11-12 : replaced by the new Year 1 / Year 2 / Year 3 levels
 */
export const GRADE_LEVELS = [
  { value: 'Grade 3', label: 'Grade 3', sort: 3 },
  { value: 'Grade 4', label: 'Grade 4', sort: 4 },
  { value: 'Grade 5', label: 'Grade 5', sort: 5 },
  { value: 'Grade 6', label: 'Grade 6', sort: 6 },
  { value: 'Grade 7', label: 'Grade 7', sort: 7 },
  { value: '8 Matric', label: '8 Matric', sort: 8 },
  { value: '9 Matric', label: '9 Matric', sort: 9 },
  { value: '10 Matric', label: '10 Matric', sort: 10 },
  { value: 'Year 1', label: 'Year 1', sort: 11 },
  { value: 'Year 2', label: 'Year 2', sort: 12 },
  { value: 'Year 3', label: 'Year 3', sort: 13 },
]

export const GRADE_VALUES = GRADE_LEVELS.map((g) => g.value)

const SORT_MAP = new Map(GRADE_LEVELS.map((g) => [g.value, g.sort]))

/** Legacy values that predate the rename, mapped to their new label. */
const LEGACY_ALIASES = new Map([
  ['3', 'Grade 3'],
  ['4', 'Grade 4'],
  ['5', 'Grade 5'],
  ['6', 'Grade 6'],
  ['7', 'Grade 7'],
  ['grade 3', 'Grade 3'],
  ['grade 4', 'Grade 4'],
  ['grade 5', 'Grade 5'],
  ['grade 6', 'Grade 6'],
  ['grade 7', 'Grade 7'],
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

/** Resolve any stored/typed variant of a grade to its canonical label. */
export function normalizeGrade(grade) {
  if (!grade) return ''
  const raw = grade.toString().trim()
  if (!raw) return ''

  const exact = GRADE_VALUES.find((v) => v.toLowerCase() === raw.toLowerCase())
  if (exact) return exact

  return LEGACY_ALIASES.get(raw.toLowerCase()) || raw
}

/** Sort key for a grade, so Year 1/2/3 order after the Matric levels. */
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