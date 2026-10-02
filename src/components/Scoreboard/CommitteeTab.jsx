export default function CommitteeTab({ committees, activeCommittee, onCommitteeChange }) {
  if (committees.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {committees.map((committee) => (
        <button
          key={committee.id}
          onClick={() => onCommitteeChange(committee.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeCommittee === committee.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
          }`}
        >
          {committee.name}
        </button>
      ))}
    </div>
  )
}