"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export interface WorkStep {
  image_url: string
  description: string
}

export interface WorkProcessPost {
  id: string
  category: string
  title: string
  production_date: string | null
  work_steps: WorkStep[] | null
  created_at: string
}

interface WorkProcessListProps {
  posts: WorkProcessPost[]
  emptyMessage?: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
}

export function WorkProcessList({ posts, emptyMessage = "No posts yet" }: WorkProcessListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="mb-4 text-6xl text-primary/50">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-foreground/80">{emptyMessage}</h3>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-12"
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={item}>
          <div className="block w-full">
            <div className="group flex flex-col gap-4 rounded-xl border-4 border-primary/20 bg-background p-6 transition-all hover:border-primary/40 hover:bg-card">
              
              {/* Images Grid */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-start">
                {post.work_steps && post.work_steps.length > 0 ? (
                  post.work_steps.slice(0, 4).map((step, index) => (
                    <div key={index} className="flex flex-col gap-3 w-[calc(50%-0.5rem)] md:w-[calc(25%-1.125rem)] max-w-[280px]">
                      <div className="relative w-full overflow-hidden border-2 border-primary/20 bg-background/50 transition-colors group-hover:border-primary/40">
                        {step.image_url ? (
                          <Image
                            src={step.image_url}
                            alt={step.description || `Work step ${index + 1}`}
                            width={500}
                            height={500}
                            className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full min-h-[200px] w-full items-center justify-center font-medium text-primary/50">
                            이미지 {index + 1}
                          </div>
                        )}
                      </div>
                      {step.description && (
                        <div className="text-center text-sm font-medium text-foreground/80 px-1 break-words">
                          {step.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-8 text-muted-foreground">
                    등록된 작업 단계가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}