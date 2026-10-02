import { MapPin, GraduationCap, Users } from 'lucide-react'
import { formatGrade } from '../../lib/utils'
import DevTag from '../Common/DevTag'

export default function DelegateCard({ delegate, onClick, totalScore = 0 }) {
  return (
    <button
      onClick={onClick}
      className="card w-full cursor-pointer text-left transition-all hover:shadow-md hover:ring-2 hover:ring-blue-500"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
            {delegate.name}
            <DevTag name={delegate.name} />
          </h3>
          <p className="text-sm text-slate-600">{delegate.role}</p>
        </div>
        <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {totalScore.toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        {delegate.country && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{delegate.country}</span>
          </div>
        )}
        {delegate.grade && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>{formatGrade(delegate.grade)}</span>
          </div>
        )}
        {delegate.committees && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 shrink-0" />
            <span>{delegate.committees.name}</span>
          </div>
        )}
      </div>
    </button>
  )
}