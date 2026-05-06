import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_auth")?.value === "true"

  if (!isAdmin) {
    redirect("/admin/login")
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Make a dummy user object for the dashboard if none is returned
  const dummyUser = user || { email: "admin", id: "admin-token", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "" }

  const [
    { data: posts },
    { data: settings },
    { data: profile }
  ] = await Promise.all([
    supabase.from("posts").select("*").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("*").single(),
    supabase.from("profile").select("*").single()
  ])

  return (
    <AdminDashboard
      user={dummyUser as any}
      posts={posts || []}
      settings={settings}
      profile={profile}
    />
  )
}
