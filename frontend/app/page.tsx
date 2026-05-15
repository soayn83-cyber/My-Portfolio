import { HomeHero } from "@/components/home-hero"
import { getSiteConfig } from "@/lib/content-data"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { heroImageUrl, logoUrl, mainText, subText, siteName } = await getSiteConfig()

  return (
    <HomeHero 
      heroImageUrl={heroImageUrl}
      logoUrl={logoUrl}
      mainText={mainText}
      subText={subText}
      siteName={siteName}
    />
  )
}
