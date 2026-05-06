import { createClient } from "@/lib/supabase/server"
import { WebtoonList } from "@/components/webtoon-list"
import { PageHeader } from "@/components/page-header"

export default async function WebtoonPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("category", "webtoon")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4">
        <PageHeader
          title="Webtoon"
          description="Explore my webtoon works and stories"
        />
        <WebtoonList posts={posts || []} />
      </div>
    </div>
  )
}
