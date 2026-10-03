/**
 * Canonical grade levels for the conference.
 *
 * Listed top to bottom: Year 3 is the most senior, Grade 4 the least.
 * The list stops at Grade 4 — no Grade 3, 2, or 1.
 *
 * `sort` values are ascending, so Year 3 = 13 sits above Grade 4 = 4.
 *
 * Year 3-1           senior secondary
 * 8/9/10 Matric      matric phase
 * Pre-IGCSE          bridge year
 * Grade 4-1          primary  (Grade 4 only is supported; 3,2,1 omitted)
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
  { value: 'Grade 4', label: 'Grade 4', sort: 4 },
]

export const GRADE_VALUES = GRADE_LEVELS.map((g) => g.value)

const SORT_MAP = new Map(GRADE_LEVELS.map((g) => [g.value, g.sort]))

/**
 * Resolve any stored or typed variant of a grade to its canonical label.
 */
export function normalizeGrade(grade) {
  if (!grade) return ''
  const raw = grade.toString().trim()
  if (!raw) return ''

  const exact = GRADE_VALUES.find((v) => v.toLowerCase() === raw.toLowerCase())
  if (exact) return exact

  // accept legacy abbreviations only down to Grade 4
  const LEGACY_ALIASES = new Map([
    ['grade 4', 'Grade 4'],
    ['grade 3', null],
    ['grade 2', null],
    ['grade 1', null],
    ['4', 'Grade 4'],
    ['3', null],
    ['2', null],
    ['1', null],
    ['grade 8', '8 Matric'],
    ['grade 9', '9 Matric'],
    ['grade 10', '10 Matric'],
    ['8', '8 Matric'],
    ['9', '9 Matric'],
    ['10', '10 Matric'],
    ['13', 'Year 3'],
    ['12', 'Year 2'],
    ['11', 'Year 1'],
  ])

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