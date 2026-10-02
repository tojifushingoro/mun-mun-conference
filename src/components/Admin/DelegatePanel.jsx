import { useState } from 'react'
import { Edit2, Trash2, Save, X, UserPlus } from 'lucide-react'
import LoadingSpinner from '../Common/LoadingSpinner'
import { formatGrade, normalizeGrade, gradeSort, GRADE_LEVELS, ROLES, isStaffRole } from '../../lib/utils'
import DevTag from '../Common/DevTag'

const EMPTY = {
  name: '',
  grade: '',
  committee_id: '',
  country: '',
  role: 'Delegate',
  notes: '',
}

export default function DelegatePanel({ delegates, committees, loading, onAdd, onUpdate, onDelete }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY)

  const reset = () => {
    setFormData(EMPTY)
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.committee_id) return

    // Country is mandatory for country representatives, optional for staff roles
    const staff = isStaffRole(formData.role)
    if (!staff && !formData.country.trim()) return

    const payload = {
      name: formData.name.trim(),
      grade: formData.grade ? formData.grade.trim() : null,
      committee_id: formData.committee_id,
      country: formData.country.trim() || null,
      role: formData.role,
      notes: formData.notes.trim() || null,
    }

    const ok = editingId ? await onUpdate(editingId, payload) : await onAdd(payload)
    if (ok) reset()
  }

  const handleEdit = (delegate) => {
    setEditingId(delegate.id)
    setFormData({
      name: delegate.name || '',
      grade: normalizeGrade(delegate.grade),
      committee_id: delegate.committee_id || '',
      country: delegate.country || '',
      role: delegate.role || 'Delegate',
      notes: delegate.notes || '',
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Remove this delegate? Their score history will also be deleted.')) {
      await onDelete(id)
    }
  }

  const showForm = isAdding || editingId
  const grades = [...new Set(delegates.map((d) => normalizeGrade(d.grade)).filter(Boolean))].sort(
    (a, b) => gradeSort(a) - gradeSort(b),
  )

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Delegates</h2>
        {!showForm && (
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            <UserPlus className="h-4 w-4" />
            Register Delegate
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Smith"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Country {!isStaffRole(formData.role) && '*'}
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder={
                  isStaffRole(formData.role) ? 'Optional for staff roles' : 'e.g., United States'
                }
                className="input-field"
                required={!isStaffRole(formData.role)}
              />
              {isStaffRole(formData.role) && (
                <p className="mt-1 text-xs text-slate-500">
                  Staff roles (Chair, Vice Chair, Rapporteur, Observer) don't represent a nation.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="select-field"
              >
                <option value="">Select Grade</option>
                {GRADE_LEVELS.map((grade) => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Committee *</label>
              <select
                value={formData.committee_id}
                onChange={(e) => setFormData({ ...formData, committee_id: e.target.value })}
                className="select-field"
                required
              >
                <option value="">Select Committee</option>
                {committees.map((committee) => (
                  <option key={committee.id} value={committee.id}>
                    {committee.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="select-field"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special accommodations, MUN experience, speaking strengths..."
              rows={2}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              <Save className="h-4 w-4" />
              {editingId ? 'Update' : 'Register'}
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
      ) : delegates.length === 0 ? (
        <div className="py-8 text-center text-slate-500">No delegates registered yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50">
                {['Name', 'Country', 'Grade', 'Committee', 'Role', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${
                      i === 5 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {delegates.map((delegate) => (
                <tr key={delegate.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                    <span className="inline-flex items-center gap-1.5">
                      {delegate.name}
                      <DevTag name={delegate.name} />
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {delegate.country || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatGrade(delegate.grade)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {delegate.committees?.name || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{delegate.role}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(delegate)} className="btn-secondary p-2" title="Edit delegate">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(delegate.id)} className="btn-danger p-2" title="Delete delegate">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {grades.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Grades in use: {grades.map(formatGrade).join(', ')}
        </p>
      )}
    </div>
  )
}