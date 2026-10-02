import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase'
import toast from 'react-hot-toast'

export function useScores() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchScores = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*, delegate:delegates(id, name, country, committee_id)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setScores(data || [])
    } catch (error) {
      console.error('Error fetching scores:', error)
      toast.error('Failed to fetch scores')
    } finally {
      setLoading(false)
    }
  }

  const addScore = async (score) => {
    try {
      const { error } = await supabase.from('scores').insert([score])
      if (error) throw error
      toast.success('Score logged successfully')
      return true
    } catch (error) {
      console.error('Error adding score:', error)
      toast.error('Failed to log score')
      return false
    }
  }

  const updateScore = async (id, updates) => {
    try {
      const { error } = await supabase.from('scores').update(updates).eq('id', id)
      if (error) throw error
      toast.success('Score updated successfully')
      return true
    } catch (error) {
      console.error('Error updating score:', error)
      toast.error('Failed to update score')
      return false
    }
  }

  const deleteScore = async (id) => {
    try {
      const { error } = await supabase.from('scores').delete().eq('id', id)
      if (error) throw error
      toast.success('Score deleted successfully')
      return true
    } catch (error) {
      console.error('Error deleting score:', error)
      toast.error('Failed to delete score')
      return false
    }
  }

  useEffect(() => {
    fetchScores()
  }, [])

  return { scores, loading, addScore, updateScore, deleteScore, refetch: fetchScores, setScores }
}