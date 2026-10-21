import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const txt = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const ids = (v: unknown) => (Array.isArray(v) ? v : []).map(String).filter(x => /^[A-Z]-\d\d$/.test(x)).slice(0, 60);

/** Recebe o pedido de orçamento enviado pela vitrine. */
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, erro: 'JSON inválido' }, { status: 400 }); }
  if (txt(b.site, 10)) return NextResponse.json({ ok: true }); // campo-isca contra robôs
  const lead = {
    protocolo: txt(b.protocolo, 30) || `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    nome: txt(b.nome, 120), empresa: txt(b.empresa, 160), email: txt(b.email, 160).toLowerCase(), whatsapp: txt(b.whatsapp, 40) || null,
    segmento: txt(b.segmento, 80) || null, porte: txt(b.porte, 80) || null, descricao: txt(b.descricao, 3000) || null,
    modulos: ids(b.modulos), demos: ids(b.demos), consentimento: b.consentimento === true
  };
  if (lead.nome.length < 2 || !lead.empresa || !/^\S+@\S+\.\S+$/.test(lead.email) || !lead.consentimento) {
    return NextResponse.json({ ok: false, erro: 'Preencha nome, empresa, e-mail e a autorização de uso dos dados.' }, { status: 400 });
  }
  const supabase = createClient();
  const { error } = await supabase.from('leads').insert(lead);
  if (error) return NextResponse.json({ ok: false, erro: 'Não foi possível registrar o pedido.' }, { status: 500 });
  return NextResponse.json({ ok: true, protocolo: lead.protocolo });
}
