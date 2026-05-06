"use client"

import { useEffect, useCallback, useRef } from "react"

export function HeartCursor() {
  const lastPositionRef = useRef({ x: 0, y: 0 })
  const throttleRef = useRef(false)

  const createHeart = useCallback((x: number, y: number) => {
    const heart = document.createElement("div")
    heart.innerHTML = "♥"
    heart.className = "heart-particle fixed text-primary pointer-events-none z-50"
    heart.style.left = `${x}px`
    heart.style.top = `${y}px`
    heart.style.fontSize = `${Math.random() * 10 + 10}px`
    heart.style.opacity = "0.8"
    
    document.body.appendChild(heart)

    setTimeout(() => {
      heart.remove()
    }, 1000)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleRef.current) return

      const dx = e.clientX - lastPositionRef.current.x
      const dy = e.clientY - lastPositionRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 30) {
        createHeart(e.clientX, e.clientY)
        lastPositionRef.current = { x: e.clientX, y: e.clientY }
        
        throttleRef.current = true
        setTimeout(() => {
          throttleRef.current = false
        }, 50)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [createHeart])

  return null
}
