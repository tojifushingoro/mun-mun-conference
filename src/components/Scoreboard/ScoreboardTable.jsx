import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { formatGrade } from '../../lib/utils'
import DevTag from '../Common/DevTag'
import { playScoreAdded, playError } from '../../lib/sfx'
import { categoryTotal, remainingPoints } from '../../lib/categories'
import toast from 'react-hot-toast'

export default function ScoreboardTable({ delegates, scores, categories = [], onAddScore }) {
  const [editing, setEditing] = useState(null) // { delegateId, category }
  const [draft, setDraft] = useState('')

  const capByName = new Map(categories.map((c) => [c.name, Number(c.max_points)]))

  const getTotal = (delegateId) =>
    scores.filter((s) => s.delegate_id === delegateId).reduce((sum, s) => sum + (Number(s.points) || 0), 0)

  // One column per declared category, plus any category that still has turns
  // after its definition was deleted — so no earned points ever disappear
  // from the table while they still count toward a delegate's total.
  const columnNames = [
    ...new Set([...categories.map((c) => c.name), ...scores.map((s) => s.category).filter(Boolean)]),
  ]

  const startEdit = (delegateId, category) => {
    setEditing({ delegateId, category })
    setDraft('')
  }

  const cancelEdit = () => setEditing(null)

  const saveEdit = async () => {
    if (!editing) return
    const value = Number(draft)
    if (draft !== '' && !Number.isNaN(value)) {
      const cap = capByName.get(editing.category)
      const current = categoryTotal(scores, editing.delegateId, editing.category)

      // Mirrors the database trigger: only a positive entry can break a cap,
      // so negative corrections stay allowed even if already over.
      if (cap != null && value > 0 && current + value > cap) {
        toast.error(
          `"${editing.category}" is capped at ${cap} — ${current.toFixed(2)} already earned, so ${
            cap - current
          } points remaining.`,
        )
        playError()
        setEditing(null)
        return
      }

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
            {columnNames.map((category) => {
              const cap = capByName.get(category)
              return (
                <th
                  key={category}
                  className="whitespace-nowrap px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  <div className="flex flex-col items-center">
                    <span>{category}</span>
                    {cap != null && <span className="text-[10px] font-normal normal-case text-slate-400">max {cap}</span>}
                  </div>
                </th>
              )
            })}
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

                {columnNames.map((category) => {
                  const isEditing = editing?.delegateId === delegate.id && editing?.category === category
                  const value = categoryTotal(scores, delegate.id, category)
                  const cap = capByName.get(category)
                  const remaining = remainingPoints(cap, scores, delegate.id, category)
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
                          title={
                            cap != null
                              ? `Add points — ${remaining.toFixed(2)} of ${cap} remaining`
                              : 'Click to add points'
                          }
                        >
                          {value !== 0 ? (
                            <>
                              {value.toFixed(2)}
                              {cap != null && <span className="ml-0.5 text-[10px] text-slate-400">/{cap}</span>}
                            </>
                          ) : (
                            '–'
                          )}
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
        {columnNames.length === 0
          ? 'No scoring categories yet — create one in Scoring Categories at the top.'
          : 'Click any category cell to add points. A delegate cannot earn past a category\'s max. Rows are ranked by total score.'}
      </p>
    </div>
  )
}