import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isSfxMuted, setSfxMuted, subscribeToSfx } from '../../lib/sfx'

export default function SoundToggle() {
  const [muted, setMuted] = useState(isSfxMuted())

  useEffect(() => subscribeToSfx(setMuted), [])

  const Icon = muted ? VolumeX : Volume2

  return (
    <button
      type="button"
      onClick={() => setSfxMuted(!muted)}
      title={muted ? 'Sound effects off — click to enable' : 'Sound effects on — click to mute'}
      aria-pressed={!muted}
      aria-label={muted ? 'Enable sound effects' : 'Mute sound effects'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        muted
          ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}