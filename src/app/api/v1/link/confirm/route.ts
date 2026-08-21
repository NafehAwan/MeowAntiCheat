import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

// POST /api/v1/link/confirm - Plugin confirms link via /meowac confirm CODE
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Find matching pending challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('link_challenges')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('consumed', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 })
    }

    // Get server
    const { data: server, error: serverError } = await supabase
      .from('servers')
      .select('*')
      .eq('id', challenge.server_id)
      .single()

    if (serverError || !server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    if (server.plugin_bound) {
      return NextResponse.json({ error: 'Server already linked' }, { status: 409 })
    }

    // Generate server key
    const serverKey = 'mk_live_' + crypto.randomBytes(24).toString('hex')

    // Bind server
    const { error: bindError } = await supabase
      .from('servers')
      .update({
        plugin_bound: true,
        server_key: serverKey,
        handle_consumed: true,
        bound_at: new Date().toISOString()
      })
      .eq('id', server.id)

    if (bindError) {
      return NextResponse.json({ error: 'Failed to bind server' }, { status: 500 })
    }

    // Mark challenge consumed
    await supabase
      .from('link_challenges')
      .update({ consumed: true })
      .eq('code', code.toUpperCase().trim())

    return NextResponse.json({
      status: 'ok',
      server_id: server.id,
      server_key: serverKey,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
