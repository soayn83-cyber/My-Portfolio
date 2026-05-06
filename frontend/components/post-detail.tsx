"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { ImageModal } from "./image-modal"
import { CommentSection } from "./comment-section"

interface Post {
  id: string
  category: string
  title: string
  description: string | null
  thumbnail_url: string | null
  images: string[]
  created_at: string
  keywords?: string | null
  production_date?: string | null
  episodes?: any[] | null
  work_steps?: any[] | null
}

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface PostDetailProps {
  post: Post
  comments: Comment[]
  backHref: string
  backLabel: string
}

export function PostDetail({ post, comments, backHref, backLabel }: PostDetailProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const allImages = post.thumbnail_url 
    ? [post.thumbnail_url, ...post.images]
    : post.images

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setModalOpen(true)
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href={backHref}
            className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl"
        >
          {post.title}
        </motion.h1>

          {/* Properties */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col gap-1 text-sm text-foreground/50"
          >
            <p>
              등록일: {new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {post.production_date && (
              <p>제작 시기: {post.production_date}</p>
            )}
          </motion.div>

        {/* Links */}
        {post.episodes && post.episodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 flex flex-wrap gap-3"
          >
            {post.episodes.map((episode, index) => (
              <a
                key={index}
                href={episode.url || `/webtoon/${post.id}?episode=${index}`}
                target={episode.url ? "_blank" : undefined}
                rel={episode.url ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
              >
                {episode.title}
              </a>
            ))}
          </motion.div>
        )}

        {/* Description & Keywords */}
        {(post.description || post.keywords) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12 rounded-2xl border border-primary/10 bg-primary/5 p-6 md:p-8"
          >
            {post.description && (
              <p className="whitespace-pre-wrap leading-relaxed text-foreground/70">
                {post.description}
              </p>
            )}
            
            {post.keywords && (
              <div className={`flex flex-wrap gap-2 ${post.description ? 'mt-4' : ''}`}>
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
          </motion.div>
        )}

        {/* Images */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={post.category === "webtoon" ? "mb-12 flex flex-col gap-0" : "mb-12 grid gap-4"}
        >
          {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openModal(index)}
                className={post.category === "webtoon"
                  ? "relative w-full outline-none hover:opacity-90 transition-opacity"
                  : "relative overflow-hidden rounded-xl border border-primary/20 transition-all hover:border-primary/40"}
              >
                <Image
                  src={image}
                  alt={`${post.title} - Image ${index + 1}`}
                  width={1200}
                  height={800}
                  className={post.category === "webtoon" ? "w-full h-auto block m-0 p-0" : "w-full object-cover"}
                  style={post.category === "webtoon" ? { display: 'block', verticalAlign: 'bottom' } : undefined}
                />
              </button>
            ))}
          </motion.div>

          {/* Comments */}
        <CommentSection postId={post.id} initialComments={comments} />

        {/* Image Modal */}
        <ImageModal
          images={allImages}
          currentIndex={currentImageIndex}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>
    </div>
  )
}

