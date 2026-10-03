import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * Multi-select filter with checkboxes.
 *
 * A plain <select> can only pick one value, which can't express
 * "hide these three grades". Selecting nothing means "show everything".
 */
export default function FilterDropdown({ label, options = [], selected = [], onChange, emptyText = 'None in use' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close when clicking outside, so the panel doesn't hang around
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = (value) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
    )
  }

  const summary =
    selected.length === 0
      ? 'All'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 text-slate-500">{label}</span>
          <span
            className={`truncate ${
              selected.length === 0 ? 'text-slate-400' : 'font-medium text-slate-900'
            }`}
          >
            {summary}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full min-w-[200px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg animate-pop-in"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">{emptyText}</p>
          ) : (
            <>
              {options.map((option) => {
                const isChecked = selected.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isChecked}
                    onClick={() => toggle(option.value)}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isChecked
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3" />}
                    </span>
                    {option.label}
                  </button>
                )
              })}
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="mt-1 w-full border-t border-slate-100 px-3 py-2 text-left text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  Clear selection
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}