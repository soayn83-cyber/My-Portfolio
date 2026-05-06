"use client"

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
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, Upload } from "lucide-react"
import Image from "next/image"

export interface WorkStep {
  image_url: string
  description: string
}

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
  keywords?: string | null
  production_date?: string | null
  work_steps?: WorkStep[] | null
  sub_category?: string | null
}

const categories = [
  { value: "webtoon", label: "Webtoon" },
  { value: "work_process", label: "Work Process" },
  { value: "illustration", label: "Illustration" },
]

export function PostsManager({ posts: initialPosts, defaultCategory = "webtoon" }: { posts: Post[], defaultCategory?: "webtoon" | "work_process" | "illustration" | string }) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Post>>({
    category: defaultCategory,
    title: "",
    description: "",
    thumbnail_url: null,
    images: [],
    is_published: false,
    episodes: [],
    pdf_url: null,
    keywords: null,
    production_date: null,
    work_steps: [],
    sub_category: "serialized"
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSwapOrder = async (post: Post, direction: "up" | "down") => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const categoryPosts = posts
        .filter(p => p.category === post.category)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
      const currentIndex = categoryPosts.findIndex(p => p.id === post.id)
      let targetPost = null
      
      if (direction === "up" && currentIndex > 0) {
        targetPost = categoryPosts[currentIndex - 1]
      } else if (direction === "down" && currentIndex < categoryPosts.length - 1) {
        targetPost = categoryPosts[currentIndex + 1]
      }
      
      if (!targetPost) {
        setIsLoading(false)
        return
      }

      let newPostDate = targetPost.created_at
      let newTargetDate = post.created_at
      
      if (newPostDate === newTargetDate) {
         const d = new Date(newPostDate)
         if (direction === 'up') d.setSeconds(d.getSeconds() + 1)
         else d.setSeconds(d.getSeconds() - 1)
         newPostDate = d.toISOString()
      }

      await supabase.from("posts").update({ created_at: newPostDate }).eq("id", post.id)
      await supabase.from("posts").update({ created_at: newTargetDate }).eq("id", targetPost.id)
      
      const newPosts = posts.map(p => {
        if (p.id === post.id) return { ...p, created_at: newPostDate }
        if (p.id === targetPost.id) return { ...p, created_at: newTargetDate }
        return p
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setPosts(newPosts)
      await revalidateSite()
      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert("순서 변경 실패: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setEditingId(null)
    setFormData({
      category: defaultCategory,
      title: "",
      description: "",
      thumbnail_url: null,
      images: [],
      is_published: false,
      episodes: [],
      pdf_url: null,
      keywords: null,
      production_date: null,
      work_steps: []
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
      category: defaultCategory,
      title: "",
      description: "",
      thumbnail_url: null,
      images: [],
      is_published: false,
      episodes: [],
      pdf_url: null,
      keywords: null,
      production_date: null,
      work_steps: []
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "images" | "pdf_url") => {
    const files = e.target.files
    if (!files?.length) return

    setIsLoading(true)
    try {
      const urls: string[] = []
      const supabase = createClient()
      
      for (const file of Array.from(files)) {
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_SIZE) {
            throw new Error(`파일 (${file.name}) 크기가 50MB 초과! (현재: ${(file.size/1024/1024).toFixed(2)}MB)\n다운사이징하거나 분할해 주세요.`);
        }
        const fileExt = file.name.split('.').pop() || "png"
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          })

        if (uploadError) throw new Error(uploadError.message || "Upload failed")

        const { data: publicUrlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName)
          
        urls.push(publicUrlData.publicUrl)
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
      const supabase = createClient()
      
      for (const file of Array.from(files)) {
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_SIZE) {
            throw new Error(`파일 (${file.name}) 크기가 50MB 초과! (현재: ${(file.size/1024/1024).toFixed(2)}MB)\n다운사이징하거나 분할해 주세요.`);
        }
        const fileExt = file.name.split('.').pop() || "png"
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          })

        if (uploadError) throw new Error(uploadError.message || "Upload failed")

        const { data: publicUrlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName)
          
        urls.push(publicUrlData.publicUrl)
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

  const moveEpisodeImage = (episodeIndex: number, imageIndex: number, direction: "up" | "down") => {
    setFormData(prev => {
      const newEpisodes = [...(prev.episodes || [])]
      const ep = newEpisodes[episodeIndex]
      if (ep.images) {
        const newImages = [...ep.images]
        if (direction === "up" && imageIndex > 0) {
          const temp = newImages[imageIndex - 1]
          newImages[imageIndex - 1] = newImages[imageIndex]
          newImages[imageIndex] = temp
        } else if (direction === "down" && imageIndex < newImages.length - 1) {
          const temp = newImages[imageIndex + 1]
          newImages[imageIndex + 1] = newImages[imageIndex]
          newImages[imageIndex] = temp
        }
        newEpisodes[episodeIndex] = { ...ep, images: newImages }
      }
      return { ...prev, episodes: newEpisodes }
    })
  }


  const handleWorkStepImageUpload = async (index: number | null, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setIsLoading(true)
    try {
      const newSteps: WorkStep[] = []
      const supabase = createClient()
      
      for (const file of Array.from(files)) {
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) throw new Error(`파일 (${file.name}) 크기가 50MB 초과!`)
        const fileExt = file.name.split('.').pop() || "png"
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file, { contentType: file.type || 'application/octet-stream', upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName)
        newSteps.push({ image_url: publicUrlData.publicUrl, description: "" })
      }
      
      setFormData(prev => {
        if (index !== null) {
          const currentSteps = prev.work_steps ? [...prev.work_steps] : []
          if (!currentSteps[index]) return prev
          currentSteps[index].image_url = newSteps[0].image_url
          return { ...prev, work_steps: currentSteps }
        } else {
          return { ...prev, work_steps: [...(prev.work_steps || []), ...newSteps] }
        }
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("작업 이미지 업로드 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const removeWorkStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      work_steps: (prev.work_steps || []).filter((_, i) => i !== index)
    }))
  }

  const handleWorkStepChange = (index: number, description: string) => {
    setFormData(prev => {
      const newSteps = [...(prev.work_steps || [])]
      newSteps[index] = { ...newSteps[index], description }
      return { ...prev, work_steps: newSteps }
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
        pdf_url: formData.pdf_url || null,
        keywords: formData.keywords || null,
        production_date: formData.production_date || null,
        work_steps: formData.work_steps || null,
        sub_category: formData.sub_category || null
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
        <div className="border border-primary/20 bg-background/50 rounded-xl p-6 space-y-6 shadow-sm">
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
              <Label>로그라인 (Description)</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="border-primary/20 resize-none"
              />
            </div>

            {formData.category === "webtoon" && (
              <div className="space-y-4">
                <div className="space-y-2">                    <Label>웹툰 탭 위치 (분류)</Label>
                    <div className="flex items-center gap-4">
                      <Label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 hover:bg-primary/5">
                        <input 
                          type="radio" 
                          name="webtoon-tab" 
                          value="serialized" 
                          checked={formData.sub_category === "serialized" || !formData.sub_category}
                          onChange={() => setFormData({ ...formData, sub_category: "serialized" })}
                          className="accent-primary"
                        />
                        <span>연재작</span>
                      </Label>
                      <Label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 hover:bg-primary/5">
                        <input 
                          type="radio" 
                          name="webtoon-tab" 
                          value="personal" 
                          checked={formData.sub_category === "personal"}
                          onChange={() => setFormData({ ...formData, sub_category: "personal" })}
                          className="accent-primary"
                        />
                        <span>연구작(개인작)</span>
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">                  <Label>작품 키워드 (Keywords)</Label>
                  <Input
                    value={formData.keywords || ""}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="예: #로맨스 #판타지 #계약연애"
                    className="border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>제작 시기 (선택사항)</Label>
                  <Input
                    value={formData.production_date || ""}
                    onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                    placeholder="예: 2023.01 ~ 2023.06"
                    className="border-primary/20"
                  />
                </div>
              </div>
            )}

            {formData.category === "illustration" && (
              <div className="space-y-6 pb-4 border-b border-primary/10">
                <div className="space-y-3">
                  <Label>일러스트 세부 카테고리 (Type)</Label>
                  <div className="flex items-center gap-4">
                    <Label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 hover:bg-primary/5 data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary/10">
                      <input 
                        type="radio" 
                        name="illustration-type" 
                        value="manuscript" 
                        checked={formData.keywords?.includes("type:manuscript") || false}
                        onChange={() => setFormData({ 
                          ...formData, 
                          keywords: `layout:${formData.keywords?.includes("layout:horizontal") ? "horizontal" : "vertical"},type:manuscript`
                        })}
                        className="accent-primary"
                      />
                      <span>원고형 일러스트</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 hover:bg-primary/5 data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary/10">
                      <input 
                        type="radio" 
                        name="illustration-type" 
                        value="personal" 
                        checked={(!formData.keywords?.includes("type:manuscript") && !formData.keywords?.includes("type:drawing")) || false}
                        onChange={() => setFormData({ 
                          ...formData, 
                          keywords: `layout:${formData.keywords?.includes("layout:horizontal") ? "horizontal" : "vertical"},type:personal`
                        })}
                        className="accent-primary"
                      />
                      <span>개인 일러스트</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 hover:bg-primary/5 data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary/10">
                      <input 
                        type="radio" 
                        name="illustration-type" 
                        value="drawing" 
                        checked={formData.keywords?.includes("type:drawing") || false}
                        onChange={() => setFormData({ 
                          ...formData, 
                          keywords: `layout:${formData.keywords?.includes("layout:horizontal") ? "horizontal" : "vertical"},type:drawing`
                        })}
                        className="accent-primary"
                      />
                      <span>드로잉</span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>이미지 목록 내 배치 형태 (Layout)</Label>
                  <div className="flex items-center gap-4">
                    <Label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 hover:bg-primary/5 data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary/10">
                      <input 
                        type="radio" 
                        name="illustration-layout" 
                        value="vertical" 
                        checked={!formData.keywords?.includes("layout:horizontal") || false}
                        onChange={() => setFormData({ 
                          ...formData, 
                          keywords: `layout:vertical,type:${formData.keywords?.match(/type:([^,]+)/)?.[1] || "personal"}` 
                        })}
                        className="accent-primary"
                      />
                      <span>세로형 (1/3 크기)</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 hover:bg-primary/5 data-[state=checked]:border-primary/50 data-[state=checked]:bg-primary/10">
                      <input 
                        type="radio" 
                        name="illustration-layout" 
                        value="horizontal" 
                        checked={formData.keywords?.includes("layout:horizontal") || false}
                        onChange={() => setFormData({ 
                          ...formData, 
                          keywords: `layout:horizontal,type:${formData.keywords?.match(/type:([^,]+)/)?.[1] || "personal"}`
                        })}
                        className="accent-primary"
                      />
                      <span>가로형 (2/3 크기)</span>
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">세로형은 1칸, 가로형을 선택할 경우 일러스트 갤러리 메인에서 2칸을 차지합니다.</p>
                </div>
              </div>
            )}

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
                <div className="flex justify-between items-center border-b border-primary/10 pb-2 mt-4">
                  <Label className="text-xl font-bold text-primary">회차업로드</Label>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-primary text-primary-foreground font-bold"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      episodes: [...(prev.episodes || []), { title: "", images: [] }]
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> 새 회차 추가
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {(formData.episodes || []).map((episode, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-0 border-2 border-primary/40 rounded-xl overflow-hidden bg-card shadow-sm">
                      
                      {/* Left: Episode Title */}
                      <div className="w-full md:w-[150px] p-4 bg-muted/30 border-b md:border-b-0 md:border-r border-primary/20 flex flex-col justify-center">
                        <Label className="text-sm font-semibold text-muted-foreground mb-2 hidden md:block">회차 제목</Label>
                        <Input
                          placeholder="예: 1화"
                          value={episode.title}
                          onChange={(e) => handleEpisodeChange(index, "title", e.target.value)}
                          className="border-primary/30 h-10 font-bold"
                        />
                      </div>

                      {/* Middle: Images Upload & Vertical Scroll */}
                      <div className="flex-1 p-4 bg-background flex flex-col min-h-[250px]">
                        {formData.sub_category === "serialized" ? (
                          <div className="flex flex-col gap-4 justify-center h-full max-w-md mx-auto w-full">
                            <Label className="text-base font-semibold text-muted-foreground">연결할 외부 링크 (URL)</Label>
                            <Input
                              placeholder="예: https://comic.naver.com/webtoon/detail..."
                              value={episode.url || ""}
                              onChange={(e) => handleEpisodeChange(index, "url", e.target.value)}
                              className="border-primary/30 h-10"
                            />
                            <p className="text-sm text-muted-foreground">
                              웹툰 플랫폼 등의 외부 링크를 입력하세요.<br/>
                              사용자가 회차를 클릭하면 해당 주소로 바로 이동합니다.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-3">
                              <Label className="text-sm font-semibold text-muted-foreground">원고 등록 (스크롤 뷰)</Label>
                              <Button variant="outline" size="sm" className="relative h-8 px-3 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
                                {isLoading ? "업로드 중..." : "이미지 업로드 (+)"}
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

                            <div className="flex-1 bg-muted/20 border border-primary/20 h-[350px] max-h-[350px] overflow-y-auto p-0 flex flex-col rounded-none">
                              {episode.images && episode.images.length > 0 ? (
                                episode.images.map((url, imgIdx) => (
                                  <div key={imgIdx} className="relative w-full bg-background flex flex-col items-center p-0 m-0">
                                    
                                    <div className="relative w-full flex items-center justify-center p-0 m-0">
                                      <img
                                        src={url}
                                        alt={`원고 ${imgIdx + 1}`}
                                        className="w-full h-auto block m-0 p-0 rounded-none object-cover"
                                        style={{ display: "block" }}
                                      />
                                      {/* Floating overlay controls */}
                                      <div className="absolute top-2 right-2 flex flex-col gap-1 bg-background/80 backdrop-blur-sm p-1 border border-primary/20 shadow-sm">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/20" disabled={imgIdx === 0} onClick={() => moveEpisodeImage(index, imgIdx, "up")}>
                                          <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <div className="text-[10px] font-bold text-center leading-none py-1">{imgIdx + 1}</div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/20" disabled={imgIdx === episode.images!.length - 1} onClick={() => moveEpisodeImage(index, imgIdx, "down")}>
                                          <ArrowDown className="h-3 w-3" />
                                        </Button>
                                        <div className="w-full h-px bg-primary/20 my-1"></div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/20 text-destructive" onClick={() => removeEpisodeImage(index, imgIdx)}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-primary/10 rounded-md">
                                  업로드된 회차 이미지가 없습니다.
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right: Controls */}
                      <div className="flex flex-row md:flex-col w-full md:w-[60px] border-t md:border-t-0 md:border-l border-primary/20 bg-muted/10">
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-none border-b md:border-b border-r md:border-r-0 border-primary/20 hover:bg-primary/10 h-10 md:h-auto"
                          onClick={() => moveEpisode(index, "up")}
                          disabled={index === 0}
                          title="순서 위로"
                        >
                          <ArrowUp className="h-4 w-4 text-foreground/70" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-none border-b md:border-b-0 border-r md:border-r-0 border-primary/20 hover:bg-primary/10 h-10 md:h-auto"
                          onClick={() => moveEpisode(index, "down")}
                          disabled={index === (formData.episodes?.length || 0) - 1}
                          title="순서 아래"
                        >
                          <ArrowDown className="h-4 w-4 text-foreground/70" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-none hover:bg-destructive/10 h-10 md:h-auto opacity-80 hover:opacity-100"
                          onClick={() => removeEpisode(index)}
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!formData.episodes || formData.episodes.length === 0) && (
                     <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-primary/20 rounded-xl bg-card">
                       + 상단의 버튼을 눌러 첫 번째 회차를 추가해주세요
                     </div>
                  )}
                </div>
              </div>
            ) : formData.category === "work_process" ? (
              <div className="space-y-4 pt-4 border-t border-primary/10">
                <Label>상세 작업 과정 목록 (수평 스크롤)</Label>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x items-stretch">
                  {formData.work_steps && formData.work_steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="min-w-[300px] w-[300px] flex-shrink-0 snap-center rounded-lg border border-primary/20 bg-muted/30 p-4 space-y-4 flex flex-col relative h-[450px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg text-primary">Step {stepIndex + 1}</span>
                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-600 h-8 px-2" onClick={() => removeWorkStep(stepIndex)}>X</Button>
                      </div>
                      <div className="flex-shrink-0 h-[200px] w-full border border-primary/20 rounded-md relative overflow-hidden bg-background">
                        {step.image_url ? (
                          <div className="w-full h-full relative group">
                            <Image src={step.image_url} alt={`Step ${stepIndex + 1}`} fill className="object-contain" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Label className="cursor-pointer text-white text-sm bg-black/50 px-3 py-1 rounded-md">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWorkStepImageUpload(stepIndex, e)} />
                                변경
                              </Label>
                            </div>
                          </div>
                        ) : (
                          <Label className="flex w-full h-full cursor-pointer flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                            <span className="text-3xl text-muted-foreground">+</span>
                            <span className="text-xs text-muted-foreground">이미지 업로드</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWorkStepImageUpload(stepIndex, e)} />
                          </Label>
                        )}
                      </div>
                      <div className="flex-1 min-h-0 pt-2">
                         <Textarea placeholder="이 단계의 과정을 설명해주세요." value={step.description || ""} onChange={(e) => handleWorkStepChange(stepIndex, e.target.value)} className="w-full h-full resize-none text-sm bg-background/50 border-primary/20 p-3" />
                      </div>
                    </div>
                  ))}
                  <div className="min-w-[300px] w-[300px] flex-shrink-0 snap-center rounded-lg border border-dashed border-primary/30 bg-muted/10 flex items-center justify-center p-4 hover:bg-muted/30 transition-colors h-[450px]">
                    <Button type="button" variant="ghost" className="h-full w-full flex flex-col gap-4 text-muted-foreground hover:text-primary" onClick={() => { const steps = formData.work_steps ? [...formData.work_steps] : []; setFormData({ ...formData, work_steps: [...steps, { image_url: "", description: "" }] }); }}>
                      <span className="text-5xl border border-dashed border-current rounded-full w-16 h-16 flex items-center justify-center mb-2 pb-1">+</span>
                      <span>새 작업 단계 추가</span>
                    </Button>
                  </div>
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
                          <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />
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

            <div className="space-y-2 border-t border-primary/10 pt-4 mt-6">
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

            <div className="flex items-center justify-between border-t border-primary/20 pt-6 mt-2 pb-2">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-foreground">Published (공개 설정)</Label>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                className="scale-125 origin-right"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-primary/30">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="px-6 border-primary/20">
              취소
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-primary text-primary-foreground font-bold px-8">
              {isLoading ? "진행 중..." : (editingId ? "수정 완료" : "포스트 생성하기")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 mt-8">
        {posts.map(post => (
          <Card key={post.id} className="border border-primary/20 bg-background/50 hover:bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              {post.thumbnail_url && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-primary/20">
                  <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{post.title}</h3>
                <p className="text-sm text-foreground/60 mt-1">
                  {categories.find(c => c.value === post.category)?.label} • {post.is_published ? "배포됨" : "숨김(초안)"}
                </p>
              </div>
              <div className="flex items-center gap-2">                  <Button variant="ghost" size="icon" onClick={() => handleSwapOrder(post, 'up')} className="border border-primary/10 bg-background hover:bg-primary/20 hover:text-primary" disabled={isLoading} title="위로 올리기 (최신순위)">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSwapOrder(post, 'down')} className="border border-primary/10 bg-background hover:bg-primary/20 hover:text-primary" disabled={isLoading} title="아래로 내리기">
                    <ArrowDown className="h-4 w-4" />
                  </Button>                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="border border-primary/10 bg-background hover:bg-primary/10 hover:text-primary">
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
          <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-primary/20 rounded-xl bg-background/50">
            등록된 포스트가 없습니다. 관리자 패널에서 새로 생성하세요.
          </div>
        )}
      </div>
    </div>
  )
}
