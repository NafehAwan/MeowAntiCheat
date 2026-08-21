import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

// POST /api/v1/link/plugin-confirm
// Called by the plugin when player runs /meowac confirm CODE
// Plugin sends: { server_name, code }
// We find the matching pending challenge and bind the server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { server_name, code } = body

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Find the matching challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('link_challenges')
      .select('*, servers!inner(*)')
      .eq('code', code.toUpperCase().trim())
      .eq('consumed', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 })
    }

    const server = challenge.servers as { id: string; plugin_bound: boolean }

    if (server.plugin_bound) {
      return NextResponse.json({ error: 'Server already linked' }, { status: 409 })
    }

    // Generate server key for the plugin
    const serverKey = 'mk_live_' + crypto.randomBytes(24).toString('hex')

    // Bind the server
    const { error: bindError } = await supabase
      .from('servers')
      .update({
        plugin_bound: true,
        server_key: serverKey,
        handle_consumed: true,
        bound_at: new Date().toISOString(),
      })
      .eq('id', server.id)

    if (bindError) {
      return NextResponse.json({ error: 'Failed to bind server' }, { status: 500 })
    }

    // Mark challenge as consumed
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
