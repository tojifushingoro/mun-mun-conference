import { Search, ArrowUpDown } from 'lucide-react'
import { formatGrade, gradeSort, normalizeGrade } from '../../lib/grades'
import { ROLES, isStaffRole } from '../../lib/utils'
import FilterDropdown from './FilterDropdown'

export const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A to Z)' },
  { value: 'name_desc', label: 'Name (Z to A)' },
  { value: 'grade_desc', label: 'Grade (Year 3 first)' },
  { value: 'grade_asc', label: 'Grade (Grade 4 first)' },
  { value: 'committee_asc', label: 'Committee (A to Z)' },
  { value: 'role_asc', label: 'Role (seniority)' },
  { value: 'country_asc', label: 'Country (A to Z)' },
  { value: 'score_desc', label: 'Total score (highest first)' },
  { value: 'score_asc', label: 'Total score (lowest first)' },
]

export default function RosterFilters({
  searchTerm,
  setSearchTerm,
  selectedCommittee,
  setSelectedCommittee,
  selectedGrades,
  setSelectedGrades,
  selectedRoles,
  setSelectedRoles,
  excludeStaff,
  setExcludeStaff,
  sortBy,
  setSortBy,
  committees,
  delegates,
}) {
  // Only offer grades and roles actually in use, in seniority order
  const gradeOptions = [...new Set(delegates.map((d) => normalizeGrade(d.grade)).filter(Boolean))]
    .sort((a, b) => gradeSort(b) - gradeSort(a))
    .map((value) => ({ value, label: formatGrade(value) }))

  const roleOptions = ROLES.filter((r) => delegates.some((d) => d.role === r)).map((role) => ({
    value: role,
    label: role,
  }))

  const staffCount = delegates.filter((d) => d.role && d.role !== 'Delegate').length

  // Staff are hidden by default, so filtering to a staff-only role (Chair, ACD,
  // Observer) would otherwise match nothing. Unhide them in that case so the
  // results are never an empty list the user can't easily explain.
  const handleRoleChange = (roles) => {
    setSelectedRoles(roles)
    if (roles.length > 0 && roles.every(isStaffRole)) setExcludeStaff(false)
  }

  return (
    <div className="card sticky top-2 z-20 mb-6 space-y-4 shadow-md backdrop-blur-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, country or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={selectedCommittee}
          onChange={(e) => setSelectedCommittee(e.target.value)}
          className="select-field"
        >
          <option value="">All Committees</option>
          {committees.map((committee) => (
            <option key={committee.id} value={committee.id}>
              {committee.name}
            </option>
          ))}
        </select>

        <FilterDropdown
          label="Grades"
          options={gradeOptions}
          selected={selectedGrades}
          onChange={setSelectedGrades}
          emptyText="No grades registered"
        />

        <FilterDropdown
          label="Roles"
          options={roleOptions}
          selected={selectedRoles}
          onChange={handleRoleChange}
          emptyText="No roles in use"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          <label htmlFor="sort-by" className="whitespace-nowrap text-sm font-medium text-slate-700">
            Sort by
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-field w-auto min-w-[200px]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={excludeStaff}
            onChange={(e) => setExcludeStaff(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Exclude staff
          <span className="font-normal text-slate-500">
            ({staffCount} staff {staffCount === 1 ? 'person' : 'people'})
          </span>
        </label>
      </div>
    </div>
  )
}