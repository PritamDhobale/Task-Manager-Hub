"use client"

import { useState } from "react"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
import { getCategoryStyle } from "@/utils/category-styles"
import { Undo2 } from "lucide-react"
import { useTasks } from "@/contexts/task-context"
import TaskSearchFilter from "@/components/task-search-filter"

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th"
  switch (day % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}


export default function TaskListPage() {
  const { tasks, deletedTasks, restoreTask } = useTasks()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

useEffect(() => {
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
  }
  getUser()
}, [])

  const [viewMode, setViewMode] = useState<"not_started" | "in_progress" | "completed" | "deleted">("not_started")
  const [monthlyViewMode, setMonthlyViewMode] = useState<"not_started" | "in_progress" | "completed" | "deleted">("not_started")
  const [monthlyTasks, setMonthlyTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchMonthlyTasks = async () => {
      const { data, error } = await supabase
      .from("monthly_tasks")
      .select(`
        *,
        companies (
          name
        )
      `)
      if (!error) setMonthlyTasks(data)
      else console.error("Failed to fetch monthly tasks:", error)
    }
  
    fetchMonthlyTasks()
  }, [])

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
    if (viewMode === "not_started" && task.status !== "Not Started") return false
    if (viewMode === "in_progress" && task.status !== "In Progress") return false
    if (viewMode === "completed" && task.status !== "Completed") return false
    if (viewMode === "deleted") return false
   
  
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
    if (monthlyViewMode === "not_started" && task.status !== "Not Started") return false
    if (monthlyViewMode === "in_progress" && task.status !== "In Progress") return false
    if (monthlyViewMode === "completed" && task.status !== "Completed") return false
    if (monthlyViewMode === "deleted" && task.status !== "Deleted") return false
    if (monthlyViewMode === "completed" && task.status !== "Completed") return false
    if (monthlyViewMode === "deleted" && task.status !== "Deleted") return false
  
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
        <CardHeader>
          <CardTitle className="text-lg">All Tasks</CardTitle>
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
