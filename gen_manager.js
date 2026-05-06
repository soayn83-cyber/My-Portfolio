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
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from "lucide-react"
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
      alert("업로드 실패: " + error.message)
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

  const moveEpisode = (index: number, direction: "up" | "down") => {
    setFormData(prev => {
      const newEpisodes = [...(prev.episodes || [])]
      if (direction === "up" && index > 0) {
        const temp = newEpisodes[index - 1]
        newEpisodes[index - 1] = newEpisodes[index]
        newEpisodes[index] = temp
      } else if (direction === "down" && index < newEpisodes.length - 1) {
        const temp = newEpisodes[index + 1]
        newEpisodes[index + 1] = newEpisodes[index]
        newEpisodes[index] = temp
      }
      return { ...prev, episodes: newEpisodes }
    })
  }

  const removeEpisode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      episodes: (prev.episodes || []).filter((_, i) => i !== index)
    }))
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
        <h2 className="text-xl font-serif text-foreground">Posts Manager</h2>
        {!isCreating && (
          <Button onClick={handleCreateNew} variant="outline" className="border-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            새 항목 등록
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="border border-primary/20 bg-background/50 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif">
              {editingId ? "Edit Post" : "새 포스트"}
            </h3>
            <Button variant="ghost" onClick={handleCancel}><X className="h-5 w-5"/></Button>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
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

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="제목을 입력하세요"
                  className="border-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="border-primary/20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-end gap-4">
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
                    {isLoading ? "업로드 중..." : "Upload Thumbnail"}
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
            </div>

            {formData.category === "webtoon" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <Label className="text-lg font-bold text-primary">회차업로드</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary/20 text-primary"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      episodes: [...(prev.episodes || []), { title: "", images: [] }]
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 새 회차 (추가)
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {(formData.episodes || []).map((episode, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border-2 border-primary/30 rounded-xl bg-card shadow-sm">
                      {/* Left: Episode Title */}
                      <div className="w-full md:w-[200px] flex-shrink-0 space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">회차 제목</Label>
                        <Input
                          placeholder="예: 1화"
                          value={episode.title}
                          onChange={(e) => handleEpisodeChange(index, "title", e.target.value)}
                          className="border-primary/20 h-10 text-base"
                        />
                      </div>

                      {/* Middle: Images Upload & Vertical Scroll */}
                      <div className="flex-1 border border-primary/20 rounded-lg p-3 bg-background/50 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-semibold text-muted-foreground">회차 이미지 업로드</Label>
                          <Button variant="secondary" size="sm" className="relative text-xs h-8 px-3">
                            {isLoading ? "업로드 중..." : "이미지 추가"}
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

                        {episode.images && episode.images.length > 0 ? (
                          <div className="flex-1 bg-background/80 rounded-md border border-primary/10 max-h-[300px] overflow-y-auto p-2 space-y-2">
                            {episode.images.map((url, imgIdx) => (
                              <div key={imgIdx} className="relative w-full aspect-auto min-h-[150px] rounded group bg-muted flex items-center justify-center overflow-hidden border border-primary/10">
                                <Image
                                  src={url}
                                  alt={\회차 \ 원고 \\}
                                  width={800}
                                  height={1200}
                                  className="w-full h-auto object-contain"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 shadow-md"
                                    onClick={() => removeEpisodeImage(index, imgIdx)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-center border-2 border-dashed border-primary/20 rounded-md min-h-[150px] text-muted-foreground text-sm">
                            업로드된 원고가 없습니다.
                          </div>
                        )}
                      </div>

                      {/* Right: Controls */}
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-[80px] justify-center mt-2 md:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-primary/20"
                          onClick={() => moveEpisode(index, "up")}
                          disabled={index === 0}
                          title="순서 위로"
                        >
                          <ArrowUp className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">위로</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-primary/20"
                          onClick={() => moveEpisode(index, "down")}
                          disabled={index === (formData.episodes?.length || 0) - 1}
                          title="순서 아래"
                        >
                          <ArrowDown className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">아래</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 shadow-sm"
                          onClick={() => removeEpisode(index)}
                          title="휴지통"
                        >
                          <Trash2 className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">삭제</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!formData.episodes || formData.episodes.length === 0) && (
                     <div className="text-center py-8 text-muted-foreground border border-dashed border-primary/20 rounded-lg">
                       + 새 회차를 추가해주세요
                     </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="grid gap-2 border-t border-primary/10 pt-4">
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
                      {isLoading ? "업로드 중..." : "이미지 추가 일괄 업로드"}
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
              </div>
            )}

            <div className="space-y-2 border-t border-primary/10 pt-4">
              <Label>기획서 (PDF) - 선택사항</Label>
              {formData.pdf_url && (
                <div className="flex items-center gap-2 mb-2 p-2 border border-primary/20 rounded bg-background/50">
                  <span className="text-primary truncate max-w-[300px] flex-1 text-sm">{formData.pdf_url}</span>
                  <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, pdf_url: null })} className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="mt-1">
                <Button variant="outline" className="relative border-primary/20">
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

            <div className="flex items-center justify-between border-t border-primary/10 pt-4 mt-4">
              <div className="space-y-0.5">
                <Label className="text-base text-foreground">Published (공개 설정)</Label>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-primary/20">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="bg-background">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-primary text-primary-foreground">
              {isLoading ? "저장 중..." : (editingId ? "Update Post" : "Create Post")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 mt-8">
        {posts.map(post => (
          <Card key={post.id} className="border-primary/20 bg-background/50 hover:bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              {post.thumbnail_url && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-primary/20">
                  <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{post.title}</h3>
                <p className="text-sm text-foreground/60 mt-1">
                  {categories.find(c => c.value === post.category)?.label} ? {post.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="border border-primary/10 bg-background hover:bg-primary/10 hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="border border-destructive/20 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
          <div className="py-12 text-center text-muted-foreground border border-dashed border-primary/20 rounded bg-background/50">
            등록된 포스트가 없습니다. 관리자 패널에서 새로 생성하세요.
          </div>
        )}
      </div>
    </div>
  )
}
\

fs.writeFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx', postsManagerContent, 'utf8');
console.log('Fixed and modernized the posts manager section!')
