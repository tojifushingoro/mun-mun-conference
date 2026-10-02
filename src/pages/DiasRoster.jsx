import { useState, useCallback } from 'react'
import { Users, Grid } from 'lucide-react'
import RosterFilters from '../components/Roster/RosterFilters'
import DelegateCard from '../components/Roster/DelegateCard'
import DelegateModal from '../components/Roster/DelegateModal'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { useCommittees } from '../hooks/useCommittees'
import { useDelegates } from '../hooks/useDelegates'
import { useScores } from '../hooks/useScores'
import { useRealtimeSubscriptions } from '../hooks/useRealtimeScores'
import { normalizeGrade } from '../lib/grades'

export default function DiasRoster() {
  const { committees, loading: committeesLoading } = useCommittees()
  const { delegates, loading: delegatesLoading, setDelegates, refetch: refetchDelegates } = useDelegates()
  const { scores, loading: scoresLoading, setScores, deleteScore } = useScores()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommittee, setSelectedCommittee] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
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

  const filteredDelegates = delegates.filter((delegate) => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !q ||
      delegate.name?.toLowerCase().includes(q) ||
      delegate.country?.toLowerCase().includes(q) ||
      delegate.role?.toLowerCase().includes(q)

    const matchesCommittee = !selectedCommittee || delegate.committee_id === selectedCommittee
    const matchesGrade = !selectedGrade || normalizeGrade(delegate.grade) === selectedGrade

    return matchesSearch && matchesCommittee && matchesGrade
  })

  const getDelegateTotalScore = (delegateId) =>
    scores.filter((s) => s.delegate_id === delegateId).reduce((sum, s) => sum + (Number(s.points) || 0), 0)

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
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
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
        <div className="py-12 text-center text-slate-500">No delegates match your search criteria.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDelegates.map((delegate) => (
            <DelegateCard
              key={delegate.id}
              delegate={delegate}
              onClick={() => setSelectedDelegate(delegate)}
              totalScore={getDelegateTotalScore(delegate.id)}
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