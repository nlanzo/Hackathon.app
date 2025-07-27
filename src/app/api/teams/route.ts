import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description } = await req.json()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('teams')
    .insert({ name, description, owner_id: session.user.email })

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
