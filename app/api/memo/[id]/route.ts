import { NextRequest, NextResponse } from 'next/server';
import { getSession, isOwner } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || !isOwner(user)) return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  const { content } = await req.json();
  const { data } = await supabaseAdmin
    .from('intelligence_entries')
    .update({ content })
    .eq('id', params.id)
    .select()
    .single();

  return NextResponse.json({ memo: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || !isOwner(user)) return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  await supabaseAdmin.from('intelligence_entries').delete().eq('id', params.id);
  return NextResponse.json({ ok: true });
}
