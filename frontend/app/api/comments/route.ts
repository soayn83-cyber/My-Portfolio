import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { post_id, author_name, password, content } = await request.json()

    if (!post_id || !author_name || !password || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id,
        author_name,
        password_hash,
        content,
      })
      .select("id, author_name, content, created_at")
      .single()

    if (error) {
      console.error("Insert error:", error)
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { comment_id, password } = await request.json()

    if (!comment_id || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the comment with password hash
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("password_hash")
      .eq("id", comment_id)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, comment.password_hash)
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment_id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
