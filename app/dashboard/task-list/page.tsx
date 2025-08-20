"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CATEGORIES, getCategoryStyle } from "@/utils/category-styles"
import { Undo2 } from "lucide-react"
import { useTasks } from "@/contexts/task-context"
import { WeeklyTaskProvider, useWeeklyTasks } from "@/contexts/weekly-task-context"
import TaskSearchFilter from "@/components/task-search-filter"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Printer, Download } from "lucide-react"
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
  const { tasks, deletedTasks, restoreTask, addTask } = useTasks()
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
    .select(`
      *,
      companies ( name )
    `)
  if (!error) setMonthlyTasks(data || [])
  else console.error("Failed to fetch monthly tasks:", error)
}

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
  

  // Filter tasks based on view mode, search query, and filters
  const filteredTasks = tasks.filter((task) => {
    // Only show tasks created by the logged-in user
    if (task.created_by !== currentUserId) return false
  
    // Filter by view mode
    if (viewMode !== "all") {
      if (viewMode === "not_started" && task.status !== "Not Started") return false
      if (viewMode === "in_progress" && task.status !== "In Progress") return false
      if (viewMode === "completed" && task.status !== "Completed") return false
      if (viewMode === "deleted") return false
    }
  
    // Filter by search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false
  
    // Filter by priority
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
  
    // Filter by status
    if (statusFilter !== "all" && task.status !== statusFilter) return false
  
    return true
  })
  

  // Filter deleted tasks based on search query and filters
  const filteredDeletedTasks = deletedTasks.filter((task) => {
    // Filter by search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by priority
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false

    return true
  })

  // Filter monthly tasks based on view mode, search query, and filters
  const filteredMonthlyTasks = monthlyTasks.filter((task) => {
    // Only show tasks created by the logged-in user
    if (task.created_by !== currentUserId) return false
  
    // Filter by view mode
    // if (monthlyViewMode === "not_started" && task.status !== "Not Started") return false
    // if (monthlyViewMode === "in_progress" && task.status !== "In Progress") return false
    // if (monthlyViewMode === "completed" && task.status !== "Completed") return false
    // if (monthlyViewMode === "deleted" && task.status !== "Deleted") return false
    // if (monthlyViewMode === "completed" && task.status !== "Completed") return false
    // if (monthlyViewMode === "deleted" && task.status !== "Deleted") return false

    // Monthly view-mode filter — REPLACE your existing lines with this:
    if (monthlyViewMode !== "all") {
      if (monthlyViewMode === "not_started" && task.status !== "Not Started") return false
      if (monthlyViewMode === "in_progress" && task.status !== "In Progress") return false
      if (monthlyViewMode === "completed" && task.status !== "Completed") return false
      if (monthlyViewMode === "deleted" && task.status !== "Deleted") return false
    } else {
      // For "All" tab, show all non-deleted monthly tasks
      if (task.status === "Deleted") return false
    }

  
    // Filter by search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false
  
    // Filter by priority
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
  
    // Filter by status
    if (statusFilter !== "all" && task.status !== statusFilter) return false
  
    return true
  })

  // Filter weekly tasks based on view mode, search query, and filters
  const filteredWeeklyTasks = weeklyTasks.filter((task) => {
  // Only show tasks created by the logged-in user
  if (task.created_by !== currentUserId) return false

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
  if (
    searchQuery &&
    !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !task.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) return false

  // Priority
  if (priorityFilter !== "all" && task.priority !== priorityFilter) return false

  // Status dropdown (global filter)
  if (statusFilter !== "all" && task.status !== statusFilter) return false

  return true
})

  

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

    <Button variant="outline" className="rounded-xl" onClick={handleExportDoc}>
      <Download className="h-4 w-4 mr-2" />
      Export (.doc)
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
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.company}</TableCell>
                        <TableCell>
                          {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>
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
                    ))
                  : filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.company}</TableCell>
                        <TableCell>
                          {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeeklyTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.company}</TableCell>
                    <TableCell>
                      {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell>{task.dueDate}</TableCell>
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

                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMonthlyTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.companies?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell>
  {new Date(task.due_date).getDate()}
  <sup>{getDaySuffix(new Date(task.due_date).getDate())}</sup> of every month
</TableCell>

                  </TableRow>
                ))}
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

