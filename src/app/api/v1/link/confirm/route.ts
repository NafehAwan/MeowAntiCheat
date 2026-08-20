import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

// POST /api/v1/link/confirm - Plugin confirms link
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { handle, code } = await request.json()

    if (!handle || !code) {
      return NextResponse.json({ error: 'Handle and code required' }, { status: 400 })
    }

    // Find the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('link_challenges')
      .select('*')
      .eq('handle', handle)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Invalid code or expired' }, { status: 401 })
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
      return NextResponse.json({ error: 'Server already bound' }, { status: 409 })
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

    // Delete the challenge
    await supabase
      .from('link_challenges')
      .delete()
      .eq('handle', handle)

    return NextResponse.json({
      status: 'ok',
      server_id: server.id,
      server_key: serverKey,
      dashboard_url: process.env.NEXT_PUBLIC_SITE_URL + '/servers/' + server.id
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
