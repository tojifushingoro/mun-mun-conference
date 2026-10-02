import { Settings, Users, Building2, AlertTriangle } from 'lucide-react'
import CommitteePanel from '../components/Admin/CommitteePanel'
import DelegatePanel from '../components/Admin/DelegatePanel'
import { useCommittees } from '../hooks/useCommittees'
import { useDelegates } from '../hooks/useDelegates'
import { useRealtimeSubscriptions } from '../hooks/useRealtimeScores'
import { isSupabaseConfigured } from '../config/supabase'

export default function AdminDashboard() {
  const {
    committees,
    loading: committeesLoading,
    addCommittee,
    updateCommittee,
    deleteCommittee,
    refetch: refetchCommittees,
  } = useCommittees()

  const {
    delegates,
    loading: delegatesLoading,
    addDelegate,
    updateDelegate,
    deleteDelegate,
    refetch: refetchDelegates,
  } = useDelegates()

  useRealtimeSubscriptions({
    // Refetch so the joined committee object stays accurate on remote changes
    onDelegateChange: () => {
      refetchDelegates()
      refetchCommittees()
    },
  })

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Configuration &amp; Management</h1>
            <p className="text-slate-600">Admin view — manage committees and register delegates</p>
          </div>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Supabase is not configured yet.</p>
            <p className="mt-1">
              Open <code className="rounded bg-amber-100 px-1">src/config/supabase.js</code> and paste your project URL
              and anon key at the top of the file, then restart the dev server.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Committees</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{committees.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Delegates</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{delegates.length}</p>
            </div>
            <Users className="h-8 w-8 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <CommitteePanel
          committees={committees}
          loading={committeesLoading}
          onAdd={addCommittee}
          onUpdate={updateCommittee}
          onDelete={deleteCommittee}
        />
        <DelegatePanel
          delegates={delegates}
          committees={committees}
          loading={delegatesLoading}
          onAdd={addDelegate}
          onUpdate={updateDelegate}
          onDelete={deleteDelegate}
        />
      </div>
    </div>
  )
}