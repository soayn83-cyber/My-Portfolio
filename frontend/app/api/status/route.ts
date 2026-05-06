import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    publicOrigin:
      process.env.PUBLIC_ORIGIN ||
      process.env.RENDER_EXTERNAL_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      null,
  })
}