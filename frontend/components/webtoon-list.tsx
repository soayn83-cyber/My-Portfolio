"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  keywords?: string | null
  production_date?: string | null
  sub_category?: string | null
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

export function WebtoonList({ posts }: { posts: Post[] }) {
  const [activeTab, setActiveTab] = useState("all")

  const filteredPosts = posts.filter(post => {
    if (activeTab === "all") return true
    if (activeTab === "serialized") return post.sub_category === "serialized" || !post.sub_category
    if (activeTab === "personal") return post.sub_category === "personal"
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-[400px]">
          <TabsList className="grid w-full grid-cols-3 bg-primary/5">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="serialized">연재작</TabsTrigger>
            <TabsTrigger value="personal">연구작(개인작)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <p className="text-foreground/50">해당하는 작품이 없습니다.</p>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {filteredPosts.map((post) => (
        <motion.div key={post.id} variants={item}>
          {/* Main Container - 3 Columns on desktop, stacked on mobile */}
          <div className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-primary/20 bg-card/50 transition-all hoverborder-primary/40 hover:shadow-md">
            
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
                {post.production_date && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    제작 시기 : {post.production_date}
                  </p>
                )}
              </div>

              {/* Logline / Description Box */}
              <div className="flex-1 flex flex-col rounded-lg border border-primary/20 p-4 bg-background/50">
                {post.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {post.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground/50 italic">설명아 쑗습니다.</p>
                )}
                {post.keywords && (
                  <div className="mt-2 flex flex-wrap gap-2 pt-4 border-t border-primary/10 mt-auto">
                    {post.keywords.split(/[, ]+/).filter(k => k).map((keyword, idx) => {
                      const cleanKeyword = keyword.startsWith('#') ? keyword : `#${keyword}`;
                      return (
                        <span key={idx} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground">
                          {cleanKeyword}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Links (Right) */}
            <div className="w-full md:w-[200px] flex flex-col gap-3 py-2 flex-shrink-0">
              {post.episodes && post.episodes.length > 0 ? (
                post.episodes.map((episode, index) => (
                  <a
                    key={index}
                    href={episode.url || `/webtoon/${post.id}?episode=${index}`}
                    target={episode.url ? "_blank" : undefined}
                    rel={episode.url ? "noopener noreferrer" : undefined}
                    className="block"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full justify-center border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors py-6 text-base font-medium"
                    >
                      {episode.title} 보기
                    </Button>
                  </a>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-primary/20 p-4 text-center text-sm text-muted-foreground">
                  등록된 회차가 없습니다.
                </div>
              )}

              {/* Spacer to push PDF to bottom if needed, or simply let it stack */}
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
                    기획서 보러가기
                  </Button>
                </a>
              )}
            </div>

          </div>
        </motion.div>
      ))}
        </motion.div>
      )}
    </div>
  )
}