"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useTasks, Task } from "@/contexts/task-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useCompanies } from "@/hooks/useCompanies"
import { CATEGORIES } from "@/utils/category-styles"
import { useToast } from "@/hooks/use-toast"


type OneTask = {
  id: string
  title: string
  company?: string
  companyId?: string
  category?: string
  priority: "High" | "Mid" | "Low"
  status: "Not Started" | "In Progress" | "Completed" | "Deleted"
  dueDate?: string
  description?: string
}

type RecurringTask = {
  id: string
  title: string | null
  company_id: string | null
  category: string | null
  priority: "High" | "Mid" | "Low" | null
  status: "Not Started" | "In Progress" | "Completed" | "Deleted" | null
  due_date: string | null
  description: string | null
}

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const search = useSearchParams()
  const kind = (search.get("kind") ?? "one") as "one" | "weekly" | "monthly"

  const { companies } = useCompanies()
  const { toast } = useToast()

// helper: resolve company name from id (for one-time tasks stored in context)
  const companyNameById = (cid?: string) =>
  companies.find(c => String(c.id) === String(cid))?.name ?? ""


  // one-time tasks live in context
  const { tasks, updateTask } = useTasks()
  const oneTime = useMemo<OneTask | undefined>(
    () => (kind === "one" ? tasks.find(t => String(t.id) === String(id)) as any : undefined),
    [tasks, id, kind]
  )

  // monthly/weekly come from DB
  const [recurring, setRecurring] = useState<RecurringTask | null>(null)
  const [loading, setLoading] = useState(kind !== "one")

  useEffect(() => {
    if (kind === "one") return
    let alive = true
    ;(async () => {
      setLoading(true)
      const table = kind === "monthly" ? "monthly_tasks" : "weekly_tasks"
      const { data, error } = await supabase
        .from(table)
        .select("id,title,company_id,category,priority,status,due_date,description")
        .eq("id", id)
        .maybeSingle()
      if (!alive) return
      if (error || !data) setRecurring(null)
      else setRecurring(data as RecurringTask)
      setLoading(false)
    })()
    return () => { alive = false }
  }, [id, kind])

  // unified form state
  const [form, setForm] = useState({
    title: "",
    companyId: "",
    category: "",
    priority: "" as "High" | "Mid" | "Low" | "",
    status: "" as "Not Started" | "In Progress" | "Completed" | "Deleted" | "",
    dueDate: "",
    notes: "",
  })

  // hydrate form
  useEffect(() => {
    if (kind === "one" && oneTime) {
      setForm({
        title: oneTime.title ?? "",
        companyId: oneTime.companyId ?? "",
        category: oneTime.category ?? "",
        priority: oneTime.priority ?? "",
        status: oneTime.status ?? "",
        dueDate: oneTime.dueDate ?? "",
        notes: oneTime.description ?? "",
      })
    }
  }, [oneTime, kind])

  useEffect(() => {
    if (kind !== "one" && recurring) {
      setForm({
        title: recurring.title ?? "",
        companyId: recurring.company_id ?? "",
        category: recurring.category ?? "",
        priority: (recurring.priority as any) ?? "",
        status: (recurring.status as any) ?? "",
        dueDate: recurring.due_date ?? "",
        notes: recurring.description ?? "",
      })
    }
  }, [recurring, kind])

  const onSave = async () => {
    if (kind === "one") {
        if (!oneTime) return
        updateTask({
            ...(oneTime as Task),
            title: form.title,
            company: companyNameById(form.companyId),  // ✅ keep name in context
            companyId: form.companyId,                 // ✅ keep id too
            category: form.category,
            priority: form.priority as Task["priority"],
            status: form.status as Task["status"],
            dueDate: form.dueDate,
            description: form.notes,
        })
        toast({ variant: "success", title: "Task saved", description: "Changes applied successfully." })
      return
    }

    const table = kind === "monthly" ? "monthly_tasks" : "weekly_tasks"
    const { error } = await supabase
    .from(table)
    .update({
        title: form.title,
        company_id: form.companyId || null,   // ✅ id from dropdown
        category: form.category || null,
        priority: form.priority || null,
        status: form.status || null,
        due_date: form.dueDate || null,
        description: form.notes || null,
    })
    .eq("id", id)

    if (error) {
    toast({ variant: "destructive", title: "Save failed", description: error.message })
    } else {
    toast({ variant: "success", title: "Task saved", description: "Changes applied successfully." })
    }
  }

  if (loading) return <div className="p-6">Loading…</div>

  if (kind === "one" && !oneTime) {
    return (
      <div className="p-6 space-y-4">
        <p className="font-medium">Task not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/task-list")}>Back to Task List</Button>
      </div>
    )
  }
  if (kind !== "one" && !recurring) {
    return (
      <div className="p-6 space-y-4">
        <p className="font-medium">Task not found or you don’t have access.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/task-list")}>Back to Task List</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Task Details</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            View / Edit ({kind === "one" ? "One-time" : kind === "weekly" ? "Weekly" : "Monthly"})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Company</Label>
            <Select
                value={form.companyId}
                onValueChange={(v) => setForm({ ...form, companyId: v })}
            >
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                {companies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>

          {/* <div className="space-y-2">
            <Label>Company ID</Label>
            <Input value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} />
          </div> */}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
            >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>


          {/* <div className="space-y-2">
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div> */}

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
              <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Mid">Mid</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button onClick={onSave} className="rounded-full">Save Changes</Button>
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




// "use client"

// import { useEffect, useMemo, useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { supabase } from "@/lib/supabaseClient"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Button } from "@/components/ui/button"

// type TaskRow = {
//   id: string
//   title: string | null
//   company_id: string | null
//   category: string | null
//   priority: "High" | "Mid" | "Low" | null
//   status: "Not Started" | "In Progress" | "Completed" | null
//   due_date: string | null // ISO date
//   description: string | null
//   tags: string | null
// }

// export default function TaskDetailsPage() {
//   const { id } = useParams<{ id: string }>()
//   const router = useRouter()

//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [task, setTask] = useState<TaskRow | null>(null)

//   // Load the task (RLS ensures user only sees own rows)
//   useEffect(() => {
//     let alive = true
//     ;(async () => {
//       setLoading(true)
//       const { data, error } = await supabase
//         .from("tasks")
//         .select("id,title,company_id,category,priority,status,due_date,description,tags")
//         .eq("id", id)
//         .maybeSingle()

//       if (!alive) return

//       if (error || !data) {
//         // not found OR not authorized by RLS
//         setTask(null)
//       } else {
//         setTask(data)
//       }
//       setLoading(false)
//     })()
//     return () => { alive = false }
//   }, [id])

//   const save = async () => {
//     if (!task) return
//     setSaving(true)
//     const { error } = await supabase
//       .from("tasks")
//       .update({
//         title: task.title,
//         company_id: task.company_id,
//         category: task.category,
//         priority: task.priority,
//         status: task.status,
//         due_date: task.due_date,
//         description: task.description,
//         tags: task.tags,
//       })
//       .eq("id", task.id)

//     setSaving(false)
//     if (error) {
//       alert(error.message)
//       return
//     }
//     // stay on the page after save (or router.back() if you prefer)
//     alert("Saved")
//   }

//   if (loading) return <div className="p-6">Loading…</div>

//   if (!task) {
//     return (
//       <div className="p-6 space-y-4">
//         <p className="font-medium">Task not found or you don’t have access.</p>
//         <Button variant="outline" onClick={() => router.push("/dashboard")}>Back to Overview</Button>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Task Details</h1>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">View / Edit</CardTitle>
//         </CardHeader>
//         <CardContent className="grid gap-4 md:grid-cols-2">
//           <div className="space-y-2 md:col-span-2">
//             <Label>Title</Label>
//             <Input
//               value={task.title ?? ""}
//               onChange={(e) => setTask({ ...task, title: e.target.value })}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Company ID</Label>
//             <Input
//               value={task.company_id ?? ""}
//               onChange={(e) => setTask({ ...task, company_id: e.target.value })}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Category</Label>
//             <Input
//               value={task.category ?? ""}
//               onChange={(e) => setTask({ ...task, category: e.target.value })}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Priority</Label>
//             <Select
//               value={task.priority ?? ""}
//               onValueChange={(v) => setTask({ ...task, priority: v as TaskRow["priority"] })}
//             >
//               <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="High">High</SelectItem>
//                 <SelectItem value="Mid">Mid</SelectItem>
//                 <SelectItem value="Low">Low</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label>Status</Label>
//             <Select
//               value={task.status ?? ""}
//               onValueChange={(v) => setTask({ ...task, status: v as TaskRow["status"] })}
//             >
//               <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Not Started">Not Started</SelectItem>
//                 <SelectItem value="In Progress">In Progress</SelectItem>
//                 <SelectItem value="Completed">Completed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label>Due Date</Label>
//             <Input
//               type="date"
//               value={task.due_date ?? ""}
//               onChange={(e) => setTask({ ...task, due_date: e.target.value })}
//             />
//           </div>

//           <div className="space-y-2 md:col-span-2">
//             <Label>Notes</Label>
//             <Textarea
//               value={task.description ?? ""}
//               onChange={(e) => setTask({ ...task, description: e.target.value })}
//             />
//           </div>

//           <div className="md:col-span-2 flex gap-3">
//             <Button onClick={save} disabled={saving} className="rounded-full">
//               {saving ? "Saving..." : "Save Changes"}
//             </Button>
//             <Button variant="outline" onClick={() => router.back()}>Back</Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
