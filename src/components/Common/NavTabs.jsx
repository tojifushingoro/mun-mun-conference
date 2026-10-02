import { cn } from '../../lib/utils'

export default function NavTabs({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="flex space-x-1 rounded-lg bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
            activeTab === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}