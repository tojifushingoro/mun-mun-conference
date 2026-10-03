/**
 * Canonical grade levels for the conference.
 *
 * Listed senior to junior. Year 3 is the most senior, Grade 4 the least.
 * Grades 3, 2 and 1 are not supported.
 *
 * The `sort` value is the grade number, so ordering is self-evident:
 * Year 3 = 13, Grade 7 = 7, Grade 4 = 4.
 *
 * Year 3-1           senior secondary
 * 8/9/10 Matric      matric phase
 * Grade 7            top of primary (Pre-IGCSE and Pre-Matric both land here)
 * Grade 6-4          lower primary
 */

/** Senior to junior. Index order is also display order. */
export const GRADE_LEVELS = [
  { value: 'Year 3', label: 'Year 3', sort: 13 },
  { value: 'Year 2', label: 'Year 2', sort: 12 },
  { value: 'Year 1', label: 'Year 1', sort: 11 },
  { value: '10 Matric', label: '10 Matric', sort: 10 },
  { value: '9 Matric', label: '9 Matric', sort: 9 },
  { value: '8 Matric', label: '8 Matric', sort: 8 },
  { value: 'Grade 7', label: 'Grade 7', sort: 7 },
  { value: 'Grade 6', label: 'Grade 6', sort: 6 },
  { value: 'Grade 5', label: 'Grade 5', sort: 5 },
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

  // Accept the variants that turn up in spreadsheets and on paper forms.
  const LEGACY_ALIASES = new Map([
    // Primary ladder. Grades 3, 2 and 1 are unsupported and drop through.
    ['grade 7', 'Grade 7'],
    ['grade 6', 'Grade 6'],
    ['grade 5', 'Grade 5'],
    ['grade 4', 'Grade 4'],
    ['grade 3', null],
    ['grade 2', null],
    ['grade 1', null],
    ['7', 'Grade 7'],
    ['6', 'Grade 6'],
    ['5', 'Grade 5'],
    ['4', 'Grade 4'],
    ['3', null],
    ['2', null],
    ['1', null],
    // Pre-Matric and Pre-IGCSE are the same tier as Grade 7
    ['pre-igcse', 'Grade 7'],
    ['pre-matric', 'Grade 7'],
    ['pre igcse', 'Grade 7'],
    ['pre matric', 'Grade 7'],
    // Matric, written with or without the "Grade" prefix and M suffix
    ['grade 10', '10 Matric'],
    ['grade 9', '9 Matric'],
    ['grade 8', '8 Matric'],
    ['grade 10m', '10 Matric'],
    ['grade 9m', '9 Matric'],
    ['grade 8m', '8 Matric'],
    ['10m', '10 Matric'],
    ['9m', '9 Matric'],
    ['8m', '8 Matric'],
    ['10', '10 Matric'],
    ['9', '9 Matric'],
    ['8', '8 Matric'],
    // Senior secondary, written both ways
    ['igcse year 1', 'Year 1'],
    ['igcse year 2', 'Year 2'],
    ['igcse year 3', 'Year 3'],
    ['13', 'Year 3'],
    ['12', 'Year 2'],
    ['11', 'Year 1'],
  ])

  return LEGACY_ALIASES.get(raw.toLowerCase()) || raw
}

/**
 * Sorts below every known grade. Anything not in GRADE_LEVELS parks here
 * instead of having digits scraped out of its label — scraping sent
 * "IGCSE Year 1" below "Grade 4" and "Pre-Matric" above "Year 3".
 */
const UNKNOWN_SORT = 10_000

/** Sort key for a grade. Unrecognised values sort last. */
export function gradeSort(grade) {
  const canonical = normalizeGrade(grade)
  if (!canonical) return UNKNOWN_SORT
  if (SORT_MAP.has(canonical)) return SORT_MAP.get(canonical)
  return UNKNOWN_SORT
}

/** Display label for a grade value. */
export function formatGrade(grade) {
  if (!grade) return 'N/A'
  return normalizeGrade(grade)
}