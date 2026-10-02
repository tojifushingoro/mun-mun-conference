import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase'
import toast from 'react-hot-toast'

export function useCommittees() {
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCommittees = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('committees')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCommittees(data || [])
    } catch (error) {
      console.error('Error fetching committees:', error)
      toast.error('Failed to fetch committees')
    } finally {
      setLoading(false)
    }
  }

  const addCommittee = async (committee) => {
    try {
      const { error } = await supabase.from('committees').insert([committee])
      if (error) throw error
      toast.success('Committee added successfully')
      return true
    } catch (error) {
      console.error('Error adding committee:', error)
      toast.error('Failed to add committee')
      return false
    }
  }

  const updateCommittee = async (id, updates) => {
    try {
      const { error } = await supabase.from('committees').update(updates).eq('id', id)
      if (error) throw error
      toast.success('Committee updated successfully')
      return true
    } catch (error) {
      console.error('Error updating committee:', error)
      toast.error('Failed to update committee')
      return false
    }
  }

  const deleteCommittee = async (id) => {
    try {
      const { error } = await supabase.from('committees').delete().eq('id', id)
      if (error) throw error
      toast.success('Committee deleted successfully')
      return true
    } catch (error) {
      console.error('Error deleting committee:', error)
      toast.error('Failed to delete committee')
      return false
    }
  }

  useEffect(() => {
    fetchCommittees()
  }, [])

  return { committees, loading, addCommittee, updateCommittee, deleteCommittee, refetch: fetchCommittees, setCommittees }
}