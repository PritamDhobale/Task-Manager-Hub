// weekly-task-context.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

// Keep the shape parallel to MonthlyTask for easy reuse
export interface WeeklyTask {
  id: string
  title: string
  companyId: string
  company?: string
  dueDate: string            // e.g., next occurrence date; keep same name as monthly for UI reuse
  priority: "High" | "Mid" | "Low"
  status: "Completed" | "In Progress" | "Not Started" | "Deleted"
  description?: string
  category?: string
  tags?: string[]
  created_by: string
}

interface WeeklyTaskContextType {
  weeklyTasks: WeeklyTask[]
  reloadWeeklyTasks: () => Promise<void>
  addWeeklyTask: (task: Omit<WeeklyTask, "id" | "created_by">) => Promise<void>
  updateWeeklyTask: (task: WeeklyTask) => Promise<void>
  deleteWeeklyTask: (taskId: string) => Promise<void>
}

const WeeklyTaskContext = createContext<WeeklyTaskContextType | undefined>(undefined)

export function WeeklyTaskProvider({ children }: { children: React.ReactNode }) {
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([])

  const loadWeeklyTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("weekly_tasks")
      .select("*, companies(name)")
      .eq("created_by", user.id)
      .order("due_date")

    if (!error && data) {
      const mapped: WeeklyTask[] = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        companyId: t.company_id,
        company: t.companies?.name,
        dueDate: t.due_date,
        priority: t.priority,
        status: t.status,
        description: t.description,
        category: t.category,
        tags: t.tags || [],
        created_by: t.created_by,
      }))
      setWeeklyTasks(mapped)
    }
  }

  useEffect(() => {
    loadWeeklyTasks()
  }, [])

  const addWeeklyTask = async (task: Omit<WeeklyTask, "id" | "created_by">) => {
    const { error } = await supabase.from("weekly_tasks").insert({
      title: task.title,
      company_id: task.companyId,
      due_date: task.dueDate,
      priority: task.priority,
      status: task.status,
      description: task.description,
      category: task.category,
      tags: task.tags,
      // If your RLS doesn't auto-fill created_by, uncomment next two lines:
      // created_by: (await supabase.auth.getUser()).data.user?.id
    })
    if (!error) await loadWeeklyTasks()
  }

  const updateWeeklyTask = async (task: WeeklyTask) => {
    const { error } = await supabase
      .from("weekly_tasks")
      .update({
        title: task.title,
        company_id: task.companyId,
        due_date: task.dueDate,
        priority: task.priority,
        status: task.status,
        description: task.description,
        category: task.category,
        tags: task.tags,
      })
      .eq("id", task.id)

    if (!error) await loadWeeklyTasks()
  }

  const deleteWeeklyTask = async (taskId: string) => {
    const { error } = await supabase.from("weekly_tasks").delete().eq("id", taskId)
    if (!error) await loadWeeklyTasks()
  }

  return (
    <WeeklyTaskContext.Provider
      value={{ weeklyTasks, reloadWeeklyTasks: loadWeeklyTasks, addWeeklyTask, updateWeeklyTask, deleteWeeklyTask }}
    >
      {children}
    </WeeklyTaskContext.Provider>
  )
}

export function useWeeklyTasks() {
  const ctx = useContext(WeeklyTaskContext)
  if (ctx === undefined) throw new Error("useWeeklyTasks must be used within a WeeklyTaskProvider")
  return ctx
}
