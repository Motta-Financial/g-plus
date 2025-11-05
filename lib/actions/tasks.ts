"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import type { Task } from "@/lib/types"

export async function createTask(task: Omit<Task, "id" | "created_at" | "updated_at" | "comments">) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: task.user_id,
        workstream_id: task.workstream_id,
        project_id: task.project_id || null,
        class_id: task.class_id || null,
        title: task.title,
        description: task.description || null,
        priority: task.priority,
        urgency: task.urgency || null,
        status: task.status,
        timeframe: task.timeframe || null,
        due_date: task.due_date || null,
        scheduled_time: task.scheduled_time || null,
        scheduled_end_time: task.scheduled_end_time || null,
        completed_at: task.completed_at || null,
        order_index: task.order_index,
        linked_canvas_assignment_id: task.linked_canvas_assignment_id || null,
        external_id: task.external_id || null,
        external_source: task.external_source || null,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard")
    return data
  } catch (error) {
    return null
  }
}

export async function updateTask(id: string, updates: Partial<Task>) {
  try {
    const supabase = await createClient()

    // Remove fields that shouldn't be updated directly
    const { id: _, created_at, updated_at, comments, ...updateData } = updates as any

    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard")
    return data
  } catch (error) {
    return null
  }
}

export async function deleteTask(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (error) throw error
    revalidatePath("/dashboard")
  } catch (error) {
    return
  }
}

export async function getTasks(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
      *,
      comments:task_comments(*)
    `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    return []
  }
}

export async function addTaskComment(taskId: string, userId: string, content: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("task_comments")
      .insert({
        task_id: taskId,
        user_id: userId,
        content,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard")
    return data
  } catch (error) {
    return null
  }
}
