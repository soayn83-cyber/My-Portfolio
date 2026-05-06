"use client"

import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12 text-center"
    >
      <h1 className="mb-4 font-serif text-4xl font-medium text-foreground md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mx-auto max-w-lg text-foreground/70">
          {description}
        </p>
      )}
    </motion.div>
  )
}
