import { createClient } from "@/lib/supabase/server"
import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkProcessDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (!post) {
    notFound()
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("id, author_name, content, created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: true })

  return (
    <PostDetail
      post={post}
      comments={comments || []}
      backHref="/work-process"
      backLabel="Back to Work Process"
    />
  )
}
