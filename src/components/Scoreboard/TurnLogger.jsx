import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'

const DEFAULT_CATEGORIES = [
  'Speech',
  'Caucus',
  'Diplomacy',
  'Resolution',
  'Amendment',
  'POI',
  'Opening Speech',
  'Closing Speech',
  'Moderated Caucus',
  'Unmoderated Caucus',
]

export default function TurnLogger({ delegates, onAddScore, committees }) {
  const [committeeFilter, setCommitteeFilter] = useState('')
  const [selectedDelegate, setSelectedDelegate] = useState('')
  const [category, setCategory] = useState('Speech')
  const [points, setPoints] = useState('')
  const [customCategory, setCustomCategory] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const visibleDelegates = committeeFilter
    ? delegates.filter((d) => d.committee_id === committeeFilter)
    : delegates

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDelegate || points === '') return

    const finalCategory = customCategory ? categoryInput.trim() : category
    if (!finalCategory) return

    const pointsNum = Number(points)
    if (Number.isNaN(pointsNum)) return

    setSubmitting(true)
    const success = await onAddScore({
      delegate_id: selectedDelegate,
      category: finalCategory,
      points: pointsNum,
    })
    setSubmitting(false)

    if (success) {
      setPoints('')
      setCategoryInput('')
      setCustomCategory(false)
    }
  }

  return (
    <div className="card mb-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Log a Turn / Score</h3>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {committees?.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Committee</label>
            <select
              value={committeeFilter}
              onChange={(e) => {
                setCommitteeFilter(e.target.value)
                setSelectedDelegate('')
              }}
              className="select-field"
            >
              <option value="">All</option>
              {committees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Delegate *</label>
          <select
            value={selectedDelegate}
            onChange={(e) => setSelectedDelegate(e.target.value)}
            className="select-field"
            required
          >
            <option value="">Select Delegate</option>
            {visibleDelegates.map((delegate) => (
              <option key={delegate.id} value={delegate.id}>
                {delegate.name} — {delegate.country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
          <div className="space-y-2">
            <select
              value={customCategory ? 'custom' : category}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setCustomCategory(true)
                } else {
                  setCustomCategory(false)
                  setCategory(e.target.value)
                }
              }}
              className="select-field"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="custom">Custom Category...</option>
            </select>
            {customCategory && (
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Enter category name"
                className="input-field"
                required
              />
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Points *</label>
          <input
            type="number"
            step="0.01"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="e.g., 5"
            className="input-field"
            required
          />
        </div>

        <div className="flex items-end">
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Log Score
          </button>
        </div>
      </form>
    </div>
  )
}