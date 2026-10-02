import { useEffect } from 'react'
import { X, MapPin, GraduationCap, Users, FileText, Trophy, Trash2 } from 'lucide-react'
import { formatGrade } from '../../lib/utils'
import DevTag from '../Common/DevTag'
import { playScoreRemoved, playError } from '../../lib/sfx'

export default function DelegateModal({ delegate, scores, isOpen, onClose, onDeleteScore }) {
  // Escape closes, and the page behind shouldn't scroll while it's open
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen || !delegate) return null

  const totalScore = scores.reduce((sum, score) => sum + (Number(score.points) || 0), 0)

  const scoresByCategory = scores.reduce((acc, score) => {
    const category = score.category || 'Uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(score)
    return acc
  }, {})

  const handleDelete = async (scoreId) => {
    if (window.confirm('Delete this score entry?')) {
      const ok = await onDeleteScore?.(scoreId)
      if (ok === false) playError()
      else playScoreRemoved()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${delegate.name} profile`}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-6">
          <div>
            <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold text-slate-900">
              {delegate.name}
              <DevTag name={delegate.name} />
            </h2>
            <p className="text-slate-600">{delegate.role}</p>
          </div>
          <button onClick={onClose} className="btn-secondary p-2" title="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Profile</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {delegate.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{delegate.country}</span>
                </div>
              )}
              {delegate.grade && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{formatGrade(delegate.grade)}</span>
                </div>
              )}
              {delegate.committees && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{delegate.committees.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Total Score</h3>
              </div>
              <span className="text-2xl font-bold text-blue-700">{totalScore.toFixed(2)}</span>
            </div>
          </div>

          {delegate.notes && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {delegate.notes}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Score Breakdown</h3>
            {scores.length === 0 ? (
              <p className="text-sm text-slate-500">No scores recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(scoresByCategory).map(([category, categoryScores]) => {
                  const catTotal = categoryScores.reduce((sum, s) => sum + (Number(s.points) || 0), 0)
                  return (
                    <div key={category} className="overflow-hidden rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between bg-slate-50 px-4 py-2">
                        <span className="text-sm font-medium text-slate-900">{category}</span>
                        <span className="text-sm font-semibold text-slate-700">{catTotal.toFixed(2)}</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {categoryScores.map((score) => (
                          <div key={score.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                            <span className="text-slate-600">
                              {new Date(score.created_at).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-900">
                                {(Number(score.points) || 0).toFixed(2)}
                              </span>
                              {onDeleteScore && (
                                <button
                                  onClick={() => handleDelete(score.id)}
                                  className="text-red-500 transition-colors hover:text-red-700"
                                  title="Delete score"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}