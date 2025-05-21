"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface MonthlyTask {
  id: string
  title: string
  companyId: string
  company?: string
  dueDate: string
  priority: "High" | "Mid" | "Low"
  status: "Completed" | "In Progress" | "Not Started"
  description?: string
  category?: string
  tags?: string[]
}

interface MonthlyTaskContextType {
  monthlyTasks: MonthlyTask[]
  reloadMonthlyTasks: () => Promise<void>
  addMonthlyTask: (task: Omit<MonthlyTask, "id">) => Promise<void>
  updateMonthlyTask: (task: MonthlyTask) => Promise<void>
  deleteMonthlyTask: (taskId: string) => Promise<void>
}

const MonthlyTaskContext = createContext<MonthlyTaskContextType | undefined>(undefined)

export function MonthlyTaskProvider({ children }: { children: React.ReactNode }) {
  const [monthlyTasks, setMonthlyTasks] = useState<MonthlyTask[]>([])

  const loadMonthlyTasks = async () => {
    const { data, error } = await supabase
      .from("monthly_tasks")
      .select("*, companies(name)")
      .order("due_date")

    if (!error && data) {
      const mapped = data.map((t) => ({
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
      }))
      setMonthlyTasks(mapped)
    }
  }

  useEffect(() => {
    loadMonthlyTasks()
  }, [])

  const addMonthlyTask = async (task: Omit<MonthlyTask, "id">) => {
    const { error } = await supabase.from("monthly_tasks").insert({
      title: task.title,
      company_id: task.companyId,
      due_date: task.dueDate,
      priority: task.priority,
      status: task.status,
      description: task.description,
      category: task.category,
      tags: task.tags,
    })
    if (!error) await loadMonthlyTasks()
  }

  const updateMonthlyTask = async (task: MonthlyTask) => {
    const { error } = await supabase
      .from("monthly_tasks")
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
    if (!error) await loadMonthlyTasks()
  }

  const deleteMonthlyTask = async (taskId: string) => {
    const { error } = await supabase
      .from("monthly_tasks")
      .delete()
      .eq("id", taskId)
    if (!error) await loadMonthlyTasks()
  }

  return (
    <MonthlyTaskContext.Provider
    value={{ monthlyTasks, reloadMonthlyTasks: loadMonthlyTasks, addMonthlyTask, updateMonthlyTask, deleteMonthlyTask }}
  >
      {children}
    </MonthlyTaskContext.Provider>
  )
}

export function useMonthlyTasks() {
  const context = useContext(MonthlyTaskContext)
  if (context === undefined) {
    throw new Error("useMonthlyTasks must be used within a MonthlyTaskProvider")
  }
  return context
}
