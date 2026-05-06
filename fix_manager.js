const fs = require('fs');

const postsManagerContent = \"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { revalidateSite } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react"
import Image from "next/image"

export interface EpisodeLink {
  title: string
  url?: string
  images?: string[]
}

interface Post {
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

interface PostsManagerProps {
  posts: Post[]
}

const categories = [
  { value: "webtoon", label: "Webtoon" },
  { value: "work_process", label: "Work Process" },
  { value: "illustration", label: "Illustration" },
]

export function PostsManager({ posts: initialPosts }: PostsManagerProps) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Post>>({
    category: "webtoon",
    title: "",
    description: "",
    thumbnail_url: null,
    images: [],
    is_published: false,
    episodes: [],
    pdf_url: null
  })
  
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateNew = () => {
    setIsCreating(true)
    setEditingId(null)
    setFormData({
      category: "webtoon",
      title: "",
      description: "",
      thumbnail_url: null,
      images: [],
      is_published: false,
      episodes: [],
      pdf_url: null
    })
  }

  const handleEdit = (post: Post) => {
    setIsCreating(true)
    setEditingId(post.id)
    setFormData({ ...post, episodes: post.episodes || [] })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({
      category: "webtoon",
      title: "",
      description: "",
      thumbnail_url: null,
      images: [],
      is_published: false,
      episodes: [],
      pdf_url: null
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "images" | "pdf_url") => {
    const files = e.target.files
    if (!files?.length) return

    setIsLoading(true)
    try {
      const urls: string[] = []
      
      for (const file of Array.from(files)) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })
        
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Upload failed")
        urls.push(data.url)
      }

      if (field === "thumbnail") {
        setFormData(prev => ({ ...prev, thumbnail_url: urls[0] }))
      } else if (field === "pdf_url") {
        setFormData(prev => ({ ...prev, pdf_url: urls[0] }))
      } else {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("이미지/PDF 업로드 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const handleEpisodeChange = (index: number, key: keyof EpisodeLink, value: string) => {
    setFormData(prev => {
      const newEpisodes = [...(prev.episodes || [])]
      newEpisodes[index] = { ...newEpisodes[index], [key]: value }
      return { ...prev, episodes: newEpisodes }
    })
  }

  const handleEpisodeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, episodeIndex: number) => {
    const files = e.target.files
    if (!files?.length) return
    setIsLoading(true)
    try {
      const urls: string[] = []
      
      for (const file of Array.from(files)) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })
        
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Upload failed")
        urls.push(data.url)
      }

      setFormData(prev => {
        const newEpisodes = [...(prev.episodes || [])]
        const ep = newEpisodes[episodeIndex]
        newEpisodes[episodeIndex] = { ...ep, images: [...(ep.images || []), ...urls] }
        return { ...prev, episodes: newEpisodes }
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("회차 원고 업로드 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const removeEpisodeImage = (episodeIndex: number, imageIndex: number) => {
    setFormData(prev => {
      const newEpisodes = [...(prev.episodes || [])]
      const ep = newEpisodes[episodeIndex]
      if (ep.images) {
        newEpisodes[episodeIndex] = {
          ...ep,
          images: ep.images.filter((_, i) => i !== imageIndex)
        }
      }
      return { ...prev, episodes: newEpisodes }
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const postData = {
        category: formData.category,
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: formData.thumbnail_url || null,
        images: formData.images || [],
        is_published: formData.is_published,
        episodes: formData.episodes || null,
        pdf_url: formData.pdf_url || null
      }
      
      if (editingId) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editingId)
          
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("posts")
          .insert([postData])
          
        if (error) throw error
      }

      await revalidateSite()
      
      const { data: newPosts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        
      if (newPosts) setPosts(newPosts)
      
      setIsCreating(false)
      setEditingId(null)
      router.refresh()
    } catch (error: any) {
      console.error("Save error:", error)
      alert("포스트 저장 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 항목을 정말 삭제하시겠습니까?")) return
    
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("posts").delete().eq("id", id)
      if (error) throw error
      
      await revalidateSite()
      
      setPosts(posts.filter(p => p.id !== id))
      router.refresh()
    } catch (error: any) {
      console.error("Delete error:", error)
      alert("포스트 삭제 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif text-foreground">포스트 관리</h2>
        {!isCreating && (
          <Button onClick={handleCreateNew} variant="outline" className="border-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            새 항목 생성
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="border-primary/20 bg-background/50">
          <CardHeader>
            <CardTitle className="text-foreground">{editingId ? "항목 수정" : "새로 만들기"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>카테고리</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>제목</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-primary/20"
                />
              </div>

              <div className="grid gap-2">
                <Label>설명</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="border-primary/20 resize-none"
                />
              </div>

              <div className="grid gap-2">
                <Label>기획서(PDF)</Label>
                {formData.pdf_url && (
                  <div className="flex items-center gap-2 mb-2 p-2 border border-primary/20 rounded">
                    <span className="text-primary truncate max-w-[200px]">{formData.pdf_url}</span>
                    <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, pdf_url: null })} className="ml-auto text-destructive border-transparent hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div>
                  <Button variant="outline" className="border-primary/20 relative w-full sm:w-auto overflow-hidden">
                    {isLoading ? "업로드 중..." : "PDF 업로드"}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf"
                      onChange={(e) => handleUpload(e, "pdf_url")}
                      disabled={isLoading}
                    />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 border-t border-primary/10 pt-4 mt-2">
                <Label>썸네일 (대표 이미지)</Label>
                {formData.thumbnail_url && (
                  <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-primary/20">
                    <Image src={formData.thumbnail_url} alt="Thumbnail" fill className="object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() => setFormData({ ...formData, thumbnail_url: null })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div>
                  <Button variant="outline" className="relative border-primary/20 w-fit">
                    {isLoading ? "업로드 중..." : "썸네일 업로드"}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, "thumbnail")}
                      disabled={isLoading}
                    />
                  </Button>
                </div>
              </div>

              {formData.category === "webtoon" ? (
                <div className="grid gap-4 border-t border-primary/10 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-bold">회차 (Episodes)</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        episodes: [...(prev.episodes || []), { title: "", url: "" }]
                      }))}
                      className="border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" /> 새 회차 
                    </Button>
                  </div>
                  
                  {(formData.episodes || []).map((episode, index) => (
                    <Card key={index} className="border border-primary/20 bg-card">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 grid gap-4">
                            <Input
                              placeholder="회차 제목 (예: 1화)"
                              value={episode.title}
                              onChange={(e) => handleEpisodeChange(index, "title", e.target.value)}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                            <div className="p-3 border border-primary/10 rounded-lg bg-background/30 space-y-3">
                              <Label className="text-xs text-muted-foreground flex items-center mb-1">
                                원고 (회차별 이미지 직접 업로드)
                              </Label>
                              {episode.images && episode.images.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                  {episode.images.map((url, imgIndex) => (
                                    <div key={imgIndex} className="relative aspect-[3/4] rounded border border-primary/20 group">
                                      <Image src={url} alt={\원고 \\} fill className="object-cover rounded" />
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute right-1 top-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeEpisodeImage(index, imgIndex)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic my-2">업로드된 원고가 없습니다.</p>
                              )}
                              <Button variant="outline" size="sm" className="relative w-fit border-primary/20">
                                {isLoading ? "업로드 중..." : "새 원고 이미지 추가"}
                                <input
                                  type="file"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleEpisodeImageUpload(e, index)}
                                  disabled={isLoading}
                                />
                              </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center my-1">- 또는 외부 링크 사용 -</p>
                            
                            <Input
                              placeholder="외부 주소 URL 연결 (예: 포스타입 등 옵션)"
                              value={episode.url || ""}
                              onChange={(e) => handleEpisodeChange(index, "url", e.target.value)}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                episodes: (prev.episodes || []).filter((_, i) => i !== index)
                              }))
                            }}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(formData.episodes?.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-primary/20 rounded-md">
                      등록된 회차가 없습니다. 새 회차를 추가하고 이미지를 업로드하세요.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-2 border-t border-primary/10 pt-4 mt-2">
                  <Label>상세 이미지 목록 (일러스트/스케치용)</Label>
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative aspect-auto min-h-[100px] overflow-hidden rounded-lg border border-primary/20">
                          <Image src={url} alt={\Image \\} fill className="object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <Button variant="outline" className="relative border-primary/20 w-fit">
                      {isLoading ? "업로드 중..." : "이미지 일괄 업로드"}
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleUpload(e, "images")}
                        disabled={isLoading}
                      />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-primary/10 pt-4 mt-4">
                <div className="space-y-0.5">
                  <Label className="text-base text-foreground">공개 상태 (게시)</Label>
                  <p className="text-sm text-foreground/60">
                    끄면 관리자에게만 보입니다.
                  </p>
                </div>
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="border-primary/20 text-foreground hover:bg-primary/10">
                취소
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading ? "저장 중..." : (editingId ? "항목 수정" : "생성")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {posts.map(post => (
          <Card key={post.id} className="border-primary/20 bg-background/50 hover:bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              {post.thumbnail_url && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-primary/20">
                  <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                <p className="text-sm text-foreground/60">
                  {categories.find(c => c.value === post.category)?.label} ? {post.is_published ? "공개" : "비공개 (초안)"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                  <Pencil className="h-4 w-4 text-primary" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {posts.length === 0 && (
          <div className="py-12 text-center text-foreground/50 border border-primary/20 rounded bg-background/50">
            게시물이 없습니다. 첫 번째 포스트를 등록해보세요!
          </div>
        )}
      </div>
    </div>
  )
}
\

fs.writeFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx', postsManagerContent, 'utf8');
