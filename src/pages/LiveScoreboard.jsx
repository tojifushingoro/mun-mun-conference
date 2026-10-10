import { useState, useEffect, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import CommitteeTab from '../components/Scoreboard/CommitteeTab'
import ScoreboardTable from '../components/Scoreboard/ScoreboardTable'
import ScoreLog from '../components/Scoreboard/ScoreLog'
import CategoryManager from '../components/Scoreboard/CategoryManager'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { useCommittees } from '../hooks/useCommittees'
import { useDelegates } from '../hooks/useDelegates'
import { useScores } from '../hooks/useScores'
import { useScoreCategories } from '../hooks/useScoreCategories'
import { useRealtimeSubscriptions } from '../hooks/useRealtimeScores'
import { isStaffRole } from '../lib/utils'

export default function LiveScoreboard() {
  const { committees, loading: committeesLoading } = useCommittees()
  const { delegates, loading: delegatesLoading, setDelegates, refetch: refetchDelegates } = useDelegates()
  const { scores, loading: scoresLoading, addScore, setScores, deleteScore } = useScores()
  const { categories, loading: categoriesLoading, addCategory, updateCategory, deleteCategory } = useScoreCategories()

  const [activeCommittee, setActiveCommittee] = useState('')

  useEffect(() => {
    if (committees.length > 0 && !committees.some((c) => c.id === activeCommittee)) {
      setActiveCommittee(committees[0].id)
    }
  }, [committees, activeCommittee])

  const handleDelegateChange = useCallback(
    (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      if (eventType === 'INSERT') {
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

  // Everyone registered to the selected committee - used to resolve names
  const committeeDelegates = delegates.filter((d) => d.committee_id === activeCommittee)

  // Staff Dias (Chair, ACD, Observer) run the
  // committee rather than represent a nation, so they get no scoreboard row.
  const scoredDelegates = committeeDelegates.filter((d) => !isStaffRole(d.role))

  // Only show turns belonging to the active committee, scoped by delegate id
  // (works whether delegate ids are bigint or uuid)
  const committeeDelegateIds = new Set(scoredDelegates.map((d) => String(d.id)))
  const committeeScores = scores.filter((s) => committeeDelegateIds.has(String(s.delegate_id)))
  const activeName = committees.find((c) => c.id === activeCommittee)?.name
  const committeeCategories = categories.filter((c) => String(c.committee_id) === String(activeCommittee))
  const loading = committeesLoading || delegatesLoading || scoresLoading || categoriesLoading

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Scoreboard</h1>
            <p className="text-slate-600">Turn Tracker — tabbed by committee with automatic totals</p>
          </div>
        </div>
      </div>

      <CategoryManager
        committeeId={activeCommittee}
        committeeName={activeName}
        categories={committeeCategories}
        loading={categoriesLoading}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />

      <CommitteeTab
        committees={committees}
        activeCommittee={activeCommittee}
        onCommitteeChange={setActiveCommittee}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : committees.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          No committees created yet. Add committees in the Admin Dashboard first.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">{activeName}</h2>
            <ScoreboardTable
              delegates={scoredDelegates}
              scores={committeeScores}
              categories={committeeCategories}
              onAddScore={addScore}
            />
          </div>
          <ScoreLog
            scores={committeeScores}
            delegates={scoredDelegates}
            onDeleteScore={deleteScore}
            committeeName={activeName}
          />
        </div>
      )}
    </div>
  )
}