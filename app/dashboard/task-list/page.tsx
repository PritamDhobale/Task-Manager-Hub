"use client"

import { useState, useEffect, useRef, useMemo } from "react"
// import { useState } from "react"
import { useParams } from "next/navigation"
// import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { CATEGORIES, getCategoryStyle } from "@/utils/category-styles"
import { Undo2 } from "lucide-react"
import { useTasks } from "@/contexts/task-context"
import { WeeklyTaskProvider, useWeeklyTasks } from "@/contexts/weekly-task-context"
import TaskSearchFilter from "@/components/task-search-filter"
import { useRouter } from "next/navigation"
// import { useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Printer, Download, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { User } from "@supabase/supabase-js"

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th"
  switch (day % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}

// export default function TaskListPage() {
function TaskListContent() {
  const { tasks, deletedTasks, restoreTask, addTask, updateTask, deleteTask } = useTasks()
  const router = useRouter()
  const allTasksRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const { toast } = useToast()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  

useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user ?? null)
    setCurrentUserId(user?.id || null)
  }
  getUser()
}, [])

useEffect(() => {
  const loadCompanies = async () => {
    const { data, error } = await supabase.from("companies").select("id, name")
    if (!error && data) {
      setCompanies(data.map((c) => ({ id: String(c.id), name: c.name })))
    }
  }
  loadCompanies()
}, [])

  const [viewMode, setViewMode] = useState<"all" | "not_started" | "in_progress" | "completed" | "deleted">("all")
  const [weeklyViewMode, setWeeklyViewMode] = useState<"all" | "not_started" | "in_progress" | "completed" | "deleted">("all")
  const [monthlyViewMode, setMonthlyViewMode] = useState<"all" | "not_started" | "in_progress" | "completed" | "deleted">("all")
  const [monthlyTasks, setMonthlyTasks] = useState<any[]>([])
  const { weeklyTasks, reloadWeeklyTasks } = useWeeklyTasks()
  const companyId = params.id as string

  // === Export dialog state ===
const [exportOpen, setExportOpen] = useState(false)

// multi-selects
type SelType = "one" | "weekly" | "monthly" | "deleted"
const [selTypes, setSelTypes] = useState<Set<SelType>>(new Set(["one","weekly","monthly"])) // default: no "deleted"

const [selPriorities, setSelPriorities] = useState<Set<"High"|"Mid"|"Low">>(
  new Set(["High","Mid","Low"])
)

// Build lists from ONLY my tasks
const own = (t:any) =>
  currentUserId ? (t?.created_by && t.created_by === currentUserId) : false

const allCompanies = useMemo(() => {
  const getName = (t: any) =>
    t.company ?? t.company_name ?? t.companyName ?? t.companies?.name ?? ""

  return Array.from(new Set(
    [
      ...tasks.filter(own).map(getName),
      ...weeklyTasks.filter(own).map(getName),
      ...monthlyTasks.filter(own).map(getName),
      ...deletedTasks.filter(own).map(getName), // <-- include deleted one-time
    ].filter(Boolean)
  ))
}, [tasks, weeklyTasks, monthlyTasks, deletedTasks, currentUserId])


const [selCompanies, setSelCompanies] = useState<Set<string>>(new Set(allCompanies))
// keep defaults in sync when data/user changes
useEffect(() => setSelCompanies(new Set(allCompanies)), [allCompanies])

// NEW: categories (pulled from my tasks only)
const allCategories = useMemo(() => {
  const getCat = (t:any) => t.category ?? ""
  return Array.from(new Set(
    [
      ...tasks.filter(own).map(getCat),
      ...weeklyTasks.filter(own).map(getCat),
      ...monthlyTasks.filter(own).map(getCat),
      ...deletedTasks.filter(own).map(getCat), // optional but consistent
    ].filter(Boolean)
  ))
}, [tasks, weeklyTasks, monthlyTasks, deletedTasks, currentUserId])

const [selCategories, setSelCategories] = useState<Set<string>>(new Set(allCategories))
useEffect(() => setSelCategories(new Set(allCategories)), [allCategories])

// Date range
const [dateFrom, setDateFrom] = useState<string>("") // yyyy-mm-dd
const [dateTo,   setDateTo]   = useState<string>("")

  // tiny togglers
  const toggleInSet = <T,>(s:Set<T>, v:T, set:(n:Set<T>)=>void) => {
    const n = new Set(s)
    n.has(v) ? n.delete(v) : n.add(v)
    set(n)
  }

  const inRange = (d?: string | null) => {
    if (!d) return true;
    const dt = new Date(d);
    if (dateFrom && dt < new Date(dateFrom)) return false;
    if (dateTo && dt > new Date(dateTo)) return false;
    return true;
  };

  const setAll = <T,>(vals:T[], set:(n:Set<T>)=>void) => set(new Set(vals))
  const clearAll = <T,>(set:(n:Set<T>)=>void) => set(new Set())


  // useEffect(() => {
  //   const fetchMonthlyTasks = async () => {
  //     const { data, error } = await supabase
  //     .from("monthly_tasks")
  //     .select(`
  //       *,
  //       companies (
  //         name
  //       )
  //     `)
  //     if (!error) setMonthlyTasks(data)
  //     else console.error("Failed to fetch monthly tasks:", error)
  //   }
  
  //   fetchMonthlyTasks()
  // }, [])
  const fetchMonthlyTasks = async () => {
  const { data, error } = await supabase
    .from("monthly_tasks")
    .select(`*, companies ( name )`);

  if (!error) {
    const normalized = (data ?? []).map((t: any) => ({
      ...t,
      company: t.company ?? t.company_name ?? t.companies?.name ?? "",
      companyId: t.company_id ?? t.companyId,
    }));
    setMonthlyTasks(normalized);
  } else {
    console.error("Failed to fetch monthly tasks:", error);
  }
};
  useEffect(() => {
  fetchMonthlyTasks()
}, [])

    // New task form state
  const [newTask, setNewTask] = useState({
  title: "",
  category: "",
  priority: "Mid",
  status: "Not Started",
  dueDate: new Date().toISOString().split("T")[0],
  description: "",
  taskType: "One-time",
  companyId: "",       // NEW: required on All Tasks page
})

// ---- Quick edit modal state ----
const [editOpen, setEditOpen] = useState(false)
const [activeTask, setActiveTask] = useState<any | null>(null)

// open full edit dialog for a specific task
const openEdit = (task: any) => {
  // normalize due date so the input always has a value (monthly uses due_date)
  setActiveTask({
    ...task,
    dueDate: (task as any).dueDate ?? (task as any).due_date ?? "",
  })
  setEditOpen(true)
}

// save full edit changes
const saveActiveTask = () => {
  if (!activeTask) return
  updateTask(activeTask)
  toast({ variant: "success", title: "Success", description: "Task updated successfully!" })
  setEditOpen(false)
}

// quick inline status change for a row
// was: ("Completed" | "In Progress" | "Not Started")
const handleInlineStatusChange = (
  taskId: string,
  status: "Completed" | "In Progress" | "Not Started" | "Deleted"
) => {
  const t = tasks.find((x) => x.id === taskId)
  if (!t) return

  if (status === "Deleted") {
    deleteTask(taskId)
    toast({ variant: "success", title: "Deleted", description: "Task moved to Deleted." })
    return
  }

  updateTask({ ...t, status })
  toast({ variant: "success", title: "Status updated", description: `Marked as ${status}` })
}

// --- persist weekly status to Supabase ---
const handleInlineStatusChangeWeekly = async (
  taskId: string,
  status: "Completed" | "In Progress" | "Not Started" | "Deleted"
) => {
  const target = status === "Deleted" ? { status: "Deleted" } : { status }
  const { error } = await supabase.from("weekly_tasks").update(target).eq("id", taskId)
  if (error) {
    toast({ variant: "destructive", title: "Update failed", description: error.message })
    return
  }
  await reloadWeeklyTasks()
  toast({
    variant: "success",
    title: "Status updated",
    description: status === "Deleted" ? "Task moved to Deleted." : `Marked as ${status}`,
  })
}

// --- persist monthly status to Supabase ---
const handleInlineStatusChangeMonthly = async (
  taskId: string,
  status: "Completed" | "In Progress" | "Not Started" | "Deleted"
) => {
  const target = status === "Deleted" ? { status: "Deleted" } : { status }
  const { error } = await supabase.from("monthly_tasks").update(target).eq("id", taskId)
  if (error) {
    toast({ variant: "destructive", title: "Update failed", description: error.message })
    return
  }
  setMonthlyTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  toast({
    variant: "success",
    title: "Status updated",
    description: status === "Deleted" ? "Task moved to Deleted." : `Marked as ${status}`,
  })
}


// --- persist weekly priority to Supabase ---
const handleInlinePriorityChangeWeekly = async (
  taskId: string,
  priority: "High" | "Mid" | "Low"
) => {
  const { error } = await supabase
    .from("weekly_tasks")
    .update({ priority })
    .eq("id", taskId)

  if (error) {
    toast({ variant: "destructive", title: "Update failed", description: error.message })
    return
  }
  await reloadWeeklyTasks()
  toast({ variant: "success", title: "Priority updated", description: `Set to ${priority}` })
}

// --- persist monthly priority to Supabase ---
const handleInlinePriorityChangeMonthly = async (
  taskId: string,
  priority: "High" | "Mid" | "Low"
) => {
  const { error } = await supabase
    .from("monthly_tasks")
    .update({ priority })
    .eq("id", taskId)

  if (error) {
    toast({ variant: "destructive", title: "Update failed", description: error.message })
    return
  }
  // refresh local state
  setMonthlyTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, priority } : t)))
  toast({ variant: "success", title: "Priority updated", description: `Set to ${priority}` })
}


// quick inline priority change for a row
const handleInlinePriorityChange = (
  taskId: string,
  priority: "High" | "Mid" | "Low"
) => {
  const t = tasks.find((x) => x.id === taskId)
  if (!t) return
  updateTask({ ...t, priority })
  toast({ variant: "success", title: "Priority updated", description: `Set to ${priority}` })
}

// when changing company in the full dialog, keep name + id in sync
const handleEditCompanyChange = (newCompanyId: string) => {
  if (!activeTask) return
  const c = companies.find((cc) => cc.id === newCompanyId)
  if (!c) return
  setActiveTask((prev: any) => ({ ...prev, companyId: newCompanyId, company: c.name }))
}

// Formats today's date as MM-DD-YYYY (US)
const getUSDateStamp = () =>
  new Date()
    .toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\//g, "-")


  const handleAddTask = async () => {
  if (!user) {
    toast({ variant: "destructive", title: "Error", description: "User not logged in. Please refresh or log in." })
    return
  }
  if (!newTask.companyId) {
    toast({ variant: "destructive", title: "Select company", description: "Please choose a company for the task." })
    return
  }

  // Get selected company name for one-time tasks
  const selectedCompany = companies.find((c) => c.id === newTask.companyId)

  try {
    if (newTask.taskType === "Monthly") {
      const { error } = await supabase.from("monthly_tasks").insert({
        title: newTask.title,
        company_id: newTask.companyId,
        due_date: newTask.dueDate,
        priority: newTask.priority,
        status: newTask.status,
        description: newTask.description,
        category: newTask.category,
        tags: [newTask.category],
        created_by: user.id,
      })
      if (error) throw error
      await fetchMonthlyTasks()

    } else if (newTask.taskType === "Weekly") {
      const { error } = await supabase.from("weekly_tasks").insert({
        title: newTask.title,
        company_id: newTask.companyId,
        due_date: newTask.dueDate,
        priority: newTask.priority,
        status: newTask.status,
        description: newTask.description,
        category: newTask.category,
        tags: [newTask.category],
        created_by: user.id,
      })
      if (error) throw error
      await reloadWeeklyTasks()

    } else {
      // One-time: use Task context
      addTask({
        title: newTask.title,
        company: selectedCompany?.name || "Unknown",
        companyId: newTask.companyId,
        dueDate: newTask.dueDate,
        priority: newTask.priority as "High" | "Mid" | "Low",
        status: newTask.status as "Completed" | "In Progress" | "Not Started",
        description: newTask.description,
        category: newTask.category,
        tags: [newTask.category],
        created_by: user.id,
      })
    }

    // Reset form and close
    setNewTask({
      title: "",
      category: "",
      priority: "Mid",
      status: "Not Started",
      dueDate: new Date().toISOString().split("T")[0],
      description: "",
      taskType: "One-time",
      companyId: "",
    })
    setIsAddTaskOpen(false)

    toast({ variant: "success", title: "Success", description: "Task added successfully!" })
  } catch (err: any) {
    console.error(err)
    toast({ variant: "destructive", title: "Error", description: err?.message || "Failed to add task" })
  }
}


//   const handlePrintAllTasks = () => {
//   const node = allTasksRef.current
//   if (!node) {
//     window.print()
//     return
//   }
//   const content = node.innerHTML
//   const printWindow = window.open("", "", "width=900,height=650")
//   if (!printWindow) return
//   printWindow.document.write(`
//     <!doctype html>
//     <html>
//       <head>
//         <title>All Tasks</title>
//         <style>
//           body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 20px; }
//           table { width: 100%; border-collapse: collapse; }
//           th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
//           thead th { background: #f8fafc; }
//         </style>
//       </head>
//       <body>
//         <h2>All Tasks</h2>
//         ${content}
//       </body>
//     </html>
//   `)
//   printWindow.document.close()
//   printWindow.focus()
//   printWindow.print()
//   printWindow.close()
// }
const handlePrintAllTasks = () => {
  const node = allTasksRef.current
  const stamp = getUSDateStamp()
  const title = `All_Tasks_${stamp}`

  if (!node) {
    // Fallback: still set the title so PDF export gets the right name
    document.title = title
    window.print()
    return
  }

  const content = node.innerHTML
  const printWindow = window.open("", "", "width=900,height=650")
  if (!printWindow) return

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${title}</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 20px; }
          h2 { margin: 0 0 12px 0; }
          .subtle { color:#6b7280; font-size: 12px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
          thead th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h2>All Tasks</h2>
        <div class="subtle">Generated on ${stamp}</div>
        ${content}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}


// const handleExportDoc = () => {
//   const node = allTasksRef.current
//   if (!node) return
//   const htmlDoc = `
//     <!doctype html>
//     <html>
//       <head>
//         <meta charset="utf-8" />
//         <title>All Tasks</title>
//         <style>
//           table { width: 100%; border-collapse: collapse; }
//           th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
//           thead th { background: #f8fafc; }
//         </style>
//       </head>
//       <body>
//         <h2>All Tasks</h2>
//         ${node.innerHTML}
//       </body>
//     </html>`
//   const blob = new Blob([htmlDoc], { type: "application/msword" })
//   const url = URL.createObjectURL(blob)
//   const a = document.createElement("a")
//   a.href = url
//   a.download = "All_Tasks.doc"
//   document.body.appendChild(a)
//   a.click()
//   URL.revokeObjectURL(url)
//   a.remove()
// }

const restoreWeeklyTask = async (taskId: string) => {
  const { error } = await supabase.from("weekly_tasks").update({ status: "Not Started" }).eq("id", taskId)
  if (error) return toast({ variant: "destructive", title: "Restore failed", description: error.message })
  await reloadWeeklyTasks()
  toast({ variant: "success", title: "Restored", description: "Task restored from Deleted." })
}

const restoreMonthlyTask = async (taskId: string) => {
  const { error } = await supabase.from("monthly_tasks").update({ status: "Not Started" }).eq("id", taskId)
  if (error) return toast({ variant: "destructive", title: "Restore failed", description: error.message })
  setMonthlyTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "Not Started" } : t))
  toast({ variant: "success", title: "Restored", description: "Task restored from Deleted." })
}

const handleExportDoc = () => {
  const node = allTasksRef.current
  if (!node) return

  const stamp = getUSDateStamp()
  const title = `All_Tasks_${stamp}`

  const htmlDoc = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
          h2 { margin: 0 0 12px 0; }
          .subtle { color:#6b7280; font-size: 12px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
          thead th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h2>All Tasks</h2>
        <div class="subtle">Generated on ${stamp}</div>
        ${node.innerHTML}
      </body>
    </html>`

  const blob = new Blob([htmlDoc], { type: "application/msword" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title}.doc`   // ← filename includes today's US date
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  a.remove()
}


  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Monthly recurring tasks data - Update "Pending" to "Not Started"
  

 // Filter tasks (one-time) based on view mode, search query, and filters
const filteredTasks = tasks.filter((task) => {
  // Require logged-in user AND ownership (blocks legacy/ownerless rows)
  if (!currentUserId) return false
  if (!task?.created_by || task.created_by !== currentUserId) return false

  // View-mode filter
  if (viewMode !== "all") {
    if (viewMode === "not_started" && task.status !== "Not Started") return false
    if (viewMode === "in_progress" && task.status !== "In Progress") return false
    if (viewMode === "completed" && task.status !== "Completed") return false
    if (viewMode === "deleted") return false            // deleted list handled separately
  } else {
    // "All Tasks" = everything except Deleted
    if (task.status === "Deleted") return false
  }

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    const inTitle = (task.title ?? "").toLowerCase().includes(q)
    const inCat   = (task.category ?? "").toLowerCase().includes(q)
    if (!inTitle && !inCat) return false
  }

  // Priority filter
  if (priorityFilter !== "all" && task.priority !== priorityFilter) return false

  // Global status dropdown filter
  if (statusFilter !== "all" && task.status !== statusFilter) return false

  return true
})


// Filter deleted tasks (one-time) based on search query and filters
const filteredDeletedTasks = deletedTasks.filter((task) => {
  // Require ownership where available (in case deletedTasks contains mixed owners)
  if (!currentUserId) return false
  if (!task?.created_by || task.created_by !== currentUserId) return false

  // Ensure it's actually deleted (defensive)
  if (task.status !== "Deleted") return false

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    const inTitle = (task.title ?? "").toLowerCase().includes(q)
    const inCat   = (task.category ?? "").toLowerCase().includes(q)
    if (!inTitle && !inCat) return false
  }

  // Priority
  if (priorityFilter !== "all" && task.priority !== priorityFilter) return false

  return true
})


// Filter monthly tasks based on view mode, search query, and filters
const filteredMonthlyTasks = monthlyTasks.filter((task) => {
  // Show only MY tasks when created_by exists.
  // Allow older rows that don't have created_by (so they don't disappear).
  if (!currentUserId) return false
  if (task?.created_by && task.created_by !== currentUserId) return false

  // View-mode filter
  if (monthlyViewMode !== "all") {
    if (monthlyViewMode === "not_started" && task.status !== "Not Started") return false;
    if (monthlyViewMode === "in_progress" && task.status !== "In Progress") return false;
    if (monthlyViewMode === "completed" && task.status !== "Completed") return false;
    if (monthlyViewMode === "deleted" && task.status !== "Deleted") return false;
  } else {
    // "All" = hide deleted
    if (task.status === "Deleted") return false;
  }

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const inTitle = (task.title ?? "").toLowerCase().includes(q);
    const inCat   = (task.category ?? "").toLowerCase().includes(q);
    if (!inTitle && !inCat) return false;
  }

  // Global filters
  if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
  if (statusFilter !== "all" && task.status !== statusFilter) return false;

  return true;
});


// Filter weekly tasks based on view mode, search query, and filters
const filteredWeeklyTasks = weeklyTasks.filter((task) => {
  // Require logged-in user AND ownership
  if (!currentUserId) return false
  if (!task?.created_by || task.created_by !== currentUserId) return false

  // View-mode filter
  if (weeklyViewMode !== "all") {
    if (weeklyViewMode === "not_started" && task.status !== "Not Started") return false
    if (weeklyViewMode === "in_progress" && task.status !== "In Progress") return false
    if (weeklyViewMode === "completed" && task.status !== "Completed") return false
    if (weeklyViewMode === "deleted" && task.status !== "Deleted") return false
  } else {
    // "All Tasks" = everything except Deleted
    if (task.status === "Deleted") return false
  }

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    const inTitle = (task.title ?? "").toLowerCase().includes(q)
    const inCat   = (task.category ?? "").toLowerCase().includes(q)
    if (!inTitle && !inCat) return false
  }

  // Priority
  if (priorityFilter !== "all" && task.priority !== priorityFilter) return false

  // Global status dropdown filter
  if (statusFilter !== "all" && task.status !== statusFilter) return false

  return true
})


const exportFilteredDoc = () => {
  type Row = {
    title: string
    company: string
    category: string
    priority: "High" | "Mid" | "Low"
    status: string
    dueDate?: string
  }
  const rows: Row[] = []

  const inRange = (iso?: string|null) => {
    if (!iso) return true
    const d = (iso || "").slice(0, 10) // YYYY-MM-DD
    if (dateFrom && d < dateFrom) return false
    if (dateTo   && d > dateTo)   return false
    return true
  }

  const pushFrom = (list: any[], kind: SelType) => {
    for (const t of list ?? []) {
      // owner guard
      if (!currentUserId || !t?.created_by || t.created_by !== currentUserId) continue

      const company  = t.company ?? t.company_name ?? t.companyName ?? (t.companies?.name ?? "")
      const category = t.category ?? ""
      const priority = (t.priority ?? "").toString() as "High"|"Mid"|"Low"
      const status   = t.status ?? ""
      const due      = t.dueDate ?? t.due_date ?? null

      // Deleted semantics
      const isDeleted = status === "Deleted"
      if (kind === "deleted" && !isDeleted) continue
      if (kind !== "deleted" && isDeleted) continue

      // filters
      if (selCompanies.size && company && !selCompanies.has(company)) continue
      if (selPriorities.size && priority && !selPriorities.has(priority)) continue
      if (selCategories.size && category && !selCategories.has(category)) continue
      if (!inRange(due)) continue

      rows.push({
        title: t.title ?? "",
        company,
        category,
        priority,
        status,
        dueDate: due ? String(due).slice(0, 10) : "",
      })
    }
  }

  if (selTypes.has("one"))     pushFrom(tasks,        "one")
  if (selTypes.has("weekly"))  pushFrom(weeklyTasks,  "weekly")
  if (selTypes.has("monthly")) pushFrom(monthlyTasks, "monthly")
  if (selTypes.has("deleted")) {
    pushFrom(tasks,        "deleted")
    pushFrom(weeklyTasks,  "deleted")
    pushFrom(monthlyTasks, "deleted")
    pushFrom(deletedTasks, "deleted")
  }

  // Boxed table CSS (Word-friendly)
  const html = `
  <!doctype html>
  <html><head><meta charset="utf-8">
  <style>
    body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; margin: 20px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1pt solid #000; padding: 6px 8px; vertical-align: top; }
    th { background: #f3f4f6; text-align: left; }
    .w-task { width: 32%; } .w-company { width: 18%; } .w-cat { width: 16%; }
    .w-pri { width: 10%; } .w-status { width: 14%; } .w-due { width: 10%; }
  </style></head>
  <body>
    <table>
      <thead>
        <tr>
          <th class="w-task">Task</th>
          <th class="w-company">Company</th>
          <th class="w-cat">Category</th>
          <th class="w-pri">Priority</th>
          <th class="w-status">Status</th>
          <th class="w-due">Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.title}</td>
            <td>${r.company}</td>
            <td>${r.category}</td>
            <td>${r.priority}</td>
            <td>${r.status}</td>
            <td>${r.dueDate ?? ""}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  </body></html>`

  const title = `Tasks_${new Date().toLocaleDateString("en-GB").replace(/\//g,"-")}`
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = `${title}.doc`; a.click()
  URL.revokeObjectURL(url)
  setExportOpen(false)
}

// const exportFilteredDoc = () => {
//   // 1) Build combined source respecting selected task types
//   type Row = { title:string; company:string; category:string; priority:"High"|"Mid"|"Low"; status:string; dueDate?:string; };
//   const rows: Row[] = [];

//   const add = (list: any[], kind: "one"|"weekly"|"monthly") => {
//     for (const t of list ?? []) {
//       const company = t.company ?? t.company_name ?? t.companyName ?? "";
//       const priority = (t.priority ?? "").toString() as "High"|"Mid"|"Low";
//       const status   = t.status ?? "";
//       const category = t.category ?? "";
//       const due      = t.dueDate ?? t.due_date ?? null;

//       if (!selPriorities.has(priority)) continue;
//       if (selCompanies.size && company && !selCompanies.has(company)) continue;
//       if (!inRange(due ?? undefined)) continue;

//       rows.push({
//         title: t.title ?? t.task ?? "",
//         company,
//         category,
//         priority,
//         status,
//         dueDate: due ? String(due).slice(0,10) : "",
//       });
//     }
//   };

//   if (selTypes.has("one"))    add(tasks, "one");
//   if (selTypes.has("weekly")) add(weeklyTasks, "weekly");
//   if (selTypes.has("monthly"))add(monthlyTasks, "monthly");

//   // 2) Build HTML (kept close to your current .doc structure)
//   const today = new Date();
//   const dd = String(today.getDate()).padStart(2, "0");
//   const mm = String(today.getMonth()+1).padStart(2, "0");
//   const yyyy = today.getFullYear();
//   const fname = `Tasks_${dd}-${mm}-${yyyy}.doc`;

//   const pill = (text: string, color: "high"|"mid"|"low"|"done"|"prog"|"not") => {
//     const map:any = {
//       high: { bg:"#b45e08", fg:"#fff" },
//       mid:  { bg:"#f2994a", fg:"#fff" },
//       low:  { bg:"#6b7280", fg:"#fff" },
//       done: { bg:"#476E2C", fg:"#fff" },
//       prog: { bg:"#6AA84F", fg:"#fff" },
//       not:  { bg:"#C9E4A4", fg:"#fff" },
//     };
//     const {bg,fg} = map[color];
//     return `<span style="display:inline-flex;align-items:center;justify-content:center;height:32px;min-width:120px;border-radius:8px;padding:2px 12px;background:${bg};color:${fg};font-weight:600;">${text}</span>`;
//   };

//   const priorityPill = (p:"High"|"Mid"|"Low") =>
//     p==="High" ? pill("High","high") : p==="Mid" ? pill("Mid","mid") : pill("Low","low");
//   const statusPill = (s:string) => {
//     const k = s.toLowerCase();
//     if (k.includes("complete")) return pill("Completed","done");
//     if (k.includes("progress")) return pill("In Progress","prog");
//     return pill("Not Started","not");
//   };

//   const header = `
//   <!doctype html><html><head><meta charset="utf-8"/>
//   <title>Tasks Export</title>
//   <style>
//     body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
//     h2{margin:0 0 12px} .subtle{color:#6b7280;font-size:12px;margin-bottom:12px}
//     table{width:100%;border-collapse:collapse}
//     th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left}
//     thead th{background:#f8fafc}
//   </style></head><body>
//   <h2>Tasks Export</h2>
//   <div class="subtle">Generated on ${dd}-${mm}-${yyyy}</div>`;

//   const table = `
//   <div class="relative w-full overflow-auto">
//   <table class="w-full caption-bottom text-sm">
//     <thead><tr>
//       <th class="w-[220px]">Task</th>
//       <th class="w-[200px]">Company Name</th>
//       <th class="w-[150px]">Category</th>
//       <th class="w-[120px]">Priority</th>
//       <th class="w-[140px]">Status</th>
//       <th class="w-[160px]">Due Date</th>
//     </tr></thead>
//     <tbody>
//       ${rows.map(r => `
//         <tr>
//           <td class="font-medium">${r.title || ""}</td>
//           <td>${r.company || ""}</td>
//           <td>${r.category || ""}</td>
//           <td>${priorityPill(r.priority)}</td>
//           <td>${statusPill(r.status || "")}</td>
//           <td>${r.dueDate || ""}</td>
//         </tr>`).join("")}
//     </tbody>
//   </table>
//   </div>`;

//   const html = `${header}${table}</body></html>`;

//   // 3) Download as .doc
//   const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url; a.download = fname; a.click();
//   URL.revokeObjectURL(url);

//   setExportOpen(false);
// };  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Task List</h1>

      {/* Search and Filter */}
      <TaskSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* All Tasks Card */}
      <Card className="shadow-sm">
        {/* <CardHeader>
          <CardTitle className="text-lg">All Tasks</CardTitle>
        </CardHeader> */}
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
  <CardTitle className="text-lg">All Tasks</CardTitle>

  <div className="flex items-center gap-2">
    {/* NEW: Add New Task (inline dialog form) */}
    <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl">
          <Plus className="h-4 w-4 mr-1" /> Add New Task
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Company (select any company here, unlike the company page where it’s locked) */}
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Select
              value={newTask.companyId}
              onValueChange={(value) => setNewTask({ ...newTask, companyId: value })}
            >
              <SelectTrigger id="company" className="rounded-none">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              placeholder="Enter task name"
              className="rounded-none"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={newTask.category}
              onValueChange={(value) => setNewTask({ ...newTask, category: value })}
            >
              <SelectTrigger id="category" className="rounded-none">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger id="priority" className="rounded-none">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Mid">Mid</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) => setNewTask({ ...newTask, status: value })}
              >
                <SelectTrigger id="status" className="rounded-none">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select
              value={newTask.taskType}
              onValueChange={(value) => setNewTask({ ...newTask, taskType: value })}
            >
              <SelectTrigger id="taskType" className="rounded-none">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="One-time">One-time</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              className="rounded-none"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter task notes"
              className="rounded-none"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          <Button
            type="button"
            className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl mt-2"
            onClick={handleAddTask}
          >
            Add Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Keep your existing Print / Export actions */}
    <Button variant="outline" className="rounded-xl" onClick={handlePrintAllTasks}>
      <Printer className="h-4 w-4 mr-2" />
      Print
    </Button>

    <Button variant="outline" onClick={() => setExportOpen(true)}>
      <Download className="mr-2 h-4 w-4" /> Export (.doc)
    </Button>

  </div>
</CardHeader>

        <CardContent>
          {/* <div className="overflow-x-auto"> */}
          <div className="overflow-x-auto" ref={allTasksRef}>
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead className="w-[220px]">Task</TableHead>
                <TableHead className="w-[200px]">Company Name</TableHead>
                <TableHead className="w-[150px]">Category</TableHead>
                <TableHead className="w-[120px]">Priority</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[160px]">Due Date</TableHead>
                  {viewMode === "deleted" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewMode === "deleted"
                  ? filteredDeletedTasks.map((task) => (
                      <TableRow
                        key={task.id}
                        onClick={() => router.push(`/dashboard/task/${task.id}?kind=one-time`)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.company}</TableCell>
                        <TableCell>
                          {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
  <Select
    value={task.priority}
    onValueChange={(value) =>
      handleInlinePriorityChange(task.id, value as "High" | "Mid" | "Low")
    }
  >
    <SelectTrigger
      className={`h-8 w-[120px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getPriorityBadgeStyle(task.priority)} text-white`}
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="High">High</SelectItem>
      <SelectItem value="Mid">Mid</SelectItem>
      <SelectItem value="Low">Low</SelectItem>
    </SelectContent>
  </Select>
</TableCell>


                        {/* IMPORTANT: don’t navigate when changing status */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={task.status}
                            onValueChange={(value) =>
                              handleInlineStatusChange(task.id, value as "Completed" | "In Progress" | "Not Started")
                            }
                          >
                            <SelectTrigger
                              className={`h-8 w-[150px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getStatusBadgeStyle(task.status)} text-white`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="Deleted">Deleted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl"
                          onClick={() => restoreTask(task.id)}
                        >
                          <Undo2 className="h-4 w-4 mr-1" /> Restore
                        </Button>
                      </TableCell>

                      </TableRow>

                      // <TableRow key={task.id} onDoubleClick={() => openEdit(task)} className="cursor-pointer">
                      //   <TableCell className="font-medium">{task.title}</TableCell>
                      //   <TableCell>{task.company}</TableCell>
                      //   <TableCell>
                      //     {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                      //   </TableCell>
                      //   <TableCell>
                      //     <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                      //   </TableCell>
                      //   <TableCell>
                      //     <Select
                      //       value={task.status}
                      //       onValueChange={(value) =>
                      //         handleInlineStatusChange(task.id, value as "Completed" | "In Progress" | "Not Started")
                      //       }
                      //     >
                      //       <SelectTrigger
                      //         className={`h-8 w-[150px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getStatusBadgeStyle(task.status)} text-white`}
                      //       >
                      //         <SelectValue />
                      //       </SelectTrigger>
                      //       <SelectContent>
                      //         <SelectItem value="Completed">Completed</SelectItem>
                      //         <SelectItem value="In Progress">In Progress</SelectItem>
                      //         <SelectItem value="Not Started">Not Started</SelectItem>
                      //       </SelectContent>
                      //     </Select>
                      //   </TableCell>
                      //   <TableCell>{task.dueDate}</TableCell>
                      //   <TableCell>
                      //     <Button
                      //       variant="outline"
                      //       size="sm"
                      //       className="h-8 rounded-xl"
                      //       onClick={() => restoreTask(task.id)}
                      //     >
                      //       <Undo2 className="h-4 w-4 mr-1" /> Restore
                      //     </Button>
                      //   </TableCell>
                      // </TableRow>
                    ))
                  : filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    onClick={() => router.push(`/dashboard/task/${task.id}?kind=one`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.company}</TableCell>
                    <TableCell>
                      {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
  <Select
    value={task.priority}
    onValueChange={(value) =>
      handleInlinePriorityChange(task.id, value as "High" | "Mid" | "Low")
    }
  >
    <SelectTrigger
      className={`h-8 w-[120px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getPriorityBadgeStyle(task.priority)} text-white`}
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="High">High</SelectItem>
      <SelectItem value="Mid">Mid</SelectItem>
      <SelectItem value="Low">Low</SelectItem>
    </SelectContent>
  </Select>
</TableCell>


                    {/* prevent row navigation when changing status */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          handleInlineStatusChange(task.id, value as "Completed" | "In Progress" | "Not Started")
                        }
                      >
                        <SelectTrigger
                          className={`h-8 w-[150px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getStatusBadgeStyle(task.status)} text-white`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="Deleted">Deleted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>{task.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Edit Task</DialogTitle>
    </DialogHeader>

    {activeTask && (
      <div className="grid gap-4 py-4">
        {/* Task Name */}
        <div className="grid gap-2">
          <Label htmlFor="editTaskName">Task Name</Label>
          <Input
            id="editTaskName"
            className="rounded-none"
            value={activeTask.title}
            onChange={(e) => setActiveTask({ ...activeTask, title: e.target.value })}
          />
        </div>

        {/* Company */}
        <div className="grid gap-2">
          <Label htmlFor="editCompany">Company</Label>
          <Select
            value={String(activeTask.companyId ?? "")}
            onValueChange={handleEditCompanyChange}
          >
            <SelectTrigger id="editCompany" className="rounded-none">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="grid gap-2">
          <Label htmlFor="editCategory">Category</Label>
          <Select
            value={activeTask.category || ""}
            onValueChange={(v) => setActiveTask({ ...activeTask, category: v, tags: [v] })}
          >
            <SelectTrigger id="editCategory" className="rounded-none">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="editPriority">Priority</Label>
            <Select
              value={activeTask.priority}
              onValueChange={(v) =>
                setActiveTask({ ...activeTask, priority: v as "High" | "Mid" | "Low" })
              }
            >
              <SelectTrigger id="editPriority" className="rounded-none">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Mid">Mid</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="editStatus">Status</Label>
            <Select
              value={activeTask.status}
              onValueChange={(v) =>
                setActiveTask({
                  ...activeTask,
                  status: v as "Completed" | "In Progress" | "Not Started",
                })
              }
            >
              <SelectTrigger id="editStatus" className="rounded-none">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div className="grid gap-2">
          <Label htmlFor="editDueDate">Due Date</Label>
          <Input
            id="editDueDate"
            type="date"
            className="rounded-none"
            value={activeTask.dueDate}
            onChange={(e) => setActiveTask({ ...activeTask, dueDate: e.target.value })}
          />
        </div>

        {/* Notes */}
        <div className="grid gap-2">
          <Label htmlFor="editNotes">Notes</Label>
          <Textarea
            id="editNotes"
            className="rounded-none"
            value={activeTask.description ?? ""}
            onChange={(e) => setActiveTask({ ...activeTask, description: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              if (!activeTask?.id) return
              deleteTask(activeTask.id)
              toast({ variant: "success", title: "Deleted", description: "Task deleted." })
              setEditOpen(false)
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete Task
          </Button>

          <Button
            type="button"
            className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl"
            onClick={saveActiveTask}
          >
            Save Changes
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>


          <div className="flex flex-wrap gap-4 mt-6">
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              className={viewMode === "all" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setViewMode("all")}
            >
              All Tasks
            </Button>
            <Button
              variant={viewMode === "not_started" ? "default" : "outline"}
              className={viewMode === "not_started" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setViewMode("not_started")}
            >
              Not Started Tasks
            </Button>
            <Button
              variant={viewMode === "in_progress" ? "default" : "outline"}
              className={viewMode === "in_progress" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setViewMode("in_progress")}
            >
              In Progress Tasks
            </Button>
            <Button
              variant={viewMode === "completed" ? "default" : "outline"}
              className={viewMode === "completed" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setViewMode("completed")}
            >
              View Completed Tasks
            </Button>
            <Button
              variant={viewMode === "deleted" ? "default" : "outline"}
              className={viewMode === "deleted" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setViewMode("deleted")}
            >
              View Deleted Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-[620px]">
  <DialogHeader>
    <DialogTitle>Export Filters</DialogTitle>
    <DialogDescription>Choose what to include in the .doc export.</DialogDescription>
  </DialogHeader>

  <div className="grid gap-6 py-2">
    {/* Task type */}
    <section>
      <div className="text-sm font-medium mb-2">Task type</div>
      <div className="grid grid-cols-2 gap-3">
        {[
          {k:"one",     label:"One-time"},
          {k:"weekly",  label:"Weekly"},
          {k:"monthly", label:"Monthly"},
          {k:"deleted", label:"Deleted"},
        ].map(({k,label}) => (
          <button
            key={k}
            type="button"
            onClick={() => toggleInSet(selTypes, k as SelType, setSelTypes)}
            className={`px-3 py-2 rounded-md border text-left ${selTypes.has(k as SelType) ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>

    {/* Priority */}
    <section>
      <div className="text-sm font-medium mb-2">Priority</div>
      <div className="grid grid-cols-3 gap-3">
        {(["High","Mid","Low"] as const).map(p => (
          <button
            key={p}
            type="button"
            onClick={() => toggleInSet(selPriorities, p, setSelPriorities)}
            className={`px-3 py-2 rounded-md border text-left ${selPriorities.has(p) ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}
          >
            {p}
          </button>
        ))}
      </div>
    </section>

    {/* Company with All/Clear */}
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Company</div>
        <div className="text-xs space-x-3">
          <button className="underline" onClick={() => setAll(allCompanies, setSelCompanies)}>All</button>
          <button className="underline" onClick={() => clearAll(setSelCompanies)}>Clear</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {allCompanies.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => toggleInSet(selCompanies, c, setSelCompanies)}
            className={`px-3 py-2 rounded-md border text-left ${selCompanies.has(c) ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}
          >
            {c}
          </button>
        ))}
      </div>
    </section>

    {/* NEW: Category with All/Clear */}
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Category</div>
        <div className="text-xs space-x-3">
          <button className="underline" onClick={() => setAll(allCategories, setSelCategories)}>All</button>
          <button className="underline" onClick={() => clearAll(setSelCategories)}>Clear</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {allCategories.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => toggleInSet(selCategories, c, setSelCategories)}
            className={`px-3 py-2 rounded-md border text-left ${selCategories.has(c) ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}
          >
            {c}
          </button>
        ))}
      </div>
    </section>

    {/* Date range */}
    <section className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-sm mb-1">From</div>
        <input type="date" className="w-full border rounded-md px-3 py-2"
               value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
      </div>
      <div>
        <div className="text-sm mb-1">To</div>
        <input type="date" className="w-full border rounded-md px-3 py-2"
               value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
      </div>
    </section>

    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={()=>setExportOpen(false)}>Cancel</Button>
      <Button onClick={exportFilteredDoc}>
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
    </div>
  </div>
</DialogContent>
      </Dialog>


      {/* Weekly Occurring Tasks Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Occurring Tasks</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Task</TableHead>
                  <TableHead className="w-[200px]">Company Name</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[120px]">Priority</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[160px]">Due Date</TableHead>
                  {weeklyViewMode === "deleted" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredWeeklyTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    onClick={() => router.push(`/dashboard/task/${task.id}?kind=weekly`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.company}</TableCell>

                    <TableCell>
                      {task.category && (
                        <Badge className={getCategoryStyle(task.category)}>
                          {task.category}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Priority (inline) */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={task.priority}
                        onValueChange={(value) =>
                          handleInlinePriorityChangeWeekly(
                            task.id,
                            value as "High" | "Mid" | "Low"
                          )
                        }
                      >
                        <SelectTrigger
                          className={`h-8 w-[120px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getPriorityBadgeStyle(
                            task.priority
                          )} text-white`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Mid">Mid</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Status (inline) */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          handleInlineStatusChangeWeekly(
                            task.id,
                            value as "Completed" | "In Progress" | "Not Started" | "Deleted"
                          )
                        }
                      >
                        <SelectTrigger
                          className={`h-8 w-[150px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getStatusBadgeStyle(
                            task.status
                          )} text-white`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="Deleted">Deleted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Occurrence text: "Monday of every week" */}
                    <TableCell>
                      {(() => {
                        const raw = (task as any).due_date ?? (task as any).dueDate
                        if (!raw) return ""

                        // build a date in local time from YYYY-MM-DD
                        const d = String(raw).slice(0, 10)
                        const [yy, mm, dd] = d.split("-").map((n) => parseInt(n, 10))
                        const dt = new Date(yy, (mm ?? 1) - 1, dd ?? 1)
                        if (Number.isNaN(dt.getTime())) return ""

                        const weekday = dt.toLocaleDateString("en-US", { weekday: "long" })
                        return (
                          <span className="whitespace-nowrap">
                            {weekday} <span className="lowercase">of every week</span>
                          </span>
                        )
                      })()}
                    </TableCell>

                    {/* Restore only in Deleted view */}
                    {weeklyViewMode === "deleted" && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl"
                          onClick={() => restoreWeeklyTask(task.id)}
                        >
                          <Undo2 className="h-4 w-4 mr-1" /> Restore
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Button
              variant={weeklyViewMode === "all" ? "default" : "outline"}
              className={weeklyViewMode === "all" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setWeeklyViewMode("all")}
            >
              All Tasks
            </Button>
            <Button
              variant={weeklyViewMode === "not_started" ? "default" : "outline"}
              className={weeklyViewMode === "not_started" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setWeeklyViewMode("not_started")}
            >
              Not Started Tasks
            </Button>
            <Button
              variant={weeklyViewMode === "in_progress" ? "default" : "outline"}
              className={weeklyViewMode === "in_progress" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setWeeklyViewMode("in_progress")}
            >
              In Progress Tasks
            </Button>
            <Button
              variant={weeklyViewMode === "completed" ? "default" : "outline"}
              className={weeklyViewMode === "completed" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setWeeklyViewMode("completed")}
            >
              View Completed Tasks
            </Button>
            <Button
              variant={weeklyViewMode === "deleted" ? "default" : "outline"}
              className={weeklyViewMode === "deleted" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setWeeklyViewMode("deleted")}
            >
              View Deleted Tasks
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Monthly Occurring Tasks Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Occurring Tasks</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Task</TableHead>
                  <TableHead className="w-[200px]">Company Name</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[120px]">Priority</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[160px]">Due Date</TableHead>
                  {monthlyViewMode === "deleted" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMonthlyTasks.map((task) => {
                  const day = task.due_date ? new Date(task.due_date).getDate() : undefined
                  const dueText =
                    typeof day === "number" ? (
                      <>
                        {day}
                        <sup>{getDaySuffix(day)}</sup> of every month
                      </>
                    ) : (
                      ""
                    )

                  return (
                    <TableRow
                      key={task.id}
                      onClick={() => router.push(`/dashboard/task/${task.id}?kind=monthly`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{task.title}</TableCell>

                      <TableCell>
                        {task.company ??
                          task.company_name ??
                          task.companyName ??
                          task.companies?.name ??
                          ""}
                      </TableCell>

                      <TableCell>
                        {task.category && (
                          <Badge className={getCategoryStyle(task.category)}>
                            {task.category}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Priority (inline) */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={task.priority}
                          onValueChange={(value) =>
                            handleInlinePriorityChangeMonthly(
                              task.id,
                              value as "High" | "Mid" | "Low"
                            )
                          }
                        >
                          <SelectTrigger
                            className={`h-8 w-[120px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getPriorityBadgeStyle(
                              task.priority
                            )} text-white`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Mid">Mid</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Status (inline) */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            handleInlineStatusChangeMonthly(
                              task.id,
                              value as "Completed" | "In Progress" | "Not Started" | "Deleted"
                            )
                          }
                        >
                          <SelectTrigger
                            className={`h-8 w-[150px] rounded-full px-3 border-0 shadow-none focus:ring-0 ${getStatusBadgeStyle(
                              task.status
                            )} text-white`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="Deleted">Deleted</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>{dueText}</TableCell>

                      {/* Restore only in Deleted view */}
                      {monthlyViewMode === "deleted" && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-xl"
                            onClick={() => restoreMonthlyTask(task.id)}
                          >
                            <Undo2 className="h-4 w-4 mr-1" /> Restore
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Button
              variant={monthlyViewMode === "all" ? "default" : "outline"}
              className={monthlyViewMode === "all" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setMonthlyViewMode("all")}
            >
              All Tasks
            </Button>
            <Button
              variant={monthlyViewMode === "not_started" ? "default" : "outline"}
              className={monthlyViewMode === "not_started" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setMonthlyViewMode("not_started")}
            >
              Not Started Tasks
            </Button>
            <Button
              variant={monthlyViewMode === "in_progress" ? "default" : "outline"}
              className={monthlyViewMode === "in_progress" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setMonthlyViewMode("in_progress")}
            >
              In Progress Tasks
            </Button>
            <Button
              variant={monthlyViewMode === "completed" ? "default" : "outline"}
              className={monthlyViewMode === "completed" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setMonthlyViewMode("completed")}
            >
              View Completed Tasks
            </Button>
            <Button
              variant={monthlyViewMode === "deleted" ? "default" : "outline"}
              className={monthlyViewMode === "deleted" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setMonthlyViewMode("deleted")}
            >
              View Deleted Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
export default function TaskListPage() {
  return (
    <WeeklyTaskProvider>
      <TaskListContent />
    </WeeklyTaskProvider>
  )
}

