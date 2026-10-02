import { useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase'
import { setConnectionStatus } from '../lib/connectionStatus'

/**
 * Reduces Supabase's channel callbacks to one app-wide connection state.
 * Both channels must be SUBSCRIBED before we call the app "live" — either
 * one sitting in CHANNEL_ERROR or TIMED_OUT means chairs are not in sync.
 */
function trackChannelStatus(status) {
  if (status === 'SUBSCRIBED') setConnectionStatus('live')
  else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
    setConnectionStatus('offline')
  }
}

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
    if (!isSupabaseConfigured) {
      setConnectionStatus('offline')
      return
    }

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
        .subscribe((status) => {
          console.log('Delegates realtime status:', status)
          trackChannelStatus(status)
        })
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
        .subscribe((status) => {
          console.log('Scores realtime status:', status)
          trackChannelStatus(status)
        })
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