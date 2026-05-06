"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export interface Post {
  id: string
  category: string
  title: string
  description: string | null
  thumbnail_url: string | null
  images: string[]
  created_at: string
  keywords?: string | null
}

interface GalleryGridProps {
  posts: Post[]
  category: string
  emptyMessage?: string
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

export function GalleryGrid({ posts, category, emptyMessage = "No posts yet" }: GalleryGridProps) {
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>
        <p className="text-foreground/50">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-flow-dense gap-6 grid-cols-1 md:grid-cols-3 items-start"
    >
      {posts.map((post) => {
        const isHorizontal = category === 'illustration' && post.keywords?.includes('layout:horizontal');
        
        return (
          <motion.div 
            key={post.id} 
            variants={item}
            className={isHorizontal ? 'md:col-span-2' : 'col-span-1'}
          >
            <div className="block w-full">
              <div className="group overflow-hidden rounded-xl border border-primary/20 bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                {/* Thumbnail & Images */}
                <div className="relative w-full bg-primary/5 flex flex-col gap-1">
                {post.thumbnail_url && category !== 'illustration' && (
                  <div className="relative w-full overflow-hidden">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      width={0}
                      height={0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ width: '100%', height: 'auto' }}
                      className="transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                
                {!post.thumbnail_url && (!post.images || post.images.length === 0) && (
                  <div className="flex h-64 w-full items-center justify-center">
                    <span className="font-serif text-4xl text-primary/30">
                      {post.title?.[0] || 'Image'}
                    </span>
                  </div>
                )}
                
                {post.images && post.images.length > 0 && post.images.map((url, i) => (
                  <div key={i} className="relative w-full overflow-hidden">
                    <Image
                      src={url}
                      alt={`${post.title} - ${i + 1}`}
                      width={0}
                      height={0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ width: '100%', height: 'auto' }}
                      className="transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="mb-2 font-serif text-lg font-medium text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="line-clamp-2 text-sm text-foreground/60">
                    {post.description}
                  </p>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
