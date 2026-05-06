"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface HomeHeroProps {
  heroImageUrl?: string | null
  logoUrl?: string | null
  mainText?: string
  subText?: string
  siteName?: string
}

const navItems = [
  { href: "/profile", label: "Profile" },
  { href: "/webtoon", label: "Webtoon" },
  { href: "/work-process", label: "Work Process" },
  { href: "/illustration", label: "Illustration" },
]

export function HomeHero({ heroImageUrl, logoUrl, mainText = "Welcome to My Portfolio", subText = "Explore my creative world of illustrations, webtoons, and artistic journey", siteName = "Portfolio" }: HomeHeroProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full-screen Background Image */}
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-background" />
        )}
        {/* Optional overlay for better text readability */}
        {heroImageUrl && (
          <div className="absolute inset-0 bg-background/40" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen w-full flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          {logoUrl ? (
            <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-primary/30 shadow-lg md:h-52 md:w-52 lg:h-64 lg:w-64">
              <Image
                src={logoUrl}
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-primary/30 bg-background/80 shadow-lg md:h-52 md:w-52 lg:h-64 lg:w-64">
              <span className="font-serif text-5xl text-primary">{siteName.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-left font-serif text-5xl font-medium text-foreground md:text-6xl lg:text-7xl xl:text-8xl break-words cursor-default"
        >
          <span className="text-balance whitespace-pre-wrap block">
            {mainText.split("").map((char, index) => {
              if (char === "\n") return <br key={index} />
              
              return (
                <motion.span
                  key={index}
                  className="inline-block transition-colors duration-200 hover:text-primary"
                  whileHover={{
                    y: -8,
                    scale: 1.15,
                    rotate: index % 2 === 0 ? [0, -10, 10, -10, 0] : [0, 10, -10, 10, 0],
                    transition: { duration: 0.4 }
                  }}
                  style={{ whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              )
            })}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16 max-w-2xl text-left text-lg text-foreground/80 md:text-xl lg:text-2xl whitespace-pre-wrap"
        >
          {subText}
        </motion.p>

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-start gap-4 md:gap-8 -ml-4"
        >
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={item.href}
                className="group relative px-6 py-3 text-base font-medium text-foreground transition-colors hover:text-primary md:text-lg"
              >
                <span className="relative z-10">{item.label}</span>
                <motion.span
                  className="absolute inset-0 rounded-full bg-primary/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="absolute bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-3/4" />
              </Link>
            </motion.div>
          ))}
        </motion.nav>


      </div>
    </div>
  )
}
