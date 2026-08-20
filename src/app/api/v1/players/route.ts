import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/v1/players - List players
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort') || 'suspicion_score'

    let query = supabase
      .from('players')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.ilike('username', `%${search}%`)
    }

    query = query
      .order(sortBy, { ascending: sortBy === 'username' })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      players: data,
      total: count,
      page,
      limit
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/v1/players/[uuid] - Get player profile
export async function GET_BY_UUID(uuid: string) {
  try {
    const supabase = getSupabaseAdmin()

    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('uuid', uuid)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get incidents for this player
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*, servers(name)')
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get servers this player has been on
    const { data: servers } = await supabase
      .from('player_servers')
      .select('*, servers(id, name)')
      .eq('player_id', player.id)

    return NextResponse.json({
      player,
      incidents: incidents || [],
      servers: servers || []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
