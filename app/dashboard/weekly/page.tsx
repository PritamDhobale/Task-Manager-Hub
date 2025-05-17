"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
import { getCategoryStyle } from "@/utils/category-styles"

export default function WeeklyDigestPage() {
  const [timeRange, setTimeRange] = useState("7")

  // Sample data for upcoming tasks - Update "Pending" to "Not Started"
  const upcomingTasks = [
    {
      id: 1,
      title: "Quarterly Financial Report",
      company: "Sage Healthy",
      dueDate: "May 15, 2023",
      priority: "High",
      status: "In Progress",
      category: "Reporting",
    },
    {
      id: 2,
      title: "Tax Filing Preparation",
      company: "HubOne Systems",
      dueDate: "May 10, 2023",
      priority: "High",
      status: "Not Started", // Updated from "Pending"
      category: "Tax",
    },
    {
      id: 3,
      title: "Budget Planning Meeting",
      company: "Gentyx",
      dueDate: "May 20, 2023",
      priority: "Mid",
      status: "Not Started", // Updated from "Pending"
      category: "Budget",
    },
    {
      id: 4,
      title: "Expense Report Review",
      company: "Sage Healthy Global",
      dueDate: "May 18, 2023",
      priority: "Low",
      status: "In Progress",
      category: "Finance",
    },
    {
      id: 5,
      title: "Vendor Payment Processing",
      company: "HoldCos",
      dueDate: "May 12, 2023",
      priority: "Mid",
      status: "Not Started", // Updated from "Pending"
      category: "Finance",
    },
  ]

  // Sample data for priority distribution
  const priorityData = [
    { name: "High Priority", value: 8, color: "#b45e08" },
    { name: "Mid Priority", value: 15, color: "#F68C1F" },
    { name: "Low Priority", value: 12, color: "#FAC086" },
  ]

  // Sample data for status summary - Update "Pending" to "Not Started"
  const statusData = [
    { name: "Completed", value: 18, color: "#476E2C" },
    { name: "In Progress", value: 12, color: "#8BC53D" },
    { name: "Not Started", value: 15, color: "#C9E4A4" }, // Updated from "Pending"
  ]

  // Sample data for company breakdown
  const companyBreakdown = [
    {
      name: "Sage Healthy",
      total: 12,
      completed: 5,
      pending: 7,
      highPriority: 3,
    },
    {
      name: "Sage Healthy Global",
      total: 8,
      completed: 4,
      pending: 4,
      highPriority: 2,
    },
    {
      name: "HubOne Systems",
      total: 15,
      completed: 6,
      pending: 9,
      highPriority: 5,
    },
    {
      name: "Gentyx",
      total: 6,
      completed: 3,
      pending: 3,
      highPriority: 1,
    },
    {
      name: "HoldCos",
      total: 4,
      completed: 0,
      pending: 4,
      highPriority: 2,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weekly Digest</h1>
        <div className="w-48">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="15">Next 15 days</SelectItem>
              <SelectItem value="30">Next 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.company}</p>
                  <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                  <Badge className={getPriorityBadgeStyle(task.priority)}>{task.priority}</Badge>
                  <Badge className={getStatusBadgeStyle(task.status)}>{task.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={statusData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Company Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Not Started</TableHead>
                  <TableHead className="text-right">High Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyBreakdown.map((company) => (
                  <TableRow key={company.name}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-right">{company.total}</TableCell>
                    <TableCell className="text-right">{company.completed}</TableCell>
                    <TableCell className="text-right">{company.pending}</TableCell>
                    <TableCell className="text-right">{company.highPriority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
