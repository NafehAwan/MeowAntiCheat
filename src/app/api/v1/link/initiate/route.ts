import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import crypto from 'crypto'

// POST /api/v1/link/initiate - Generate a link code for a server
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { server_id } = await request.json()

    // Verify server belongs to user
    const { data: server, error: serverError } = await supabase
      .from('servers')
      .select('*')
      .eq('id', server_id)
      .eq('owner_id', user.id)
      .single()

    if (serverError || !server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    if (server.plugin_bound) {
      return NextResponse.json({ error: 'Server already linked' }, { status: 409 })
    }

    // Delete any old pending challenges for this server
    await supabase
      .from('link_challenges')
      .delete()
      .eq('server_id', server_id)
      .eq('consumed', false)

    // Generate a short code
    const code = generateCode()

    // Store the challenge
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min
    const { error: insertError } = await supabase
      .from('link_challenges')
      .insert({
        code,
        server_id,
        consumed: false,
        expires_at: expiresAt,
      })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      code,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCode(): string {
  // Format: XXXX-XXXX (8 chars with dash)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars[crypto.randomInt(chars.length)]
  }
  return code
}
