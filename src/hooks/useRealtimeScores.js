import { useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase'

/**
 * Subscribes to INSERT / UPDATE / DELETE postgres_changes events on the
 * 'delegates' and 'scores' tables and pushes them into local React state so
 * every open browser updates immediately.
 */
export function useRealtimeSubscriptions({ onDelegateChange, onScoreChange }) {
  const delegateChannelRef = useRef(null)
  const scoreChannelRef = useRef(null)
  const delegateHandlerRef = useRef(onDelegateChange)
  const scoreHandlerRef = useRef(onScoreChange)

  // Keep the latest handlers without tearing down the channels
  delegateHandlerRef.current = onDelegateChange
  scoreHandlerRef.current = onScoreChange

  useEffect(() => {
    if (!isSupabaseConfigured) return

    if (!delegateChannelRef.current) {
      delegateChannelRef.current = supabase
        .channel('delegates_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'delegates' },
          (payload) => {
            console.log('Delegate change received:', payload.eventType)
            delegateHandlerRef.current?.(payload)
          },
        )
        .subscribe((status) => console.log('Delegates realtime status:', status))
    }

    if (!scoreChannelRef.current) {
      scoreChannelRef.current = supabase
        .channel('scores_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'scores' },
          (payload) => {
            console.log('Score change received:', payload.eventType)
            scoreHandlerRef.current?.(payload)
          },
        )
        .subscribe((status) => console.log('Scores realtime status:', status))
    }

    return () => {
      if (delegateChannelRef.current) {
        supabase.removeChannel(delegateChannelRef.current)
        delegateChannelRef.current = null
      }
      if (scoreChannelRef.current) {
        supabase.removeChannel(scoreChannelRef.current)
        scoreChannelRef.current = null
      }
    }
  }, [])
}