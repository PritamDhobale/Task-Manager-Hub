 "use client"

import type React from "react"

import { useState } from "react"
import { useCompanies } from "@/hooks/useCompanies"
import { CheckCircle, Clock, Flag, ListTodo } from "lucide-react"
import MetricCard from "@/components/metric-card"
import TaskList from "@/components/task-list"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CATEGORIES } from "@/utils/category-styles"
import { supabase } from "@/lib/supabaseClient"
import { Task, useTasks } from "@/contexts/task-context"
import { useToast } from "@/hooks/use-toast"
import CompanyCard from "@/components/company-card"
import Link from "next/link"

export default function DashboardPage() {
  const { tasks, addTask } = useTasks()
  const { toast } = useToast()

  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: "",
    company: "",
    companyId: "",
    category: "",
    priority: "",
    status: "Not Started", // Default status
    taskType: "One-time", // default
    dueDate: "",
    notes: "",
    created_by: "",
  })

  // Reset form fields
  const resetForm = () => {
    setNewTask({
      title: "",
      company: "",
      companyId: "",
      category: "",
      priority: "",
      status: "Not Started", // Default status
      taskType: "One-time", // default
      dueDate: "",
      notes: "",
      created_by: "",
    })
  }

  // Companies data with IDs that match the context
  const { companies } = useCompanies()

const companiesWithMetadata = companies.map((company) => {
  const taskList = tasks.filter((t) => t.companyId === company.id && t.status !== "Deleted")
  const progress = calculateProgress(taskList)
  return {
    ...company,
    taskCount: taskList.length,
    progress,
    status: "black" as const,
    color: "#050505",
    logo:
      company.name === "Sage Healthy"
        ? "https://i.postimg.cc/fbspXt6F/Sagehealty-LLC.png"
        : company.name === "Sage Healthy Global"
        ? "https://i.postimg.cc/ydQbwfk4/Sagehealty-Global.png"
        : company.name === "HubOne Systems"
        ? "https://i.postimg.cc/C529fvgH/Hubone-Systems.png"
        : company.name === "Gentyx"
        ? "https://i.postimg.cc/brrKJ7Kw/Gentyx.png"
        : company.name === "HoldCos"
        ? "https://i.postimg.cc/8zMxjBnM/Holdco-Venture.png"
        : "",
  }
})

function calculateProgress(tasksForCompany: Task[]): number {
  if (tasksForCompany.length === 0) return 0
  const completed = tasksForCompany.filter((t) => t.status === "Completed").length
  return Math.round((completed / tasksForCompany.length) * 100)
}

  // // Calculate progress for a company
  // function calculateProgress(companyId: number): number {
  //   const companyTasks = tasks.filter((t) => t.companyId === companyId && t.status !== "Deleted")
  //   if (companyTasks.length === 0) return 0

  //   const completedTasks = companyTasks.filter((t) => t.status === "Completed").length
  //   return Math.round((completedTasks / companyTasks.length) * 100)
  // }

  // Calculate metrics for the dashboard
  const totalTasks = tasks.filter((t) => t.status !== "Deleted").length
  const completedTasks = tasks.filter((t) => t.status === "Completed").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const upcomingTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate)
    const today = new Date()
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(today.getDate() + 7)
    return dueDate >= today && dueDate <= sevenDaysLater && t.status !== "Completed" && t.status !== "Deleted"
  }).length
  const highPriorityTasks = tasks.filter(
    (t) => t.priority === "High" && t.status !== "Completed" && t.status !== "Deleted",
  ).length

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // Validate form
    if (
      !newTask.title ||
      !newTask.company ||
      !newTask.companyId ||
      !newTask.category ||
      !newTask.priority ||
      !newTask.dueDate ||
      !newTask.taskType
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
  
    try {
      // ✅ Get currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
  
      if (userError || !user) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        })
        return
      }
  
      if (newTask.taskType === "Monthly") {
        // 🔁 Monthly Task → Insert into Supabase monthly_tasks table
        const { error } = await supabase.from("monthly_tasks").insert([
          {
            title: newTask.title,
            company_id: newTask.companyId,
            category: newTask.category,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.dueDate,
            description: newTask.notes,
            created_by: user.id,
          },
        ])
  
        if (error) {
          throw error
        }
  
        toast({
          title: "Success",
          description: "Monthly task added successfully",
          variant: "success",
        })
      } else {
        // ✅ One-time Task → Add to context state (tasks)
        addTask({
          title: newTask.title,
          company: newTask.company,
          companyId: newTask.companyId.toString(),
          dueDate: newTask.dueDate,
          priority: newTask.priority as "High" | "Mid" | "Low",
          status: newTask.status as "Not Started" | "In Progress",
          description: newTask.notes,
          category: newTask.category,
          tags: [newTask.category],
          created_by: user.id,
        })
  
        toast({
          title: "Success",
          description: "Task added successfully",
          variant: "success",
        })
      }
  
      // Reset form
      resetForm()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }
  
  

  // Handle company selection
  const handleCompanyChange = (value: string) => {
    const selectedCompany = companiesWithMetadata.find((c) => c.name === value)
    if (selectedCompany) {
      setNewTask({
        ...newTask,
        company: selectedCompany.name,
        companyId: selectedCompany.id.toString(),
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Tasks" value={totalTasks} icon={<ListTodo className="h-5 w-5 text-[#007BFF]" />} />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<CheckCircle className="h-5 w-5 text-[#28A745]" />}
          progress={completionRate}
          color="#28A745"
        />
        <MetricCard title="Upcoming Due" value={upcomingTasks} icon={<Clock className="h-5 w-5 text-[#6C757D]" />} />
        <MetricCard
          title="High Priority"
          value={highPriorityTasks}
          icon={<Flag className="h-5 w-5 text-[#DC3545]" />}
          color="#DC3545"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="lg:w-1/3">
          <Card className="shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <form className="space-y-4 h-full flex flex-col" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Select value={newTask.company} onValueChange={handleCompanyChange}>
                    <SelectTrigger id="company" className="rounded-none">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companiesWithMetadata.map((company) => (
                        <SelectItem key={company.id} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>

                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task">Task</Label>
                  <Input
                    id="task"
                    placeholder="Enter task name"
                    className="rounded-none"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
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

                <div className="space-y-2">
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

                {/* New Status dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger id="status" className="rounded-none">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
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


                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    className="rounded-none"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter notes"
                    className="rounded-none h-full min-h-[80px]"
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full bg-[#8BC53D] hover:bg-[#476E2C] rounded-full">
                  Add Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-2/3">
          <TaskList className="h-full" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Companies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companiesWithMetadata.map((company, index) => (
            <Link href={`/dashboard/company/${company.id}`} key={company.id}>
              <CompanyCard
                name={company.name}
                taskCount={company.taskCount}
                progress={company.progress}
                status={company.status}
                index={index}
                logo={company.logo}
                color={company.color}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
