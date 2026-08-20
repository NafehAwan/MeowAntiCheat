import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/v1/incidents - Plugin submits an incident
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
    const {
      incident_code,
      player_uuid,
      player_username,
      category,
      confidence,
      checks,
      replay_size_bytes
    } = body

    // Upsert player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .upsert({
        uuid: player_uuid,
        username: player_username,
        last_seen: new Date().toISOString()
      }, { onConflict: 'uuid' })
      .select('id')
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Failed to upsert player' }, { status: 500 })
    }

    // Create incident
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        incident_code,
        player_id: player.id,
        server_id: server.id,
        category,
        confidence,
        checks,
        replay_size_bytes: replay_size_bytes || 0
      })
      .select('id, incident_code')
      .single()

    if (incidentError) {
      return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 })
    }

    // Update player stats
    await supabase.rpc('increment_player_incidents', { p_player_id: player.id })

    return NextResponse.json({
      status: 'ok',
      incident_id: incident.id,
      incident_code: incident.incident_code
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/v1/incidents - List incidents (dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const serverId = searchParams.get('server_id')
    const playerId = searchParams.get('player_id')

    let query = supabase
      .from('incidents')
      .select('*, players(uuid, username, skin_url), servers(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) query = query.eq('status', status)
    if (serverId) query = query.eq('server_id', serverId)
    if (playerId) query = query.eq('player_id', playerId)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      incidents: data,
      total: count,
      page,
      limit
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
