import { useState, useCallback, useMemo } from 'react'
import { Users, Grid } from 'lucide-react'
import RosterFilters from '../components/Roster/RosterFilters'
import DelegateCard from '../components/Roster/DelegateCard'
import DelegateModal from '../components/Roster/DelegateModal'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { useCommittees } from '../hooks/useCommittees'
import { useDelegates } from '../hooks/useDelegates'
import { useScores } from '../hooks/useScores'
import { useRealtimeSubscriptions } from '../hooks/useRealtimeScores'
import { normalizeGrade, gradeSort } from '../lib/grades'
import { isStaffRole } from '../lib/utils'

export default function DiasRoster() {
  const { committees, loading: committeesLoading } = useCommittees()
  const { delegates, loading: delegatesLoading, setDelegates, refetch: refetchDelegates } = useDelegates()
  const { scores, loading: scoresLoading, setScores, deleteScore } = useScores()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommittee, setSelectedCommittee] = useState('')
  const [selectedGrades, setSelectedGrades] = useState([])
  const [selectedRoles, setSelectedRoles] = useState([])
  const [excludeStaff, setExcludeStaff] = useState(true)
  const [sortBy, setSortBy] = useState('name_asc')
  const [selectedDelegate, setSelectedDelegate] = useState(null)

  const handleDelegateChange = useCallback(
    (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      if (eventType === 'INSERT') {
        // Realtime rows carry no embedded committee, so refetch to get the join
        refetchDelegates()
      } else if (eventType === 'UPDATE') {
        setDelegates((prev) => prev.map((d) => (d.id === newRecord.id ? { ...d, ...newRecord } : d)))
      } else if (eventType === 'DELETE') {
        setDelegates((prev) => prev.filter((d) => d.id !== oldRecord.id))
      }
    },
    [setDelegates, refetchDelegates],
  )

  const handleScoreChange = useCallback(
    (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      if (eventType === 'INSERT') {
        setScores((prev) => [...prev, newRecord])
      } else if (eventType === 'UPDATE') {
        setScores((prev) => prev.map((s) => (s.id === newRecord.id ? { ...s, ...newRecord } : s)))
      } else if (eventType === 'DELETE') {
        setScores((prev) => prev.filter((s) => s.id !== oldRecord.id))
      }
    },
    [setScores],
  )

  useRealtimeSubscriptions({ onDelegateChange: handleDelegateChange, onScoreChange: handleScoreChange })

  // Total points per delegate, computed once. Keyed as a string because
  // delegate ids can arrive as bigint or uuid depending on the query.
  const scoreTotals = useMemo(() => {
    const totals = new Map()
    for (const s of scores) {
      const key = String(s.delegate_id)
      totals.set(key, (totals.get(key) || 0) + (Number(s.points) || 0))
    }
    return totals
  }, [scores])

  const filteredDelegates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    const result = delegates.filter((delegate) => {
      const matchesSearch =
        !q ||
        delegate.name?.toLowerCase().includes(q) ||
        delegate.country?.toLowerCase().includes(q) ||
        delegate.role?.toLowerCase().includes(q)

      const matchesCommittee = !selectedCommittee || delegate.committee_id === selectedCommittee
      const matchesGrade =
        selectedGrades.length === 0 || selectedGrades.includes(normalizeGrade(delegate.grade))
      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(delegate.role)
      const matchesStaff = !excludeStaff || !isStaffRole(delegate.role)

      return matchesSearch && matchesCommittee && matchesGrade && matchesRole && matchesStaff
    })

    // sortBy is a "<field>_<direction>" value, e.g. "grade_desc"
    const [field, direction] = sortBy.split('_')
    const factor = direction === 'desc' ? -1 : 1
    const byText = (getter) => (a, b) => factor * getter(a).localeCompare(getter(b))
    const byNumber = (getter) => (a, b) => factor * (getter(a) - getter(b))

    const comparators = {
      name: byText((d) => d.name || ''),
      country: byText((d) => d.country || ''),
      committee: byText((d) => d.committees?.name || ''),
      role: byText((d) => d.role || ''),
      grade: byNumber((d) => gradeSort(d.grade)),
      score: byNumber((d) => scoreTotals.get(String(d.id)) ?? 0),
    }

    return [...result].sort(comparators[field] ?? comparators.name)
  }, [
    delegates,
    scoreTotals,
    searchTerm,
    selectedCommittee,
    selectedGrades,
    selectedRoles,
    excludeStaff,
    sortBy,
  ])

  const loading = committeesLoading || delegatesLoading || scoresLoading

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Main Roster</h1>
            <p className="text-slate-600">Dias view — click a delegate to open their profile</p>
          </div>
        </div>
      </div>

      <RosterFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCommittee={selectedCommittee}
        setSelectedCommittee={setSelectedCommittee}
        selectedGrades={selectedGrades}
        setSelectedGrades={setSelectedGrades}
        selectedRoles={selectedRoles}
        setSelectedRoles={setSelectedRoles}
        excludeStaff={excludeStaff}
        setExcludeStaff={setExcludeStaff}
        sortBy={sortBy}
        setSortBy={setSortBy}
        committees={committees}
        delegates={delegates}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {filteredDelegates.length} of {delegates.length} delegates
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Grid className="h-4 w-4" />
          Grid View
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDelegates.length === 0 ? (
        <div className="card py-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-700">No delegates match these filters</p>
          <p className="mt-1 text-sm text-slate-500">
            {delegates.length === 0
              ? 'Register delegates in the Admin tab to get started.'
              : 'Try clearing the search or filters above.'}
          </p>
          {delegates.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCommittee('')
                setSelectedGrades([])
                setSelectedRoles([])
                setExcludeStaff(true)
              }}
              className="btn-secondary mt-4"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDelegates.map((delegate, index) => (
            <DelegateCard
              key={delegate.id}
              index={index}
              delegate={delegate}
              onClick={() => setSelectedDelegate(delegate)}
              totalScore={scoreTotals.get(String(delegate.id)) ?? 0}
            />
          ))}
        </div>
      )}

      <DelegateModal
        delegate={selectedDelegate}
        scores={selectedDelegate ? scores.filter((s) => s.delegate_id === selectedDelegate.id) : []}
        isOpen={!!selectedDelegate}
        onClose={() => setSelectedDelegate(null)}
        onDeleteScore={deleteScore}
      />
    </div>
  )
}