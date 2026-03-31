import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data, count } = await supabaseAdmin
    .from('weekly_intelligence')
    .select('*', { count: 'exact' })
    .order('week_start', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ reports: data || [], total: count || 0 });
}
