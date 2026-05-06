const fs = require('fs');

const pageContent = \import { createClient } from "@/lib/supabase/server"
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
      post.title = \\\\\\ - \\\\\\;
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
      backLabel="목록으로"
    />
  );
}
\

const listContent = \"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export interface EpisodeLink {
  title: string
  url?: string
  images?: string[]
}

export interface Post {
  id: string
  category: string
  title: string
  description: string | null
  thumbnail_url: string | null
  images: string[]
  is_published: boolean
  created_at: string
  episodes?: EpisodeLink[] | null
  pdf_url?: string | null
}

interface WebtoonListProps {
  posts: Post[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function WebtoonList({ posts }: WebtoonListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-foreground/50">등록된 웹툰이 없습니다.</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={item}>
          {/* Main Container - 3 Columns on desktop, stacked on mobile */}
          <div className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-primary/20 bg-card/50 transition-all hover:border-primary/40 hover:shadow-md">
            
            {/* Column 1: Cover Image (Left) */}
            <div className="relative w-full md:w-[280px] aspect-[3/4] flex-shrink-0 overflow-hidden rounded-lg border border-primary/20">
              {post.thumbnail_url ? (
                <Image
                  src={post.thumbnail_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5">
                  <span className="font-serif text-4xl text-primary/30">
                    {post.title[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Column 2: Info (Middle) */}
            <div className="flex flex-1 flex-col gap-4 py-2">
              {/* Title Box */}
              <div className="rounded-lg border border-primary/20 p-4 bg-background/50">
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {post.title}
                </h3>
              </div>

              {/* Logline / Description Box */}
              <div className="flex-1 rounded-lg border border-primary/20 p-4 bg-background/50">
                {post.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {post.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground/50 italic">설명이 없습니다.</p>
                )}
              </div>
            </div>

            {/* Column 3: Links (Right) */}
            <div className="w-full md:w-[200px] flex flex-col gap-3 py-2 flex-shrink-0">
              {post.episodes && post.episodes.length > 0 ? (
                post.episodes.map((episode, index) => {
                  const href = episode.url || \\\/webtoon/\\\?episode=\\\\\\
                  const isExternal = !!episode.url
                  return (
                    <Link
                      href={href}
                      key={index}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="block"
                    >
                      <Button 
                        variant="outline" 
                        className="w-full justify-center border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors py-6 text-base font-medium"
                      >
                        {episode.title} 보기
                      </Button>
                    </Link>
                  )
                })
              ) : (
                <div className="rounded-lg border border-dashed border-primary/20 p-4 text-center text-sm text-muted-foreground">
                  등록된 회차가 없습니다.
                </div>
              )}

              <div className="flex-1"></div>

              {post.pdf_url && (
                <a
                  href={post.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-auto"
                >
                  <Button 
                    variant="default" 
                    className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-medium"
                  >
                    기획서(PDF) 보기
                  </Button>
                </a>
              )}
            </div>

          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
\

fs.writeFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/app/webtoon/[id]/page.tsx', pageContent, 'utf8');
fs.writeFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/webtoon-list.tsx', listContent, 'utf8');
