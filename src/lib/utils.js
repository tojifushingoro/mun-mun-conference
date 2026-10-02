import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export { GRADE_LEVELS, GRADE_VALUES, normalizeGrade, gradeSort } from './grades'
export { formatGrade } from './grades'