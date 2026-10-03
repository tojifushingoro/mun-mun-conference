import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Roles a delegate can be registered as, in seniority order. */
export const ROLES = ['Chair', 'Vice Chair', 'Delegate', 'Observer']

/**
 * Staff roles (chairs, rapporteurs, observers) represent the conference itself
 * rather than a nation, so they don't need a country.
 */
export function isStaffRole(role) {
  return (role || 'Delegate').trim().toLowerCase() !== 'delegate'
}

export { GRADE_LEVELS, GRADE_VALUES, normalizeGrade, gradeSort } from './grades'
export { formatGrade } from './grades'