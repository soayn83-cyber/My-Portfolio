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
import { Upload, Plus, X, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"

export interface ProfileItem {
  date: string
  content: string
}

export interface WorkLink {
  title: string
  episodes: string
  role: string
  url: string
}

export interface Profile {
  id: string
  name: string | null
  bio: string | null
  profile_image_url: string | null
  contact_email: string | null
  social_links: Record<string, string> | null
  experience: ProfileItem[] | null
  certifications: ProfileItem[] | null
  education: ProfileItem[] | null
  work_links: WorkLink[] | null
}

interface ProfileManagerProps {
  profile: Profile | null
}

export function ProfileManager({ profile }: ProfileManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    profile_image_url: profile?.profile_image_url || "",
    contact_email: profile?.contact_email || "",
    social_links: profile?.social_links || {},
    experience: profile?.experience || [],
    certifications: profile?.certifications || [],
    education: profile?.education || [],
    work_links: profile?.work_links || [],
  })
  const [newSocialPlatform, setNewSocialPlatform] = useState("")
  const [newSocialUrl, setNewSocialUrl] = useState("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Upload failed")
      
      setFormData(prev => ({ ...prev, profile_image_url: data.url }))
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("이미지 업로드 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addSocialLink = () => {
    if (newSocialPlatform && newSocialUrl) {
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [newSocialPlatform]: newSocialUrl,
        },
      }))
      setNewSocialPlatform("")
      setNewSocialUrl("")
    }
  }

  const removeSocialLink = (platform: string) => {
    setFormData(prev => {
      const newLinks = { ...prev.social_links }
      delete newLinks[platform]
      return { ...prev, social_links: newLinks }
    })
  }

  const handleArrayChange = (field: "experience" | "certifications" | "education", index: number, key: keyof ProfileItem, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]]
      newArray[index] = { ...newArray[index], [key]: value }
      return { ...prev, [field]: newArray }
    })
  }

  const addArrayItem = (field: "experience" | "certifications" | "education") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { date: "", content: "" }]
    }))
  }

  const removeArrayItem = (field: "experience" | "certifications" | "education", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const moveArrayItem = (field: "experience" | "certifications" | "education", index: number, direction: "up" | "down") => {
    setFormData(prev => {
      const newArray = [...prev[field]]
      if (direction === "up" && index > 0) {
        [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]]
      } else if (direction === "down" && index < newArray.length - 1) {
        [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]]
      }
      return { ...prev, [field]: newArray }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      if (profile?.id) {
        const { data, error: updateError } = await supabase
          .from("profile")
          .update({
            name: formData.name || null,
            bio: formData.bio || null,
            profile_image_url: formData.profile_image_url || null,
            contact_email: formData.contact_email || null,
            social_links: formData.social_links,
            experience: formData.experience,
            certifications: formData.certifications,
            education: formData.education,
            work_links: formData.work_links,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id)
          .select()

        if (updateError) {
          console.error("Supabase Update Error Details:", updateError)
          throw new Error("DB 업데이트 오류: " + updateError.message)
        }
      } else {
        const { data, error: insertError } = await supabase
          .from("profile")
          .insert({
            name: formData.name || null,
            bio: formData.bio || null,
            profile_image_url: formData.profile_image_url || null,
            contact_email: formData.contact_email || null,
            social_links: formData.social_links,
            experience: formData.experience,
            certifications: formData.certifications,
            education: formData.education,
            work_links: formData.work_links,
          })
          .select()

        if (insertError) {
          console.error("Supabase Insert Error Details:", insertError)
          throw new Error("DB 삽입 오류: " + insertError.message)
        }
      }

      await revalidateSite()
      router.refresh()
      alert("프로필이 성공적으로 저장되었습니다.")
    } catch (error: any) {
      console.error("Save error:", error)
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error)
      alert("프로필 저장에 실패했습니다: " + errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="font-serif">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              {formData.profile_image_url && (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-primary/20">
                  <Image
                    src={formData.profile_image_url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-sm">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="border-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="border-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
              className="border-primary/20"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label>Social Links</Label>
            
            {Object.entries(formData.social_links).map(([platform, url]) => (
              <div key={platform} className="flex items-center gap-2">
                <span className="w-24 text-sm font-medium">{platform}</span>
                <span className="flex-1 truncate text-sm text-foreground/70">{url}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialLink(platform)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Platform (e.g., Twitter)"
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value)}
                className="border-primary/20"
              />
              <Input
                placeholder="URL"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                className="border-primary/20"
              />
              <Button type="button" variant="outline" onClick={addSocialLink}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Work Links */}
          <div className="space-y-4 pt-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <Label>작품 바로가기 링크 (Work Links)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData(prev => ({
                ...prev,
                work_links: [...(prev.work_links || []), { title: "", episodes: "", role: "", url: "" }]
              }))}>
                <Plus className="h-4 w-4 mr-2" />
                추가
              </Button>
            </div>
            <div className="space-y-3">
              {(formData.work_links || []).map((link, index) => (
                <div key={index} className="flex flex-col gap-2 p-3 border border-primary/20 bg-muted/10 rounded-md">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="제목 (예: 모시던 아가씨가...)"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...(formData.work_links || [])]
                        newLinks[index].title = e.target.value
                        setFormData({ ...formData, work_links: newLinks })
                      }}
                      className="border-primary/20 bg-background text-sm flex-1"
                    />
                    <Input
                      placeholder="연재회차 (예: 1~30화)"
                      value={link.episodes}
                      onChange={(e) => {
                        const newLinks = [...(formData.work_links || [])]
                        newLinks[index].episodes = e.target.value
                        setFormData({ ...formData, work_links: newLinks })
                      }}
                      className="border-primary/20 bg-background text-sm w-[120px]"
                    />
                    <Input
                      placeholder="담당파트 (예: 선화)"
                      value={link.role}
                      onChange={(e) => {
                        const newLinks = [...(formData.work_links || [])]
                        newLinks[index].role = e.target.value
                        setFormData({ ...formData, work_links: newLinks })
                      }}
                      className="border-primary/20 bg-background text-sm w-[120px]"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="바로가기 링크 (예: https://comic.naver.com/...)"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...(formData.work_links || [])]
                        newLinks[index].url = e.target.value
                        setFormData({ ...formData, work_links: newLinks })
                      }}
                      className="border-primary/20 bg-background text-sm flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setFormData(prev => {
                          const arr = [...(prev.work_links || [])]
                          if (index > 0) {
                            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
                          }
                          return { ...prev, work_links: arr }
                        })
                      }} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setFormData(prev => {
                          const arr = [...(prev.work_links || [])]
                          if (index < arr.length - 1) {
                            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]]
                          }
                          return { ...prev, work_links: arr }
                        })
                      }} disabled={index === (formData.work_links?.length || 0) - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          work_links: prev.work_links?.filter((_, i) => i !== index) || []
                        }))
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!formData.work_links || formData.work_links.length === 0) && (
                <p className="text-sm text-muted-foreground w-full text-center py-4 border border-dashed border-primary/20 rounded-md">항목이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-4 pt-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <Label>경력사항 (Experience)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("experience")}>
                <Plus className="h-4 w-4 mr-2" />
                항목 추가
              </Button>
            </div>
            <div className="space-y-3">
              {formData.experience.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="기간 (예: 2025.10 ~ ING)"
                    value={item.date}
                    onChange={(e) => handleArrayChange("experience", index, "date", e.target.value)}
                    className="w-[180px] border-primary/20 text-sm"
                  />
                  <Input
                    placeholder="내용 (예: 단편 작화)"
                    value={item.content}
                    onChange={(e) => handleArrayChange("experience", index, "content", e.target.value)}
                    className="flex-1 border-primary/20 text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveArrayItem("experience", index, "up")} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveArrayItem("experience", index, "down")} disabled={index === formData.experience.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeArrayItem("experience", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {formData.experience.length === 0 && (
                <p className="text-sm text-muted-foreground w-full text-center py-4 border border-dashed border-primary/20 rounded-md">항목이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4 pt-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <Label>자격사항 (Certifications)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("certifications")}>
                <Plus className="h-4 w-4 mr-2" />
                항목 추가
              </Button>
            </div>
            <div className="space-y-3">
              {formData.certifications.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="취득일 (예: 2025.07)"
                    value={item.date}
                    onChange={(e) => handleArrayChange("certifications", index, "date", e.target.value)}
                    className="w-[180px] border-primary/20 text-sm"
                  />
                  <Input
                    placeholder="자격증명 (예: GTQ그래픽기술자격 1급)"
                    value={item.content}
                    onChange={(e) => handleArrayChange("certifications", index, "content", e.target.value)}
                    className="flex-1 border-primary/20 text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveArrayItem("certifications", index, "up")} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveArrayItem("certifications", index, "down")} disabled={index === formData.certifications.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeArrayItem("certifications", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {formData.certifications.length === 0 && (
                <p className="text-sm text-muted-foreground w-full text-center py-4 border border-dashed border-primary/20 rounded-md">항목이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4 pt-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <Label>학력사항 (Education)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("education")}>
                <Plus className="h-4 w-4 mr-2" />
                항목 추가
              </Button>
            </div>
            <div className="space-y-3">
              {formData.education.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="기간 (예: 2020.03 ~ 2024.02)"
                    value={item.date}
                    onChange={(e) => handleArrayChange("education", index, "date", e.target.value)}
                    className="w-[180px] border-primary/20 text-sm"
                  />
                  <Input
                    placeholder="학교/전공 (예: 한국대학교 웹툰학과 졸업)"
                    value={item.content}
                    onChange={(e) => handleArrayChange("education", index, "content", e.target.value)}
                    className="flex-1 border-primary/20 text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveArrayItem("education", index, "up")} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveArrayItem("education", index, "down")} disabled={index === formData.education.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeArrayItem("education", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {formData.education.length === 0 && (
                <p className="text-sm text-muted-foreground w-full text-center py-4 border border-dashed border-primary/20 rounded-md">항목이 없습니다.</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
