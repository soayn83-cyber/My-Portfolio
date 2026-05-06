import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  
  try {
    // Attempting to trigger arbitrary rpc call to force schema cache reload
    const { error } = await supabase.rpc('pgrst_reload_schema')
    
    // If that fails, just doing a raw SQL query might work if the user has correct permissions. 
    // We cannot run NOTIFY directly from standard supabase client, but this might hit an error and force refresh.
    const { data: colsData, error: colsError } = await supabase.from('profile').select('id, name, experience, certifications').limit(1)

    return NextResponse.json({ 
        message: 'Cache reload attempted',
        rpcError: error?.message,
        colsError: colsError ? colsError.message : 'Columns exist!'
     })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}