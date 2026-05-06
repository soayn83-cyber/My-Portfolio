'use server'

import { cookies } from 'next/headers'

export async function loginWithPassword(password: string) {
  if (password.trim() === '611030') {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'true', { path: '/' })
    return { success: true }
  }
  return { success: false, error: '비밀번호가 일치하지 않습니다.' }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
}
