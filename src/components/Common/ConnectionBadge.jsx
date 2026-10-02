import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { subscribeToConnectionStatus } from '../../lib/connectionStatus'

const CONFIG = {
  live: {
    label: 'Live',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    title: 'Connected — changes from other chairs appear instantly',
  },
  connecting: {
    label: 'Connecting',
    dot: 'bg-amber-400 animate-pulse',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    title: 'Connecting to the live database…',
  },
  offline: {
    label: 'Offline',
    dot: 'bg-red-500',
    text: 'text-red-700',
    ring: 'ring-red-200',
    title: 'Not receiving live updates. Reload if this persists.',
  },
}

export default function ConnectionBadge() {
  const [status, setStatus] = useState('connecting')

  useEffect(() => subscribeToConnectionStatus(setStatus), [])

  const config = CONFIG[status] ?? CONFIG.connecting
  const Icon = status === 'offline' ? WifiOff : Wifi

  return (
    <div
      title={config.title}
      className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ${config.text} ${config.ring}`}
    >
      <span className="relative flex h-2 w-2">
        {status === 'live' && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </div>
  )
}