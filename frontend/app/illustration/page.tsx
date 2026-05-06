import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { IllustrationClient } from "@/components/illustration-client"

export default async function IllustrationPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("category", "illustration")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4">
        <PageHeader
          title="Illustration"
          description="A collection of my illustrations and artwork"
        />
        <IllustrationClient posts={posts || []} />
      </div>
    </div>
  )
}
