/**
 * Tiny sound effects using the Web Audio API.
 *
 * No audio files to ship or download — tones are synthesised on the fly,
 * which keeps the bundle small and works with no network.
 *
 * Every call is a no-op when muted, when the browser has no Web Audio
 * support, or when autoplay policy blocks the context. Errors are swallowed
 * on purpose: a sound is never important enough to break a score entry.
 */

const STORAGE_KEY = 'mun-sfx-muted'

let audioCtx = null
let muted = false
const listeners = new Set()

try {
  muted = localStorage.getItem(STORAGE_KEY) === 'true'
} catch {
  // Private browsing or blocked storage - just default to unmuted
}

export function isSfxMuted() {
  return muted
}

export function setSfxMuted(value) {
  muted = Boolean(value)
  try {
    localStorage.setItem(STORAGE_KEY, String(muted))
  } catch {
    // Can't persist, but it still applies for this session
  }
  for (const listener of listeners) listener(muted)
}

export function subscribeToSfx(listener) {
  listeners.add(listener)
  listener(muted)
  return () => listeners.delete(listener)
}

/** Returns a usable AudioContext, or null if we shouldn't make noise. */
function getContext() {
  if (muted) return null
  if (typeof window === 'undefined') return null

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null

    if (!audioCtx) audioCtx = new AudioContextClass()

    // Browsers start the context suspended until a user gesture happens
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})

    return audioCtx
  } catch {
    return null
  }
}

/** One short envelope-shaped tone. Soft attack avoids a clicky pop. */
function blip(ctx, { freq, start = 0, duration = 0.12, type = 'sine', peak = 0.05 }) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t0 = ctx.currentTime + start

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)

  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** Rising two-note chime — a delegate was given points. */
export function playScoreAdded() {
  const ctx = getContext()
  if (!ctx) return
  blip(ctx, { freq: 880, duration: 0.1 })
  blip(ctx, { freq: 1320, start: 0.08, duration: 0.15 })
}

/** Falling two-note tone — a turn was removed. */
export function playScoreRemoved() {
  const ctx = getContext()
  if (!ctx) return
  blip(ctx, { freq: 520, duration: 0.1 })
  blip(ctx, { freq: 330, start: 0.07, duration: 0.16 })
}

/** Short low buzz — the action didn't go through. */
export function playError() {
  const ctx = getContext()
  if (!ctx) return
  blip(ctx, { freq: 200, duration: 0.16, type: 'square', peak: 0.03 })
}