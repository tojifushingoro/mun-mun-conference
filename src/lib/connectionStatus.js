/**
 * Tiny pub/sub for the Supabase realtime connection state.
 *
 * The app subscribes to 'delegates' and 'scores' in three separate
 * components, but the connection badge only needs one answer:
 * are we live right now? Keeping it here avoids prop drilling.
 */

const state = {
  status: 'connecting', // connecting | live | offline
}

const listeners = new Set()

export function setConnectionStatus(status) {
  if (state.status === status) return
  state.status = status
  for (const listener of listeners) listener(status)
}

export function getConnectionStatus() {
  return state.status
}

export function subscribeToConnectionStatus(listener) {
  listeners.add(listener)
  listener(state.status)
  return () => listeners.delete(listener)
}