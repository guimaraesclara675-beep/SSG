import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chavesDisponiveis, pedirProposta, type ConfigKey } from '@/lib/ia';

/** Cliente (na própria empresa) ou administradora (em qualquer empresa) pede um ajuste em português. */
export async function POST(req: Request) {
  const { supabase, user, profile } = await getSession();
  if (!user) return NextResponse.json({ erro: 'Entre na sua conta.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const pedido = String(b.pedido || '').trim().slice(0, 2000);
  if (pedido.length < 4) return NextResponse.json({ erro: 'Descreva o que você quer ajustar.' }, { status: 400 });
  const admin = !!profile?.is_admin;
  let orgId = String(b.org || '');
  if (!admin || !orgId) {
    const { data: m } = await supabase.from('memberships').select('org_id').eq('user_id', user.id).limit(1).maybeSingle();
    if (!m) return NextResponse.json({ erro: 'Conta sem empresa.' }, { status: 403 });
    orgId = m.org_id;
  }
  const { data: org } = await supabase.from('organizations').select('id,nome,config,ia_habilitada').eq('id', orgId).maybeSingle();
  if (!org) return NextResponse.json({ erro: 'Empresa não encontrada.' }, { status: 404 });
  if (!admin && !org.ia_habilitada) return NextResponse.json({ erro: 'A IA de ajustes não está incluída no seu plano. Fale com a SG para liberar.' }, { status: 403 });
  const [{ data: keys }, { data: mods }] = await Promise.all([
    supabase.from('config_keys').select('*'),
    supabase.from('org_modules').select('module_id').eq('org_id', orgId).in('status', ['ativo', 'implantacao'])
  ]);
  const disp = chavesDisponiveis((keys || []) as ConfigKey[], (mods || []).map(m => m.module_id), admin);
  let prop;
  try { prop = await pedirProposta(pedido, org.nome, disp, org.config || {}); }
  catch (e) { return NextResponse.json({ erro: (e as Error).message }, { status: 502 }); }
  if (!prop.mudancas.length) return NextResponse.json({ pergunta: prop.pergunta || 'Não encontrei um ajuste possível para esse pedido. Se quiser, abra um chamado para a SG.' });
  const { data: id, error } = await supabase.rpc('propose_ai_change', { p_org: orgId, p_pedido: pedido, p_resumo: prop.resumo, p_mudancas: prop.mudancas });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });
  const { data: change } = await supabase.from('ai_changes').select('*').eq('id', id).single();
  return NextResponse.json({ change });
}
