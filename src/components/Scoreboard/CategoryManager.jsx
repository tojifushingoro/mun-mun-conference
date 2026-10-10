import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Settings2, Loader2 } from 'lucide-react'

/**
 * Top-of-page control where chairs create the categories used to score the
 * active committee. Every category carries a max_points cap: a delegate can
 * earn at most that much across all their turns in the category.
 */
export default function CategoryManager({
  committeeId,
  committeeName,
  categories,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [max, setMax] = useState('')
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editMax, setEditMax] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  const resetAdd = () => {
    setAdding(false)
    setName('')
    setMax('')
    setFormError('')
  }

  const validate = (rawName, rawMax) => {
    const n = rawName.trim()
    const m = Number(rawMax)
    if (!n) return { error: 'Give the category a name.' }
    if (!Number.isFinite(m) || m <= 0) return { error: 'The limit must be a positive number.' }
    return { name: n, max_points: m }
  }

  const submitAdd = async (e) => {
    e.preventDefault()
    const check = validate(name, max)
    if (check.error) {
      setFormError(check.error)
      return
    }
    setSaving(true)
    const ok = await onAdd({ committee_id: committeeId, name: check.name, max_points: check.max_points })
    setSaving(false)
    if (ok) resetAdd()
    else setFormError('Could not save — is the name already in use for this committee?')
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    const check = validate(editName, editMax)
    if (check.error) {
      setFormError(check.error)
      return
    }
    setSaving(true)
    const ok = await onUpdate(editingId, { name: check.name, max_points: check.max_points })
    setSaving(false)
    if (ok) setEditingId(null)
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditMax(String(cat.max_points))
    setFormError('')
  }

  if (loading) {
    return (
      <div className="card">
        <p className="text-sm text-slate-500">Loading scoring categories…</p>
      </div>
    )
  }

  if (!committeeId) {
    return (
      <div className="card">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Settings2 className="h-5 w-5 text-slate-400" />
          Scoring Categories
        </h2>
        <p className="text-sm text-slate-500">Pick a committee tab below to set up its categories.</p>
      </div>
    )
  }

  return (
    <div className="card mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Settings2 className="h-5 w-5 text-slate-400" />
          Scoring Categories
          {committeeName && <span className="text-sm font-normal text-slate-500">— {committeeName}</span>}
        </h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-secondary">
            <Plus className="h-4 w-4" />
            Add category
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={submitAdd} className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Speech"
                className="input-field"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Max per delegate *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="e.g., 10"
                className="input-field"
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save
              </button>
              <button type="button" onClick={resetAdd} className="btn-secondary" disabled={saving}>
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
          {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
        </form>
      )}

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
          No categories yet for this committee. Add one, then click a cell in the scoreboard to start scoring.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const isEditing = cat.id === editingId
            const isConfirming = cat.id === confirmingDelete
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                {isEditing ? (
                  <form onSubmit={submitEdit} className="flex w-full flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field flex-1"
                    />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editMax}
                      onChange={(e) => setEditMax(e.target.value)}
                      className="input-field w-24"
                    />
                    {formError && <span className="w-full text-xs font-medium text-red-600">{formError}</span>}
                    <button type="submit" disabled={saving} title="Save" className="rounded p-1 text-green-600 hover:bg-green-50">
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                      title="Cancel"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{cat.name}</p>
                      <p className="text-xs text-slate-500">max {cat.max_points} pts per delegate</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {isConfirming ? (
                        <>
                          <button
                            onClick={() => {
                              setConfirmingDelete(null)
                              onDelete(cat.id)
                            }}
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                            title="Confirm delete"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(null)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            title="Edit category"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(cat.id)}
                            className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">
        The limit applies per delegate per category. Turns logged in the past for a deleted category stay counted in
        totals until removed from the Turn Log.
      </p>
    </div>
  )
}