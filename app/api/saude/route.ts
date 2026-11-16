import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Faz uma consulta leve ao banco para o Supabase não pausar o projeto por inatividade.
// Chamado automaticamente pelo GitHub Actions (.github/workflows/manter-supabase-ativo.yml).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { error } = await createServiceClient().from('config_keys').select('chave').limit(1);
    if (error) return NextResponse.json({ ok: false }, { status: 503 });
    return NextResponse.json({ ok: true, em: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
