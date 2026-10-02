import { Search, ArrowUpDown } from 'lucide-react'
import { formatGrade, gradeSort } from '../../lib/grades'
import { ROLES } from '../../lib/utils'

export const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A to Z)' },
  { value: 'name_desc', label: 'Name (Z to A)' },
  { value: 'grade_asc', label: 'Grade (youngest first)' },
  { value: 'grade_desc', label: 'Grade (oldest first)' },
  { value: 'committee_asc', label: 'Committee (A to Z)' },
  { value: 'country_asc', label: 'Country (A to Z)' },
  { value: 'score_desc', label: 'Total score (highest first)' },
  { value: 'score_asc', label: 'Total score (lowest first)' },
]

export default function RosterFilters({
  searchTerm,
  setSearchTerm,
  selectedCommittee,
  setSelectedCommittee,
  selectedGrade,
  setSelectedGrade,
  selectedRole,
  setSelectedRole,
  excludeStaff,
  setExcludeStaff,
  sortBy,
  setSortBy,
  committees,
  delegates,
}) {
  const uniqueGrades = [...new Set(delegates.map((d) => d.grade).filter(Boolean))].sort(
    (a, b) => gradeSort(a) - gradeSort(b),
  )

  // Picking a staff role while staff are hidden would show nothing at all,
  // so reveal them automatically to keep the filter honest
  const handleRoleChange = (role) => {
    setSelectedRole(role)
    if (role && role !== 'Delegate') setExcludeStaff(false)
  }

  // Only offer roles that are actually in use, so the dropdown isn't padding
  const rolesInUse = ROLES.filter((r) => delegates.some((d) => d.role === r))
  const staffCount = delegates.filter((d) => d.role && d.role !== 'Delegate').length

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

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="select-field"
        >
          <option value="">All Grades</option>
          {uniqueGrades.map((grade) => (
            <option key={grade} value={grade}>
              {formatGrade(grade)}
            </option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="select-field"
        >
          <option value="">All Roles</option>
          {rolesInUse.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
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