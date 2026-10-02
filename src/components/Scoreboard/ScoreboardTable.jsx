import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { formatGrade } from '../../lib/utils'
import DevTag from '../Common/DevTag'
import { playScoreAdded, playError } from '../../lib/sfx'

export default function ScoreboardTable({ delegates, scores, onAddScore }) {
  const [editing, setEditing] = useState(null) // { delegateId, category }
  const [draft, setDraft] = useState('')

  const getCategoryTotal = (delegateId, category) =>
    scores
      .filter((s) => s.delegate_id === delegateId && s.category === category)
      .reduce((sum, s) => sum + (Number(s.points) || 0), 0)

  const getTotal = (delegateId) =>
    scores.filter((s) => s.delegate_id === delegateId).reduce((sum, s) => sum + (Number(s.points) || 0), 0)

  const delegateIds = new Set(delegates.map((d) => d.id))
  const categories = [
    ...new Set(scores.filter((s) => delegateIds.has(s.delegate_id)).map((s) => s.category).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b))

  const startEdit = (delegateId, category) => {
    setEditing({ delegateId, category })
    setDraft('')
  }

  const cancelEdit = () => setEditing(null)

  const saveEdit = async () => {
    if (!editing) return
    const value = Number(draft)
    if (draft !== '' && !Number.isNaN(value)) {
      const ok = await onAddScore({
        delegate_id: editing.delegateId,
        category: editing.category,
        points: value,
      })
      if (ok) playScoreAdded()
      else playError()
    }
    setEditing(null)
  }

  const sorted = [...delegates].sort((a, b) => getTotal(b.id) - getTotal(a.id))

  // Give the podium a little visual weight so chairs can spot leaders fast
  const rankStyles = {
    0: 'bg-amber-100 text-amber-800 ring-amber-300',
    1: 'bg-slate-200 text-slate-700 ring-slate-300',
    2: 'bg-orange-100 text-orange-800 ring-orange-300',
  }

  if (delegates.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        No delegates to score in this committee.
        <span className="mt-1 block text-xs text-slate-400">
          Chairs and other staff roles are excluded from the scoreboard.
        </span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="sticky left-0 z-10 w-12 bg-slate-50 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
              #
            </th>
            <th className="sticky left-12 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Country
            </th>
            <th className="sticky left-52 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Delegate
            </th>
            {categories.map((category) => (
              <th
                key={category}
                className="whitespace-nowrap px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                {category}
              </th>
            ))}
            <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-blue-600">
              Total Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {sorted.map((delegate, rank) => {
            const total = getTotal(delegate.id)
            return (
              <tr key={delegate.id} className="hover:bg-slate-50 transition-colors">
                <td className="sticky left-0 z-10 bg-white px-3 py-3 text-center text-xs font-semibold text-slate-500">
                  {rank < 3 ? (
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ${rankStyles[rank]}`}
                    >
                      {rank + 1}
                    </span>
                  ) : (
                    <span className="text-slate-400">{rank + 1}</span>
                  )}
                </td>
                <td className="sticky left-12 z-10 whitespace-nowrap bg-white px-4 py-3 text-sm font-medium text-slate-900">
                  {delegate.country || <span className="text-slate-400">—</span>}
                </td>
                <td className="sticky left-52 z-10 whitespace-nowrap bg-white px-4 py-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-medium text-slate-900">{delegate.name}</span>
                    <DevTag name={delegate.name} />
                  </span>
                  <span className="ml-2 text-xs text-slate-400">{formatGrade(delegate.grade)}</span>
                </td>

                {categories.map((category) => {
                  const isEditing = editing?.delegateId === delegate.id && editing?.category === category
                  const value = getCategoryTotal(delegate.id, category)
                  return (
                    <td key={category} className="px-2 py-1 text-center text-sm">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            autoFocus
                            type="number"
                            step="0.01"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            className="w-20 rounded border border-blue-400 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="+pts"
                          />
                          <button onClick={saveEdit} className="text-green-600 hover:text-green-800" title="Save">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600" title="Cancel">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(delegate.id, category)}
                          className={`w-full rounded px-2 py-1 transition-colors hover:bg-blue-50 ${
                            value !== 0 ? 'text-slate-700' : 'text-slate-300'
                          }`}
                          title="Click to add points"
                        >
                          {value !== 0 ? value.toFixed(2) : '–'}
                        </button>
                      )}
                    </td>
                  )
                })}

                <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-bold text-blue-700">
                  {total.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
        Click any category cell to quickly add points. Rows are ranked by total score.
      </p>
    </div>
  )
}