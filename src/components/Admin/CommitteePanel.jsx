import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import LoadingSpinner from '../Common/LoadingSpinner'

const EMPTY = { name: '', description: '' }

export default function CommitteePanel({ committees, loading, onAdd, onUpdate, onDelete }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY)
  const [formError, setFormError] = useState('')

  const reset = () => {
    setFormData(EMPTY)
    setIsAdding(false)
    setEditingId(null)
    setFormError('')
  }

  const update = (patch) => {
    setFormError('')
    setFormData({ ...formData, ...patch })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Give the committee a name.')
      return
    }

    const payload = { name: formData.name.trim(), description: formData.description.trim() || null }
    const ok = editingId ? await onUpdate(editingId, payload) : await onAdd(payload)
    if (ok) reset()
    else setFormError('Could not save. Check your connection and try again.')
  }

  const handleEdit = (committee) => {
    setEditingId(committee.id)
    setFormData({ name: committee.name || '', description: committee.description || '' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this committee? Its delegates and scores will also be removed.')) {
      await onDelete(id)
    }
  }

  const showForm = isAdding || editingId

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Committees</h2>
        {!showForm && (
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Committee
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Committee Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g., Security Council"
              className={`input-field ${formError ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
              aria-invalid={!!formError}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Brief description of the committee"
              rows={2}
              className="input-field"
            />
          </div>
          {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              <Save className="h-4 w-4" />
              {editingId ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : committees.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          No committees added yet. Add your first committee to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {committees.map((committee) => (
            <div key={committee.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <h3 className="font-medium text-slate-900">{committee.name}</h3>
                {committee.description && <p className="mt-1 text-sm text-slate-600">{committee.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(committee)} className="btn-secondary p-2" title="Edit committee">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(committee.id)} className="btn-danger p-2" title="Delete committee">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}