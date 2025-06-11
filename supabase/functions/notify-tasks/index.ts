// @ts-ignore: Deno support for Supabase Functions
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Setup Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Get current time and date
  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5) // e.g. "15:00"
  const today = now.toISOString().split("T")[0] // e.g. "2025-06-04"

  // Fetch all notification preferences
  const { data: prefs, error: prefError } = await supabase
    .from("notification_preferences")
    .select("user_id, high_priority_time, high_priority_freq")

  if (prefError) {
    console.error("Error fetching preferences:", prefError)
    return new Response("Failed to fetch preferences", { status: 500 })
  }

  for (const pref of prefs) {
    if (pref.high_priority_time?.slice(0, 5) !== currentTime) continue

    const { data: tasks, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("priority", "High")
      .eq("status", "In Progress")
      .eq("due_date", today)
      .eq("created_by", pref.user_id)

    if (taskError || !tasks || tasks.length === 0) continue

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", pref.user_id)
      .single()

    if (userError || !user?.email) continue

    const taskList = tasks.map((t) => `• ${t.title}`).join("\n")

    const response = await supabase.functions.invoke("send-email", {
      body: {
        to: user.email,
        subject: "🔔 High Priority Task Reminder",
        text: `You have the following high-priority tasks due today:\n\n${taskList}`,
      },
    })

    if (response.error) {
      console.error(`Failed to notify ${user.email}:`, response.error)
    }
  }

  return new Response("High-priority notifications processed successfully", { status: 200 })
})
