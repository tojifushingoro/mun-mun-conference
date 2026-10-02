import { useState } from 'react'
import { Trash2, History, Check, X } from 'lucide-react'
import { formatGrade } from '../../lib/grades'
import DevTag from '../Common/DevTag'

export default function ScoreLog({ scores, delegates, onDeleteScore, committeeName }) {
  const [confirmId, setConfirmId] = useState(null)

  const delegateById = new Map(delegates.map((d) => [String(d.id), d]))
  const entries = [...scores].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  )

  if (entries.length === 0) {
    return (
      <div className="card">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <History className="h-5 w-5 text-slate-400" />
          Turn Log
        </h2>
        <p className="py-4 text-center text-sm text-slate-500">
          No turns logged yet{committeeName ? ` for ${committeeName}` : ''}.
        </p>
      </div>
    )
  }

  const requestDelete = (id) => setConfirmId(id)

  const confirmDelete = async (id) => {
    await onDeleteScore(id)
    setConfirmId(null)
  }

  return (
    <div className="card">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <History className="h-5 w-5 text-slate-400" />
        Turn Log
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Newest first. Remove a turn if it was logged by mistake — the delete syncs to every chair instantly.
      </p>

      <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Time
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Delegate
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Category
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Points
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Remove
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {entries.map((score) => {
              const delegate = delegateById.get(String(score.delegate_id))
              const isConfirming = confirmId === score.id

              return (
                <tr key={score.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-500">
                    {score.created_at
                      ? new Date(score.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-900">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-medium">{delegate?.name || 'Unknown delegate'}</span>
                      <DevTag name={delegate?.name} />
                    </span>
                    {delegate?.country && (
                      <span className="ml-2 text-xs text-slate-500">{delegate.country}</span>
                    )}
                    {delegate?.grade && (
                      <span className="ml-2 text-xs text-slate-400">{formatGrade(delegate.grade)}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-700">
                    {score.category}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-2 text-right text-sm font-semibold ${
                      Number(score.points) < 0 ? 'text-red-600' : 'text-blue-700'
                    }`}
                  >
                    {Number(score.points || 0).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    {isConfirming ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => confirmDelete(score.id)}
                          className="rounded p-1 text-green-600 transition-colors hover:bg-green-50 hover:text-green-800"
                          title="Confirm delete"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => requestDelete(score.id)}
                        className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                        title="Remove this turn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}