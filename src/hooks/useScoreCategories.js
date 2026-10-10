import { useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase'
import toast from 'react-hot-toast'

/**
 * Chairs define their own scoring categories per committee, each with a
 * max_points cap that limits how much a single delegate can earn in it.
 *
 * Categories are global to the app and filtered by committee_id, so a tab
 * switch never refetches. Realtime keeps every open chair laptop in sync.
 */
export function useScoreCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('score_categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching score categories:', error)
      toast.error('Failed to fetch scoring categories')
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (category) => {
    try {
      const { error } = await supabase.from('score_categories').insert([category])
      if (error) throw error
      toast.success('Scoring category added')
      return true
    } catch (error) {
      console.error('Error adding score category:', error)
      toast.error(error.message || 'Failed to add category')
      return false
    }
  }

  const updateCategory = async (id, updates) => {
    try {
      const { error } = await supabase.from('score_categories').update(updates).eq('id', id)
      if (error) throw error
      toast.success('Scoring category updated')
      return true
    } catch (error) {
      console.error('Error updating score category:', error)
      toast.error(error.message || 'Failed to update category')
      return false
    }
  }

  const deleteCategory = async (id) => {
    try {
      const { error } = await supabase.from('score_categories').delete().eq('id', id)
      if (error) throw error
      toast.success('Scoring category removed')
      return true
    } catch (error) {
      console.error('Error deleting score category:', error)
      toast.error(error.message || 'Failed to remove category')
      return false
    }
  }

  const fetchRef = useRef(fetchCategories)
  fetchRef.current = fetchCategories

  useEffect(() => {
    fetchRef.current()
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('score_categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'score_categories' }, () => {
        fetchRef.current()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
    setCategories,
  }
}