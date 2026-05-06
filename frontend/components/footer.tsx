"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Footer() {
  const pathname = usePathname()
  
  return (
    <footer className={cn(
      "text-center py-4",
      pathname === "/" 
        ? "fixed bottom-0 w-full z-50 bg-transparent border-t-0 pb-4"
        : "py-8"
    )}>
      <a 
        href="/admin/login" 
        className={cn(
          "text-[10px] font-thin transition-colors opacity-40 hover:opacity-100 cursor-pointer block",
          pathname === "/" ? "text-foreground hover:text-primary mix-blend-difference" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Administrator
      </a>
    </footer>
  )
}
