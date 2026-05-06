import { createClient } from "@/lib/supabase/server"
import { ProfileContent } from "@/components/profile-content"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .single()

  return <ProfileContent profile={profile} />
}
