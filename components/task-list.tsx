"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
import { getCategoryStyle } from "@/utils/category-styles"
import { useTasks } from "@/contexts/task-context"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface TaskListProps {
  className?: string
}

type TaskPriority = "High" | "Mid" | "Low"

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { High: 0, Mid: 1, Low: 2 }
const UPCOMING_DAYS = 1 // “upcoming day” = tomorrow; change to widen window later

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function parseDue(due: string) {
  // tasks use YYYY-MM-DD; force midnight to avoid TZ drift
  return new Date(`${due}T00:00:00`)
}

export default function TaskList({ className }: TaskListProps) {
  const { tasks } = useTasks()

  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState<{ today: boolean; upcoming: boolean; recent: boolean }>({
    today: false,
    upcoming: false,
    recent: true, // open Recent by default (matches current UI)
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    fetchUser()
  }, [])

  const today = useMemo(() => startOfDay(new Date()), [])
  const tomorrow = useMemo(() => {
    const t = new Date(today)
    t.setDate(t.getDate() + UPCOMING_DAYS)
    return t
  }, [today])

  // Active tasks for the logged-in user
  const active = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            task.status !== "Completed" &&
            task.status !== "Deleted" &&
            (userId ? task.created_by === userId : true),
        ),
    [tasks, userId],
  )

  const todaysTasks = useMemo(
    () =>
      active
        .filter((t) => isSameDay(parseDue(t.dueDate), today))
        .sort((a, b) => {
          const pa = PRIORITY_WEIGHT[a.priority as TaskPriority] ?? 99
          const pb = PRIORITY_WEIGHT[b.priority as TaskPriority] ?? 99
          if (pa !== pb) return pa - pb
          return parseDue(a.dueDate).getTime() - parseDue(b.dueDate).getTime()
        }),
    [active, today],
  )

  const upcomingTasks = useMemo(
    () =>
      active
        .filter((t) => isSameDay(parseDue(t.dueDate), tomorrow))
        .sort((a, b) => parseDue(a.dueDate).getTime() - parseDue(b.dueDate).getTime()),
    [active, tomorrow],
  )

  const recentTasks = useMemo(
    () =>
      active
        .slice()
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
        .slice(0, 5),
    [active],
  )

  const SectionHeader = ({
    label,
    count,
    isOpen,
    onToggle,
  }: {
    label: string
    count: number
    isOpen: boolean
    onToggle: () => void
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/60 transition-colors"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-2">
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
    </button>
  )

  const SectionList = ({ list }: { list: typeof active }) =>
    list.length > 0 ? (
      <div className="space-y-3">
        {list.map((task) => (
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
                  {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
                </div>
                <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                <p className="text-sm text-[#050505]">{task.company}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getPriorityBadgeStyle(task.priority)} min-w-[80px] text-center`}>{task.priority}</Badge>
                <Badge className={`${getStatusBadgeStyle(task.status)} min-w-[100px] text-center`}>{task.status}</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-24 text-gray-500">No tasks</div>
    )

  return (
    <Card className={`shadow-sm rounded-xl flex flex-col h-full ${className || ""}`}>
      <CardHeader>
        <CardTitle className="text-lg">Tasks</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">

          {/* Today */}
          <div className="border rounded-lg">
            <SectionHeader
              label="Today's Tasks"
              count={todaysTasks.length}
              isOpen={open.today}
              onToggle={() => setOpen((s) => ({ ...s, today: !s.today }))}
            />
            {open.today && (
              <div className="px-2 pb-3">
                <SectionList list={todaysTasks} />
              </div>
            )}
          </div>

          {/* Upcoming (Tomorrow) */}
          <div className="border rounded-lg">
            <SectionHeader
              label="Upcoming (Tomorrow)"
              count={upcomingTasks.length}
              isOpen={open.upcoming}
              onToggle={() => setOpen((s) => ({ ...s, upcoming: !s.upcoming }))}
            />
            {open.upcoming && (
              <div className="px-2 pb-3">
                <SectionList list={upcomingTasks} />
              </div>
            )}
          </div>

          {/* Recent (top 5, same look as before) */}
          <div className="border rounded-lg">
            <SectionHeader
              label="Recent Tasks"
              count={recentTasks.length}
              isOpen={open.recent}
              onToggle={() => setOpen((s) => ({ ...s, recent: !s.recent }))}
            />
            {open.recent && (
              <div className="px-2 pb-3">
                <SectionList list={recentTasks} />
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}





// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { getPriorityBadgeStyle, getStatusBadgeStyle } from "@/utils/badge-styles"
// import { getCategoryStyle } from "@/utils/category-styles"
// import { useTasks } from "@/contexts/task-context"
// import { supabase } from "@/lib/supabaseClient"
// import { useEffect } from "react"
// import Link from "next/link"
// import { useState } from "react"


// interface TaskListProps {
//   className?: string
// }

// export default function TaskList({ className }: TaskListProps) {

//   const [userId, setUserId] = useState<string | null>(null)

// useEffect(() => {
//   const fetchUser = async () => {
//     const { data: { user } } = await supabase.auth.getUser()
//     setUserId(user?.id ?? null)
//   }

//   fetchUser()
// }, [])

//   const { tasks } = useTasks()

  

//   // Filter tasks to show only active ones (not completed or deleted)
//   const activeTasks = tasks
//   .filter((task) =>
//     task.status !== "Completed" &&
//     task.status !== "Deleted" &&
//     task.created_by === userId // ✅ Filter by current user
//   )
//   .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
//   .slice(0, 5)


//   return (
//     <Card className={`shadow-sm rounded-xl flex flex-col h-full ${className || ""}`}>
//       <CardHeader>
//         <CardTitle className="text-lg">Recent Tasks</CardTitle>
//       </CardHeader>
//       <CardContent className="flex-1 flex flex-col">
//         <div className="space-y-4 flex-1 overflow-y-auto pr-2">
//           {activeTasks.length > 0 ? (
//             activeTasks.map((task) => (
//               <Link
//                 key={task.id}
//                 href={`/dashboard/task/${task.id}`}
//                 className="block focus:outline-none"
//                 aria-label={`Open details for ${task.title}`}
//               >
//                 <div className="p-3 border rounded-xl hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <h3 className="font-medium">{task.title}</h3>
//                       {task.category && (
//                         <Badge className={getCategoryStyle(task.category)}>
//                           {task.category}
//                         </Badge>
//                       )}
//                     </div>
//                     <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
//                     <p className="text-sm text-[#050505]">{task.company}</p>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     <Badge className={`${getPriorityBadgeStyle(task.priority)} min-w-[80px] text-center`}>
//                       {task.priority}
//                     </Badge>
//                     <Badge className={`${getStatusBadgeStyle(task.status)} min-w-[100px] text-center`}>
//                       {task.status}
//                     </Badge>
//                   </div>
//                 </div>
//               </Link>
//             ))
//           ) : (
//             <div className="flex items-center justify-center h-32 text-gray-500">
//               No active tasks found
//             </div>
//           )}
//         </div>

//         {/* //////////////////////////////////////////////////////////////////////////////// */}

//         {/* <div className="space-y-4 flex-1 overflow-y-auto pr-2">
//           {activeTasks.length > 0 ? (
//             activeTasks.map((task) => (
//               <div
//                 key={task.id}
//                 className="p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
//               >
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <h3 className="font-medium">{task.title}</h3>
//                     {task.category && <Badge className={getCategoryStyle(task.category)}>{task.category}</Badge>}
//                   </div>
//                   <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
//                   <p className="text-sm text-[#050505]">{task.company}</p>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                 <Badge className={`${getPriorityBadgeStyle(task.priority)} min-w-[80px] text-center`}>
//   {task.priority}
// </Badge>
// <Badge className={`${getStatusBadgeStyle(task.status)} min-w-[100px] text-center`}>
//   {task.status}
// </Badge>

//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="flex items-center justify-center h-32 text-gray-500">No active tasks found</div>
//           )}
//         </div> */}
//         {/* //////////////////////////////////////////////////////////////////////////////// */}
//       </CardContent>
//     </Card>
//   )
// }
