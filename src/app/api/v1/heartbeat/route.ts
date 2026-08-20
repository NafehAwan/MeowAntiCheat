import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/v1/heartbeat - Plugin sends heartbeat
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serverKey = authHeader.replace('Bearer ', '')
    const supabase = getSupabaseAdmin()

    // Verify server key
    const { data: server, error: serverError } = await supabase
      .from('servers')
      .select('id')
      .eq('server_key', serverKey)
      .eq('plugin_bound', true)
      .single()

    if (serverError || !server) {
      return NextResponse.json({ error: 'Invalid server key' }, { status: 401 })
    }

    const body = await request.json()
    const { players_online, tps, plugin_version } = body

    // Insert heartbeat
    const { error } = await supabase
      .from('heartbeats')
      .insert({
        server_id: server.id,
        players_online: players_online || 0,
        tps: tps || 20,
        plugin_version
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check for unlink signal
    const { data: serverData } = await supabase
      .from('servers')
      .select('plugin_bound')
      .eq('id', server.id)
      .single()

    return NextResponse.json({
      status: 'ok',
      linked: serverData?.plugin_bound || false
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
