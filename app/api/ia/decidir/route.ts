import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const { supabase, user } = await getSession();
  if (!user) return NextResponse.json({ erro: 'Entre na sua conta.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const acao = String(b.acao);
  if (!['aplicar', 'recusar', 'desfazer'].includes(acao)) return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 });
  const { error } = await supabase.rpc('decide_ai_change', { p_id: String(b.id), p_acao: acao });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
  revalidatePath('/app', 'layout'); revalidatePath('/admin', 'layout');
  return NextResponse.json({ ok: true });
}
