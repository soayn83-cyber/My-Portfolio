"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Trash2 } from "lucide-react"

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    author_name: "",
    password: "",
    content: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          author_name: formData.author_name,
          password: formData.password,
          content: formData.content,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      const newComment = await response.json()
      setComments(prev => [...prev, newComment])
      setFormData({ author_name: "", password: "", content: "" })
    } catch (err) {
      setError("Failed to post comment. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!deletePassword) {
      setError("Please enter your password to delete")
      return
    }

    try {
      const response = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: commentId,
          password: deletePassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete")
      }

      setComments(prev => prev.filter(c => c.id !== commentId))
      setDeletingId(null)
      setDeletePassword("")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-primary/20 pt-8"
    >
      <h2 className="mb-6 flex items-center gap-2 font-serif text-xl font-medium text-foreground">
        <MessageCircle className="h-5 w-5 text-primary" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-xl border border-primary/20 bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="author_name">Name</Label>
            <Input
              id="author_name"
              value={formData.author_name}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              placeholder="Your name"
              required
              className="border-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (for deletion)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Set a password"
              required
              className="border-primary/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Comment</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your comment..."
            required
            rows={3}
            className="border-primary/20"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-primary/20 bg-card p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <span className="font-medium text-foreground">{comment.author_name}</span>
                  <span className="ml-2 text-xs text-foreground/50">
                    {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(deletingId === comment.id ? null : comment.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-foreground/50 hover:text-destructive" />
                </Button>
              </div>

              {deletingId === comment.id && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2">
                  <Input
                    type="password"
                    placeholder="Enter password to delete"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="h-8 flex-1 border-destructive/30 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(comment.id)}
                    className="h-8"
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeletingId(null)
                      setDeletePassword("")
                      setError(null)
                    }}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <p className="whitespace-pre-wrap text-foreground/80">{comment.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="py-8 text-center text-foreground/50">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </motion.div>
  )
}
