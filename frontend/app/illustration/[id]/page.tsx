import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"
import { getCommentsForPost, getPostById } from "@/lib/content-data"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function IllustrationDetailPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  const comments = await getCommentsForPost(id)

  return (
    <PostDetail
      post={post}
      comments={comments}
      backHref="/illustration"
      backLabel="Back to Illustration"
    />
  )
}
