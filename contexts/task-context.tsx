"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Task {
  id: string
  title: string
  companyId: string
  company?: string
  dueDate: string
  priority: "High" | "Mid" | "Low"
  status: "Completed" | "In Progress" | "Not Started" | "Deleted"
  description?: string
  category?: string
  tags?: string[]
}

interface TaskContextType {
  tasks: Task[]
  deletedTasks: Task[]
  addTask: (task: Omit<Task, "id">) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  restoreTask: (taskId: string) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([])

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, companies(name)")
      .order("due_date")

    if (!error && data) {
      const active = data.filter((task) => task.status !== "Deleted")
      const deleted = data.filter((task) => task.status === "Deleted")
      setTasks(active.map(mapTask))
      setDeletedTasks(deleted.map(mapTask))
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const mapTask = (raw: any): Task => ({
    id: raw.id,
    title: raw.title,
    companyId: raw.company_id,
    company: raw.companies?.name,
    dueDate: raw.due_date,
    priority: raw.priority,
    status: raw.status,
    description: raw.description,
    category: raw.category,
    tags: raw.tags || [],
  })

  const addTask = async (task: Omit<Task, "id">) => {
    const { error } = await supabase.from("tasks").insert({
      title: task.title,
      company_id: task.companyId,
      due_date: task.dueDate,
      priority: task.priority,
      status: task.status,
      description: task.description,
      category: task.category,
      tags: task.tags,
    })
    if (!error) await loadTasks()
  }

  const updateTask = async (task: Task) => {
    const { error } = await supabase
      .from("tasks")
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
    if (!error) await loadTasks()
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "Deleted" })
      .eq("id", taskId)
    if (!error) await loadTasks()
  }

  const restoreTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "Not Started" })
      .eq("id", taskId)
    if (!error) await loadTasks()
  }

  return (
    <TaskContext.Provider
      value={{ tasks, deletedTasks, addTask, updateTask, deleteTask, restoreTask }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}










// "use client"

// import type React from "react"
// import { createContext, useContext, useState } from "react"

// // Update the Task interface to include companyId
// export interface Task {
//   id: number
//   title: string
//   company: string
//   companyId: number
//   dueDate: string
//   priority: "High" | "Mid" | "Low"
//   status: "Completed" | "In Progress" | "Not Started" | "Deleted" | "Pending" // Added "Not Started", kept "Pending" for backward compatibility
//   description?: string
//   category?: string
//   tags?: string[]
// }

// interface TaskContextType {
//   tasks: Task[]
//   deletedTasks: Task[]
//   addTask: (task: Omit<Task, "id">) => void
//   updateTask: (task: Task) => void
//   deleteTask: (taskId: number) => void
//   restoreTask: (taskId: number) => void
// }

// // Update the initialTasks array to use "Not Started" instead of "Pending"
// const initialTasks: Task[] = [
//   {
//     id: 1,
//     title: "Quarterly Financial Report",
//     company: "Sage Healthy",
//     companyId: 0,
//     dueDate: "May 15, 2023",
//     priority: "High",
//     status: "In Progress",
//     description: "Prepare and submit quarterly financial report for Q1 2023",
//     category: "Reporting",
//     tags: ["Finance", "Reporting"],
//   },
//   {
//     id: 2,
//     title: "Tax Filing Preparation",
//     company: "HubOne Systems",
//     companyId: 2,
//     dueDate: "Apr 10, 2023",
//     priority: "High",
//     status: "Completed",
//     description: "Gather all necessary documents for tax filing",
//     category: "Tax",
//     tags: ["Tax", "Finance"],
//   },
//   {
//     id: 3,
//     title: "Budget Planning Meeting",
//     company: "Gentyx",
//     companyId: 3,
//     dueDate: "May 20, 2023",
//     priority: "Mid",
//     status: "Not Started", // Updated from "Pending"
//     description: "Schedule and prepare for budget planning meeting with department heads",
//     category: "Budget",
//     tags: ["Budget", "Meeting"],
//   },
//   {
//     id: 4,
//     title: "Expense Report Review",
//     company: "Sage Healthy Global",
//     companyId: 1,
//     dueDate: "May 5, 2023",
//     priority: "Low",
//     status: "Completed",
//     description: "Review and approve expense reports for Q1",
//     category: "Finance",
//     tags: ["Expense", "Review"],
//   },
//   {
//     id: 5,
//     title: "Vendor Payment Processing",
//     company: "HoldCos",
//     companyId: 4,
//     dueDate: "May 12, 2023",
//     priority: "Mid",
//     status: "In Progress",
//     description: "Process payments for all vendors for the month of April",
//     category: "Finance",
//     tags: ["Vendor", "Payment"],
//   },
//   {
//     id: 6,
//     title: "Annual Audit Preparation",
//     company: "Sage Healthy",
//     companyId: 0,
//     dueDate: "Jun 1, 2023",
//     priority: "High",
//     status: "Not Started", // Updated from "Pending"
//     description: "Prepare documentation for annual audit",
//     category: "Finance",
//     tags: ["Audit", "Finance"],
//   },
//   {
//     id: 7,
//     title: "Financial Statement Analysis",
//     company: "HubOne Systems",
//     companyId: 2,
//     dueDate: "May 25, 2023",
//     priority: "Mid",
//     status: "In Progress",
//     description: "Analyze Q1 financial statements",
//     category: "Reporting",
//     tags: ["Finance", "Analysis"],
//   },
// ]

// // Update the initialDeletedTasks array to include companyId for each task
// const initialDeletedTasks: Task[] = [
//   {
//     id: 101,
//     title: "Annual Budget Review",
//     company: "Sage Healthy",
//     companyId: 0,
//     dueDate: "Mar 15, 2023",
//     priority: "High",
//     status: "Deleted",
//     description: "Review annual budget allocation",
//     category: "Budget",
//     tags: ["Budget", "Review"],
//   },
//   {
//     id: 102,
//     title: "Quarterly Tax Filing",
//     company: "HubOne Systems",
//     companyId: 2,
//     dueDate: "Apr 5, 2023",
//     priority: "High",
//     status: "Deleted",
//     description: "File quarterly taxes",
//     category: "Tax",
//     tags: ["Tax", "Quarterly"],
//   },
// ]

// const TaskContext = createContext<TaskContextType | undefined>(undefined)

// export function TaskProvider({ children }: { children: React.ReactNode }) {
//   const [tasks, setTasks] = useState<Task[]>(initialTasks)
//   const [deletedTasks, setDeletedTasks] = useState<Task[]>(initialDeletedTasks)

//   // Add a new task
//   const addTask = (task: Omit<Task, "id">) => {
//     const newTask: Task = {
//       ...task,
//       id: Math.max(...tasks.map((t) => t.id), 0) + 1,
//     }
//     setTasks((prev) => [...prev, newTask])
//   }

//   // Update an existing task
//   const updateTask = (updatedTask: Task) => {
//     setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
//   }

//   // Delete a task (move to deleted tasks)
//   const deleteTask = (taskId: number) => {
//     const taskToDelete = tasks.find((task) => task.id === taskId)
//     if (taskToDelete) {
//       const updatedTask = { ...taskToDelete, status: "Deleted" }
//       setDeletedTasks((prev) => [...prev, updatedTask])
//       setTasks((prev) => prev.filter((task) => task.id !== taskId))
//     }
//   }

//   // Restore a deleted task
//   const restoreTask = (taskId: number) => {
//     const taskToRestore = deletedTasks.find((task) => task.id === taskId)
//     if (taskToRestore) {
//       // Update status from "Pending" to "Not Started" if needed
//       const restoredTask = {
//         ...taskToRestore,
//         status: taskToRestore.status === "Pending" ? "Not Started" : "Not Started",
//       }
//       setTasks((prev) => [...prev, restoredTask])
//       setDeletedTasks((prev) => prev.filter((task) => task.id !== taskId))
//     }
//   }

//   return (
//     <TaskContext.Provider
//       value={{
//         tasks,
//         deletedTasks,
//         addTask,
//         updateTask,
//         deleteTask,
//         restoreTask,
//       }}
//     >
//       {children}
//     </TaskContext.Provider>
//   )
// }

// export function useTasks() {
//   const context = useContext(TaskContext)
//   if (context === undefined) {
//     throw new Error("useTasks must be used within a TaskProvider")
//   }
//   return context
// }
