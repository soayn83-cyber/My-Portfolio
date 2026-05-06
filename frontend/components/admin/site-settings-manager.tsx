"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { revalidateSite } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import Image from "next/image"

interface SiteSettings {
  id: string
  site_name?: string | null
  site_logo_url?: string | null
  hero_image_url: string | null
  hero_text?: string | null
}

interface SiteSettingsManagerProps {
  settings: SiteSettings | null
}

export function SiteSettingsManager({ settings }: SiteSettingsManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Parse extra settings from hero_text JSON
  let parsedExtras: any = {}
  try {
    if (settings?.hero_text) {
      parsedExtras = JSON.parse(settings.hero_text)
    }
  } catch (e) {}

  const [formData, setFormData] = useState({
    hero_image_url: settings?.hero_image_url || "",
    site_logo_url: settings?.site_logo_url || "",
    site_title: settings?.site_name || parsedExtras?.site_title || "Portfolio",
    main_text: parsedExtras?.main_text || "",
    sub_text: parsedExtras?.sub_text || "",
    profile_image_url: parsedExtras?.profile_image_url || "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "site_logo_url" | "hero_image_url" | "profile_image_url") => {
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
      
      setFormData(prev => ({ ...prev, [field]: data.url }))
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("이미지 업로드 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      // Pack extra text fields as JSON string inside hero_text
      const heroTextJSON = JSON.stringify({
        site_title: formData.site_title,
        main_text: formData.main_text,
        sub_text: formData.sub_text,
        profile_image_url: formData.profile_image_url,
      });

      if (settings?.id) {
        const { error } = await supabase
          .from("site_settings")
          .update({
            site_name: formData.site_title || null,
            hero_image_url: formData.hero_image_url || null,
            site_logo_url: formData.site_logo_url || null,
            hero_text: heroTextJSON,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settings.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({
            site_name: formData.site_title || null,
            hero_image_url: formData.hero_image_url || null,
            site_logo_url: formData.site_logo_url || null,
            hero_text: heroTextJSON,
          })

        if (error) throw error
      }

      await revalidateSite()
      router.refresh()
    } catch (error: any) {
      console.error("Save error details:", error)
      alert("데이터 저장 실패: " + (error.message || JSON.stringify(error)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="font-serif">1. Main Page Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Image Upload */}
          <div className="space-y-2">
            <Label>대표 프로필 이미지 (Logo)</Label>
            <div className="flex flex-col gap-4">
              {formData.site_logo_url && (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-primary/20">
                  <Image
                    src={formData.site_logo_url}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5 w-max">
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-sm">Upload Logo Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "site_logo_url")}
                />
              </label>
            </div>
          </div>

          {/* Hero Image Upload */}
          <div className="space-y-2">
            <Label>1-1. 전체 배경 이미지 (Hero Image)</Label>
            <div className="flex flex-col gap-4">
              {formData.hero_image_url && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-primary/20">
                  <Image
                    src={formData.hero_image_url}
                    alt="Hero"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-sm">Upload Hero Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "hero_image_url")}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_text">1-2. 메인 문구 텍스트</Label>
            <Input
              id="main_text"
              value={formData.main_text}
              onChange={(e) => setFormData(prev => ({ ...prev, main_text: e.target.value }))}
              placeholder="예: 안녕하세요. 아티스트 OO입니다."
              className="border-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub_text">1-3. 서브 텍스트</Label>
            <Input
              id="sub_text"
              value={formData.sub_text}
              onChange={(e) => setFormData(prev => ({ ...prev, sub_text: e.target.value }))}
              placeholder="예: 일러스트, 웹툰 등의 작업을 진행합니다."
              className="border-primary/20"
            />
          </div>

          {/* Profile Image Upload */}
          <div className="space-y-2">
            <Label>1-4. 대표 프로필 이미지 (원형 이미지)</Label>
            <div className="flex items-center gap-4">
              {formData.profile_image_url && (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-primary/20">
                  <Image
                    src={formData.profile_image_url}
                    alt="Profile Image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-sm">Upload Profile Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "profile_image_url")}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_title">1-5. 홈페이지 메인 이름</Label>
            <Input
              id="site_title"
              value={formData.site_title}
              onChange={(e) => setFormData(prev => ({ ...prev, site_title: e.target.value }))}
              className="border-primary/20"
              placeholder="예: Portfolio"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
