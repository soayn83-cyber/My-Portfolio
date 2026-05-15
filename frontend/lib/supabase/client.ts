"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function resolveSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}

function resolveSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
}

export function createSupabaseBrowserClient(): SupabaseClient | null {
  const url = resolveSupabaseUrl()
  const anonKey = resolveSupabaseAnonKey()

  if (!url || !anonKey) {
    return null
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}