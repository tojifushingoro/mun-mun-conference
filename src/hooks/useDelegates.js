import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase'
import toast from 'react-hot-toast'

export function useDelegates() {
  const [delegates, setDelegates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDelegates = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('delegates')
        .select(`
          id,
          name,
          country,
          committee_id,
          grade,
          role,
          notes,
          created_at,
          committees!delegates_single_committee_link ( id, name )
        `)
        .order('name', { ascending: true })

      if (error) throw error
      setDelegates(data || [])
    } catch (error) {
      console.error('Error fetching delegates:', error)
      toast.error('Failed to fetch delegates')
    } finally {
      setLoading(false)
    }
  }

  const addDelegate = async (delegate) => {
    try {
      const { error } = await supabase.from('delegates').insert([delegate])
      if (error) throw error
      toast.success('Delegate registered successfully')
      return true
    } catch (error) {
      console.error('Error adding delegate:', error)
      toast.error('Failed to register delegate')
      return false
    }
  }

  const updateDelegate = async (id, updates) => {
    try {
      const { error } = await supabase.from('delegates').update(updates).eq('id', id)
      if (error) throw error
      toast.success('Delegate updated successfully')
      return true
    } catch (error) {
      console.error('Error updating delegate:', error)
      toast.error('Failed to update delegate')
      return false
    }
  }

  const deleteDelegate = async (id) => {
    try {
      const { error } = await supabase.from('delegates').delete().eq('id', id)
      if (error) throw error
      toast.success('Delegate removed successfully')
      return true
    } catch (error) {
      console.error('Error deleting delegate:', error)
      toast.error('Failed to remove delegate')
      return false
    }
  }

  useEffect(() => {
    fetchDelegates()
  }, [])

  return { delegates, loading, addDelegate, updateDelegate, deleteDelegate, refetch: fetchDelegates, setDelegates }
}