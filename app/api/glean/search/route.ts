import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { gleanSearch } from '@/lib/glean';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { query, datasources, pageSize } = await req.json();
  const results = await gleanSearch({ query, datasources, pageSize });
  return NextResponse.json({ results });
}
