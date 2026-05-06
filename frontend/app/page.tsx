import { createClient } from "@/lib/supabase/server"
import { HomeHero } from "@/components/home-hero"

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .single()

  let mainText = "Welcome to My Portfolio"
  let subText = "Explore my creative world of illustrations, webtoons, and artistic journey"

  let siteName = settings?.site_name || "Portfolio"

  if (settings?.hero_text) {
    try {
      const parsed = JSON.parse(settings.hero_text)
      if (parsed.main_text) mainText = parsed.main_text
      if (parsed.sub_text) subText = parsed.sub_text
      if (parsed.site_title && !settings.site_name) siteName = parsed.site_title
    } catch (e) {
      // Ignored
    }
  }

  return (
    <HomeHero 
      heroImageUrl={settings?.hero_image_url}
      logoUrl={settings?.site_logo_url}
      mainText={mainText}
      subText={subText}
      siteName={siteName}
    />
  )
}
