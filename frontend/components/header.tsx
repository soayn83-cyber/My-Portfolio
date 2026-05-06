"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/webtoon", label: "Webtoon" },
  { href: "/work-process", label: "Work Process" },
  { href: "/illustration", label: "Illustration" },
]

export function Header({ siteName = "Portfolio", logoUrl = "/logo.png" }: { siteName?: string, logoUrl?: string }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Hide header on home page
  if (pathname === "/") {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-primary/20">
              <Image
                src={logoUrl}
                alt="Logo"
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          ) : (
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
               <span className="font-serif text-lg text-primary">{siteName.charAt(0).toUpperCase()}</span>
             </div>
          )}
          <span className="font-serif text-xl font-medium text-foreground">{siteName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href 
                  ? "text-primary" 
                  : "text-foreground/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-primary/20 bg-background">
          <div className="flex flex-col px-4 py-4 gap-4">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary py-2",
                  pathname === item.href 
                    ? "text-primary" 
                    : "text-foreground/70"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
