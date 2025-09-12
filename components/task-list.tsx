"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
import { getCategoryStyle } from "@/utils/category-styles"
import { useTasks } from "@/contexts/task-context"
import { supabase } from "@/lib/supabaseClient"
import { useEffect } from "react"
import Link from "next/link"
import { useState } from "react"


interface TaskListProps {
  className?: string
}

export default function TaskList({ className }: TaskListProps) {

  const [userId, setUserId] = useState<string | null>(null)

useEffect(() => {
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id ?? null)
  }

  fetchUser()
}, [])

  const { tasks } = useTasks()

  

  // Filter tasks to show only active ones (not completed or deleted)
  const activeTasks = tasks
  .filter((task) =>
    task.status !== "Completed" &&
    task.status !== "Deleted" &&
    task.created_by === userId // ✅ Filter by current user
  )
  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  .slice(0, 5)


  return (
    <Card className={`shadow-sm rounded-xl flex flex-col h-full ${className || ""}`}>
      <CardHeader>
        <CardTitle className="text-lg">Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/task/${task.id}`}
                className="block focus:outline-none"
                aria-label={`Open details for ${task.title}`}
              >
                <div className="p-3 border rounded-xl hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{task.title}</h3>
                      {task.category && (
                        <Badge className={getCategoryStyle(task.category)}>
                          {task.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                    <p className="text-sm text-[#050505]">{task.company}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getPriorityBadgeStyle(task.priority)} min-w-[80px] text-center`}>
                      {task.priority}
                    </Badge>
                    <Badge className={`${getStatusBadgeStyle(task.status)} min-w-[100px] text-center`}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No active tasks found
            </div>
          )}
        </div>

        {/* <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                  <p className="text-sm text-[#050505]">{task.company}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                <Badge className={`${getPriorityBadgeStyle(task.priority)} min-w-[80px] text-center`}>
  {task.priority}
</Badge>
<Badge className={`${getStatusBadgeStyle(task.status)} min-w-[100px] text-center`}>
  {task.status}
</Badge>

                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">No active tasks found</div>
          )}
        </div> */}
      </CardContent>
    </Card>
  )
}
