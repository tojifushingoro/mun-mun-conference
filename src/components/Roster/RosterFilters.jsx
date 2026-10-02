import { Search } from 'lucide-react'
import { formatGrade, normalizeGrade, gradeSort } from '../../lib/utils'

export default function RosterFilters({
  searchTerm,
  setSearchTerm,
  selectedCommittee,
  setSelectedCommittee,
  selectedGrade,
  setSelectedGrade,
  committees,
  delegates,
}) {
  const uniqueGrades = [...new Set(delegates.map((d) => normalizeGrade(d.grade)).filter(Boolean))].sort(
    (a, b) => gradeSort(a) - gradeSort(b),
  )

  return (
    <div className="card mb-6">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
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
      </div>
    </div>
  )
}