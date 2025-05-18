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

export default function TaskListPage() {
  const { tasks, deletedTasks, restoreTask } = useTasks()
  const [viewMode, setViewMode] = useState<"active" | "completed" | "deleted">("active")
  const [monthlyViewMode, setMonthlyViewMode] = useState<"active" | "completed" | "deleted">("active")
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
    // Filter by view mode
    if (viewMode === "active" && (task.status === "Completed" || task.status === "Deleted")) return false
    if (viewMode === "completed" && task.status !== "Completed") return false
    if (viewMode === "deleted") return false // We'll use deletedTasks for this view

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
    // Filter by view mode
    if (monthlyViewMode === "active" && (task.status === "Completed" || task.status === "Deleted")) return false
    if (monthlyViewMode === "completed" && task.status !== "Completed") return false
    if (monthlyViewMode === "deleted" && task.status !== "Deleted") return false

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
              variant={viewMode === "active" ? "default" : "outline"}
              className={viewMode === "active" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setViewMode("active")}
            >
              Active Tasks
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
                    <TableCell>{task.due_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Button
              variant={monthlyViewMode === "active" ? "default" : "outline"}
              className={monthlyViewMode === "active" ? "bg-[#8BC53D] hover:bg-[#476E2C]" : ""}
              onClick={() => setMonthlyViewMode("active")}
            >
              Active Tasks
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
