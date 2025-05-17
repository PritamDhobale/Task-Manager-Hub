"use client"

import type React from "react"

import { useState } from "react"
import { Download, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getStatusBadgeStyle, getPriorityBadgeStyle } from "@/utils/badge-styles"
import { getCategoryStyle } from "@/utils/category-styles"

export default function TaskReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])

  // Sample companies data
  const companies = [
    { id: "all", name: "All Companies" },
    { id: "sage-healthy", name: "Sage Healthy" },
    { id: "sage-global", name: "Sage Healthy Global" },
    { id: "hubone", name: "HubOne Systems" },
    { id: "gentyx", name: "Gentyx" },
    { id: "holdcos", name: "HoldCos" },
  ]

  // Sample tasks data - Update "Pending" to "Not Started"
  const tasks = [
    {
      id: 1,
      title: "Quarterly Financial Report",
      company: "Sage Healthy",
      dueDate: "May 15, 2023",
      assignedTo: "John Smith",
      status: "In Progress",
      category: "Reporting",
      priority: "High",
    },
    {
      id: 2,
      title: "Tax Filing Preparation",
      company: "HubOne Systems",
      dueDate: "Apr 10, 2023",
      assignedTo: "Sarah Johnson",
      status: "Completed",
      category: "Tax",
      priority: "High",
    },
    {
      id: 3,
      title: "Budget Planning Meeting",
      company: "Gentyx",
      dueDate: "May 20, 2023",
      assignedTo: "Michael Brown",
      status: "Not Started", // Updated from "Pending"
      category: "Budget",
      priority: "Mid",
    },
    {
      id: 4,
      title: "Expense Report Review",
      company: "Sage Healthy Global",
      dueDate: "May 5, 2023",
      assignedTo: "Emily Davis",
      status: "Completed",
      category: "Finance",
      priority: "Low",
    },
    {
      id: 5,
      title: "Vendor Payment Processing",
      company: "Holdcos Venture",
      dueDate: "May 12, 2023",
      assignedTo: "David Wilson",
      status: "Not Started", // Updated from "Pending"
      category: "Finance",
      priority: "Mid",
    },
    {
      id: 6,
      title: "Annual Audit Preparation",
      company: "Sage Healthy",
      dueDate: "Jun 1, 2023",
      assignedTo: "John Smith",
      status: "Not Started", // Updated from "Pending"
      category: "Finance",
      priority: "High",
    },
    {
      id: 7,
      title: "Financial Statement Analysis",
      company: "HubOne Systems",
      dueDate: "May 25, 2023",
      assignedTo: "Sarah Johnson",
      status: "In Progress",
      category: "Reporting",
      priority: "Mid",
    },
    {
      id: 8,
      title: "Payroll Processing",
      company: "Gentyx",
      dueDate: "May 30, 2023",
      assignedTo: "Michael Brown",
      status: "In Progress",
      category: "Finance",
      priority: "Mid",
    },
  ]

  // Filter tasks based on search, company, status, and tab
  const filteredTasks = tasks.filter((task) => {
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false

    // Filter by company
    if (companyFilter !== "all" && task.company !== companies.find((c) => c.id === companyFilter)?.name) return false

    // Filter by status
    if (statusFilter !== "all" && task.status !== statusFilter) return false

    // Filter by tab
    if (activeTab !== "all" && task.status !== activeTab) return false

    return true
  })

  const handleExport = () => {
    alert("Exporting data as Excel...")
    // In a real app, this would trigger an API call to generate and download an Excel file
  }

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTasks(filteredTasks.map((task) => task.id))
    } else {
      setSelectedTasks([])
    }
  }

  const toggleSelectTask = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId))
    } else {
      setSelectedTasks([...selectedTasks, taskId])
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Task Reports</h1>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-full sm:w-48 rounded-xl">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-[#007BFF] hover:bg-[#0069d9] rounded-xl w-full md:w-auto" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <Card className="shadow-sm rounded-xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Completed">Completed</TabsTrigger>
              <TabsTrigger value="In Progress">In Progress</TabsTrigger>
              <TabsTrigger value="Not Started">Not Started</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            onChange={toggleSelectAll}
                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                          />
                        </div>
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => toggleSelectTask(task.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.company}</TableCell>
                        <TableCell>
                          {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="Completed" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            onChange={toggleSelectAll}
                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                          />
                        </div>
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => toggleSelectTask(task.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.company}</TableCell>
                        <TableCell>
                          {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="In Progress" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            onChange={toggleSelectAll}
                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                          />
                        </div>
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => toggleSelectTask(task.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.company}</TableCell>
                        <TableCell>
                          {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="Not Started" className="mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            onChange={toggleSelectAll}
                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                          />
                        </div>
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => toggleSelectTask(task.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.company}</TableCell>
                        <TableCell>
                          {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
