import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// POST /api/v1/link/initiate - Dashboard owner initiates link
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { server_id, handle } = await request.json()

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
      return NextResponse.json({ error: 'Server already bound' }, { status: 409 })
    }

    const { data: challenge, error: challengeError } = await supabase
      .from('link_challenges')
      .select('*')
      .eq('handle', handle)
      .eq('consumed', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Invalid or expired handle' }, { status: 404 })
    }

    const code = generateCode()

    await supabase
      .from('link_challenges')
      .update({ code, server_id: server_id })
      .eq('handle', handle)

    return NextResponse.json({
      status: 'ok',
      code,
      message: 'Now run /meowac confirm ' + code + ' in-game'
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
