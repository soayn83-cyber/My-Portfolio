"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface ImageModalProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious
}: ImageModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
    if (e.key === "ArrowRight") onNext()
    if (e.key === "ArrowLeft") onPrevious()
  }, [onClose, onNext, onPrevious])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-full bg-background/10 p-2 text-background transition-colors hover:bg-background/20"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPrevious()
              }}
              className="absolute left-4 z-50 rounded-full bg-background/10 p-2 text-background transition-colors hover:bg-background/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
            />
          </motion.div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              className="absolute right-4 z-50 rounded-full bg-background/10 p-2 text-background transition-colors hover:bg-background/20"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/10 px-4 py-2 text-sm text-background">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
