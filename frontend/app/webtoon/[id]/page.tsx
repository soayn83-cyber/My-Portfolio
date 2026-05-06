import { createClient } from "@/lib/supabase/server"
import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ episode?: string }>
}

export default async function WebtoonDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const episodeIndex = resolvedSearchParams.episode ? parseInt(resolvedSearchParams.episode, 10) : undefined;

  const supabase = await createClient();
  
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!post) {
    notFound();
  }

  // If viewing a specific episode with uploaded images
  if (episodeIndex !== undefined && post.episodes && post.episodes[episodeIndex]) {
    const episode = post.episodes[episodeIndex];
    if (episode.images && episode.images.length > 0) {
      post.title = `${post.title} - ${episode.title}`;
      post.images = episode.images;
      post.thumbnail_url = null;
      post.description = null;
    }
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("id, author_name, content, created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return (
    <PostDetail
      post={post}
      comments={comments || []}
      backHref="/webtoon"
      backLabel="Back to Webtoon"
    />
  );
}