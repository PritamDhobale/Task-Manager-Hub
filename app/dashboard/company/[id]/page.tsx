"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle, Clock, ListTodo, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import MetricCard from "@/components/metric-card"
import Image from "next/image"
import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
import { CATEGORIES, getCategoryStyle } from "@/utils/category-styles"
import { useTasks } from "@/contexts/task-context"
import TaskSearchFilter from "@/components/task-search-filter"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useMonthlyTasks } from "@/contexts/monthly-task-context"
import { User } from "@supabase/supabase-js"
import { useProfile } from "@/contexts/profile-context"



type MonthlyTask = {
  id: string
  title: string
  company: string
  companyId: string
  description: string
  category: string
  priority: "High" | "Mid" | "Low"
  status: "Not Started" | "In Progress" | "Completed"
  dueDate: string
  taskType: "One-time" | "Monthly"
  created_by: string
}

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th"
  switch (day % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}


export default function CompanyPage() {
  const [user, setUser] = useState<User | null>(null)

useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }
  getUser()
}, [])


  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const { toast } = useToast()

  // Task context
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const { monthlyTasks, reloadMonthlyTasks, updateMonthlyTask } = useMonthlyTasks()

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    category: "",
    priority: "Mid",
    status: "Not Started", // Updated from "Pending"
    dueDate: new Date().toISOString().split("T")[0],
    description: "",
    taskType: "One-time",
  })

  // Sample company data
  const [companies, setCompanies] = useState<{ id: string; name: string; color: string; logo: string }[]>([])

  useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase.from("companies").select("*")
      if (!error && data) {
        setCompanies(
          data.map((c) => ({
            id: c.id.toString(), // convert to string once here
            name: c.name,
            logo: c.logo || "/placeholder.svg",
            color: "#050505"
          }))
        )
      }
    }
    fetchCompanies()
  }, [])

   
  const company = companies.find((c) => c.id.toString() === companyId)
  if (!company) return <div>Loading company info...</div>

  // Filter tasks for this company
  const companyTasks = tasks.filter((task) => {
    if (!user) return false // ✅ Ensure user is loaded before filtering
  
    // ✅ Match company AND ensure task was created by current user only
    if (task.companyId !== companyId || task.created_by !== user.id) return false
  
    // ✅ Filter by search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
  
    // ✅ Filter by priority
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
  
    // ✅ Filter by status
    if (statusFilter !== "all" && task.status !== statusFilter) return false
  
    return true
  })
  

  // const companyMonthlyTasks = monthlyTasks.filter((task) => {
    // Filter by company
    // if (task.companyId.toString() !== companyId) return false
    const companyMonthlyTasks = monthlyTasks.filter((task) => {
      if (!user) return false // Ensure user is loaded first
    
      return (
        task.companyId?.toString() === companyId &&          // Match company
        task.created_by === user.id &&                       // Match creator
        (priorityFilter === "all" || task.priority === priorityFilter) &&
        (statusFilter === "all" || task.status === statusFilter) &&
        (
          !searchQuery ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    })
       
  

  
    const handleAddTask = async () => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not logged in. Please refresh or log in again.",
        })
        return
      }
    
      if (newTask.taskType === "Monthly") {
        const { error } = await supabase.from("monthly_tasks").insert({
          title: newTask.title,
          company_id: companyId,
          due_date: newTask.dueDate,
          priority: newTask.priority,
          status: newTask.status,
          description: newTask.description,
          category: newTask.category,
          tags: [newTask.category],
          created_by: user.id, // ✅ Safe now
        })
    
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create monthly task",
          })
          return
        }
    
        await reloadMonthlyTasks()
      } else {
        addTask({
          title: newTask.title,
          company: company.name,
          companyId,
          dueDate: newTask.dueDate,
          priority: newTask.priority as "High" | "Mid" | "Low",
          status: newTask.status as "Completed" | "In Progress" | "Not Started",
          description: newTask.description,
          category: newTask.category,
          tags: [newTask.category],
          created_by: user.id, // ✅ Safe now
        })
      }
    
      // Reset form
      setNewTask({
        title: "",
        category: "",
        priority: "Mid",
        status: "Not Started",
        dueDate: new Date().toISOString().split("T")[0],
        description: "",
        taskType: "One-time",
      })
    
      setIsAddTaskOpen(false)
    
      toast({
        variant: "success",
        title: "Success",
        description: "Task added successfully!",
      })
    }
    
    
    

  const handleUpdateTask = (updatedTask: any) => {
    updateTask(updatedTask)
    updateMonthlyTask(updatedTask)

    // Show success toast
    toast({
      variant: "success",
      title: "Success",
      description: "Task updated successfully!",
    })
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)

    // Show success toast
    toast({
      variant: "success",
      title: "Success",
      description: "Task deleted successfully!",
    })
  }

  // Handle company change in Edit Task
  const handleCompanyChange = (taskId: string, newCompanyId: string) => {

    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const newCompany = companies.find((c) => c.id === newCompanyId)
      if (newCompany) {
        const updatedTask = {
          ...task,
          company: newCompany.name,
          companyId: newCompanyId,
        }
        updateTask(updatedTask)

        // If the task is moved to a different company, navigate to that company's page
        if (newCompanyId !== companyId) {
          toast({
            variant: "success",
            title: "Success",
            description: `Task moved to ${newCompany.name}!`,
          })

          // Optional: Navigate to the new company page
          // router.push(`/dashboard/company/${newCompanyId}`)
        }
      }
    }
  }

  function getReadableMonthlyDate(dateString: string): string {
    const day = new Date(dateString).getDate()
    const suffix =
      day >= 11 && day <= 13
        ? "th"
        : ["st", "nd", "rd"][((day % 10) - 1)] || "th"
    return `${day}${suffix} of every month`
  }
  

  // Calculate metrics
  const totalTasks = companyTasks.length
  const completedTasks = companyTasks.filter((task) => task.status === "Completed").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="h-8 mr-3">
          <Image
            src={company.logo || "/placeholder.svg"}
            alt={company.name}
            width={64}
            height={32}
            className="h-8 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "#050505" }}>
          {company.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Tasks" value={totalTasks} icon={<ListTodo className="h-5 w-5 text-[#007BFF]" />} />
        <MetricCard
          title="Completed Tasks"
          value={completedTasks}
          icon={<CheckCircle className="h-5 w-5 text-[#28A745]" />}
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<Clock className="h-5 w-5 text-[#6C757D]" />}
          progress={completionRate}
          color="#28A745"
        />
      </div>

      {/* Search and Filter */}
      <TaskSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <Card className="shadow-sm rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle className="text-lg">Tasks</CardTitle>
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
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Select defaultValue={company.id} disabled>
                    <SelectTrigger id="company" className="rounded-none">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
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
                      defaultValue={newTask.priority}
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
                      defaultValue={newTask.status}
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
                    </SelectContent>
                  </Select>
                  </div>
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyTasks.map((task) => (
              <Card key={task.id} className="shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 rounded-xl">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`editTaskName-${task.id}`}>Task Name</Label>
                            <Input
                              id={`editTaskName-${task.id}`}
                              defaultValue={task.title}
                              className="rounded-none"
                              onChange={(e) => {
                                const updatedTask = { ...task, title: e.target.value }
                                updateTask(updatedTask)
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor={`editCompany-${task.id}`}>Company</Label>
                            <Select
                              defaultValue={task.companyId.toString()}
                              onValueChange={(value) => handleCompanyChange(task.id, value)}
                            >
                              <SelectTrigger id={`editCompany-${task.id}`} className="rounded-none">
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
                            <Label htmlFor={`editCategory-${task.id}`}>Category</Label>
                            <Select
                              defaultValue={task.category}
                              onValueChange={(value) => {
                                const updatedTask = { ...task, category: value, tags: [value] }
                                updateTask(updatedTask)
                              }}
                            >
                              <SelectTrigger id={`editCategory-${task.id}`} className="rounded-none">
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
                              <Label htmlFor={`editPriority-${task.id}`}>Priority</Label>
                              <Select
                                defaultValue={task.priority}
                                onValueChange={(value) => {
                                  const updatedTask = { ...task, priority: value as "High" | "Mid" | "Low" }
                                  updateTask(updatedTask)
                                }}
                              >
                                <SelectTrigger id={`editPriority-${task.id}`} className="rounded-none">
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
                              <Label htmlFor={`editStatus-${task.id}`}>Status</Label>
                              <Select
                                defaultValue={task.status}
                                onValueChange={(value) => {
                                  const updatedTask = {
                                    ...task,
                                    status: value as "Completed" | "In Progress" | "Not Started",
                                  }
                                  updateTask(updatedTask)
                                }}
                              >
                                <SelectTrigger id={`editStatus-${task.id}`} className="rounded-none">
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
                            <Label htmlFor={`editDueDate-${task.id}`}>Due Date</Label>
                            <Input
                              id={`editDueDate-${task.id}`}
                              type="date"
                              defaultValue={task.dueDate}
                              className="rounded-none"
                              onChange={(e) => {
                                const updatedTask = { ...task, dueDate: e.target.value }
                                updateTask(updatedTask)
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor={`editNotes-${task.id}`}>Notes</Label>
                            <Textarea
                              id={`editNotes-${task.id}`}
                              defaultValue={task.description}
                              className="rounded-none"
                              onChange={(e) => {
                                const updatedTask = { ...task, description: e.target.value }
                                updateTask(updatedTask)
                              }}
                            />
                          </div>
                          <div className="flex justify-between mt-2">
                            <Button
                              type="button"
                              variant="destructive"
                              className="bg-red-500 hover:bg-red-600 rounded-xl"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete Task
                            </Button>
                            <Button
                              type="button"
                              className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl"
                              onClick={() => {
                                // Close the dialog
                                document
                                  .querySelector(`[data-state="open"]`)
                                  ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))

                                // Show success toast
                                toast({
                                  variant: "success",
                                  title: "Success",
                                  description: "Task updated successfully!",
                                })
                              }}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  <div className="flex flex-wrap justify-between items-center">
                    <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                    <div className="flex gap-2">
                      <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                      <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* for Monthly Tasks */}
      <Card className="shadow-sm rounded-xl">
  <CardHeader>
    <CardTitle className="text-lg">Monthly Occurring Tasks</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {companyMonthlyTasks.length > 0 ? (
        companyMonthlyTasks.map((task) => (
          <Card key={task.id} className="shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg">{task.title}</h3>
                  {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                </div>
                <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 rounded-xl">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`editTaskName-${task.id}`}>Task Name</Label>
                            <Input
                              id={`editTaskName-${task.id}`}
                              defaultValue={task.title}
                              className="rounded-none"
                              onChange={(e) => {
                                const updatedTask = { ...task, title: e.target.value }
                                updateMonthlyTask(updatedTask)
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor={`editCompany-${task.id}`}>Company</Label>
                            <Select
                              defaultValue={task.companyId.toString()}
                              onValueChange={(value) => handleCompanyChange(task.id, value)}
                            >
                              <SelectTrigger id={`editCompany-${task.id}`} className="rounded-none">
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
                            <Label htmlFor={`editCategory-${task.id}`}>Category</Label>
                            <Select
                              defaultValue={task.category}
                              onValueChange={(value) => {
                                const updatedTask = { ...task, category: value, tags: [value] }
                                updateMonthlyTask(updatedTask)
                              }}
                            >
                              <SelectTrigger id={`editCategory-${task.id}`} className="rounded-none">
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
                              <Label htmlFor={`editPriority-${task.id}`}>Priority</Label>
                              <Select
                                defaultValue={task.priority}
                                onValueChange={(value) => {
                                  const updatedTask = { ...task, priority: value as "High" | "Mid" | "Low" }
                                  updateMonthlyTask(updatedTask)
                                }}
                              >
                                <SelectTrigger id={`editPriority-${task.id}`} className="rounded-none">
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
                              <Label htmlFor={`editStatus-${task.id}`}>Status</Label>
                              <Select
                                defaultValue={task.status}
                                onValueChange={(value) => {
                                  const updatedTask = {
                                    ...task,
                                    status: value as "Completed" | "In Progress" | "Not Started",
                                  }
                                  updateMonthlyTask(updatedTask)
                                }}
                              >
                                <SelectTrigger id={`editStatus-${task.id}`} className="rounded-none">
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
                            <Label htmlFor={`editDueDate-${task.id}`}>Due Date</Label>
                            <Input
                              id={`editDueDate-${task.id}`}
                              type="date"
                              defaultValue={task.dueDate}
                              className="rounded-none"
                              onChange={(e) => {
                                const updatedTask = { ...task, dueDate: e.target.value }
                                updateMonthlyTask(updatedTask)
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor={`editNotes-${task.id}`}>Notes</Label>
                            <Textarea
                              id={`editNotes-${task.id}`}
                              defaultValue={task.description}
                              className="rounded-none"
                              onChange={(e) => {
                                const updatedTask = { ...task, description: e.target.value }
                                updateMonthlyTask(updatedTask)
                              }}
                            />
                          </div>
                          <div className="flex justify-between mt-2">
                            <Button
                              type="button"
                              variant="destructive"
                              className="bg-red-500 hover:bg-red-600 rounded-xl"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete Task
                            </Button>
                            <Button
                              type="button"
                              className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl"
                              onClick={() => {
                                // Close the dialog
                                document
                                  .querySelector(`[data-state="open"]`)
                                  ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))

                                // Show success toast
                                toast({
                                  variant: "success",
                                  title: "Success",
                                  description: "Task updated successfully!",
                                })
                              }}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
              </div>
              <p className="text-gray-600 mb-3">{task.description}</p>
              <div className="flex flex-wrap justify-between items-center">
              <p className="text-sm text-gray-500">
  Due: {new Date(task.dueDate).getDate()}
  <sup>{getDaySuffix(new Date(task.dueDate).getDate())}</sup> of every month
</p>

                <div className="flex gap-2">
                  <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                  <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-sm text-gray-500">No monthly tasks found for this company.</div>
      )}
    </div>
  </CardContent>
</Card>

    </div>
  )
}
