import { useState } from 'react'
import { LayoutDashboard, Users, BarChart3, Globe } from 'lucide-react'
import NavTabs from './components/Common/NavTabs'
import ConnectionBadge from './components/Common/ConnectionBadge'
import AdminDashboard from './pages/AdminDashboard'
import DiasRoster from './pages/DiasRoster'
import LiveScoreboard from './pages/LiveScoreboard'

const TABS = [
  { id: 'admin', label: 'Admin', icon: LayoutDashboard },
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'scoreboard', label: 'Scoreboard', icon: BarChart3 },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('admin')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">MUN Conference Manager</h1>
                <p className="text-sm text-slate-600">Model United Nations — Dias Dashboard</p>
              </div>
              <div className="ml-2 hidden sm:block">
                <ConnectionBadge />
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:min-w-[380px]">
              <div className="sm:hidden">
                <ConnectionBadge />
              </div>
              <div className="w-full sm:w-auto sm:min-w-[380px]">
                <NavTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'admin' && (
          <div key="admin" className="animate-slide-up">
            <AdminDashboard />
          </div>
        )}
        {activeTab === 'roster' && (
          <div key="roster" className="animate-slide-up">
            <DiasRoster />
          </div>
        )}
        {activeTab === 'scoreboard' && (
          <div key="scoreboard" className="animate-slide-up">
            <LiveScoreboard />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-600">
            MUN Conference Manager • Real-time sync enabled across all Dias laptops
          </p>
        </div>
      </footer>
    </div>
  )
}