import { createClient } from "@/lib/supabase/server"
import { WorkProcessList } from "@/components/work-process-list"
import { PageHeader } from "@/components/page-header"

export default async function WorkProcessPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("category", "work_process")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4">
        <PageHeader
          title="Work Process"
          description="Behind the scenes of my creative journey"
        />
        <WorkProcessList 
          posts={posts || []} 
          emptyMessage="No work process posts yet. Check back soon!"
        />
      </div>
    </div>
  )
}
