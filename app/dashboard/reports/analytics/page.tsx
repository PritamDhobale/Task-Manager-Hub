"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { ArrowDown, ArrowUp } from "lucide-react"

export default function AnalyticsPage() {
  // Sample data for bar chart
  const barChartData = [
    { name: "Sage Healthy", completed: 18 },
    { name: "Sage Healthy Global", completed: 12 },
    { name: "HubOne Systems", completed: 15 },
    { name: "Gentyx", completed: 9 },
    { name: "HoldCos Venture", completed: 5 },
  ]

  // Sample data for pie chart
  const pieChartData = [
    { name: "Completed", value: 35, color: "#28A745" },
    { name: "In Progress", value: 25, color: "#007BFF" },
    { name: "Pending", value: 40, color: "#6C757D" },
  ]

  // Sample data for line chart
  const lineChartData = [
    { name: "Jan", onTime: 20, delayed: 5 },
    { name: "Feb", onTime: 18, delayed: 7 },
    { name: "Mar", onTime: 25, delayed: 8 },
    { name: "Apr", onTime: 22, delayed: 10 },
    { name: "May", onTime: 30, delayed: 6 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">68%</div>
              <div className="ml-2 flex items-center text-[#28A745] text-sm">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>5%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs. previous month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">4.2 days</div>
              <div className="ml-2 flex items-center text-[#DC3545] text-sm">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>0.5 days</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs. previous month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">High Priority Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">25%</div>
              <div className="ml-2 flex items-center text-[#DC3545] text-sm">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>3%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs. previous month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Tasks Completed by Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#007BFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
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
      </div>

      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">On-Time vs Delayed Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="onTime" stroke="#28A745" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="delayed" stroke="#DC3545" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
