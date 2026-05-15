import { ProfileContent } from "@/components/profile-content"
import { getProfile } from "@/lib/content-data"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  return <ProfileContent profile={await getProfile()} />
}
