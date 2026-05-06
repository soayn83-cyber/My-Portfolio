"use client"

import { useState, useMemo } from "react"
import { GalleryGrid } from "./gallery-grid"
import { Post } from "./gallery-grid"

export interface IllustrationClientProps {
  posts: Post[]
}

const TABS = [
  { label: "전체", value: "all" },
  { label: "원고형 일러스트", value: "manuscript" },
  { label: "개인 일러스트", value: "personal" },
  { label: "드로잉", value: "drawing" },
]

export function IllustrationClient({ posts }: IllustrationClientProps) {
  const [activeTab, setActiveTab] = useState("all")

  const filteredPosts = useMemo(() => {
    if (activeTab === "all") return posts

    return posts.filter(post => {
      // type 정보가 없으면 기본값인 personal로 간주 (기존 포스트 대응)
      const isPersonal = !post.keywords?.includes("type:manuscript") && !post.keywords?.includes("type:drawing");
      
      if (activeTab === "personal") {
        return post.keywords?.includes("type:personal") || isPersonal;
      }
      
      return post.keywords?.includes(`type:${activeTab}`);
    })
  }, [posts, activeTab])

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-primary/20 bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <GalleryGrid 
        posts={filteredPosts} 
        category="illustration"
        emptyMessage="해당 카테고리에 등록된 일러스트가 없습니다."
      />
    </div>
  )
}
