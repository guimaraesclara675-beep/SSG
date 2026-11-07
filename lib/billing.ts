import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

export const addMeses = (iso: string, n: number, dia?: number) => {
  const d = new Date(iso + 'T12:00:00');
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1, 12);
  const ultimo = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(dia ?? d.getDate(), ultimo));
  return r.toISOString().slice(0, 10);
};
export const hojeMais = (dias: number) => new Date(Date.now() + dias * 864e5).toISOString().slice(0, 10);

/** Transforma os itens únicos ainda não cobrados (pacote, implantação, personalizações) em faturas, com parcelas. */
export async function faturarItensUnicos(supabase: SupabaseClient, orgId: string) {
  const { data: itens } = await supabase.from('plan_items').select('*').eq('org_id', orgId).eq('tipo', 'unico').eq('cobrado', false);
  let n = 0;
  for (const it of itens || []) {
    const inicio = it.primeiro_vencimento || hojeMais(3);
    const parcela = Math.round((Number(it.valor) / it.parcelas) * 100) / 100;
    const linhas = Array.from({ length: it.parcelas }, (_, i) => ({
      org_id: orgId, item_id: it.id, referencia: it.parcelas > 1 ? `${it.descricao} ${i + 1}/${it.parcelas}` : it.descricao,
      // a última parcela absorve a diferença de centavos
      valor: i === it.parcelas - 1 ? Math.round((Number(it.valor) - parcela * (it.parcelas - 1)) * 100) / 100 : parcela,
      vencimento: addMeses(inicio, i)
    }));
    const { error } = await supabase.from('invoices').insert(linhas);
    if (!error) { await supabase.from('plan_items').update({ cobrado: true }).eq('id', it.id); n += linhas.length; }
  }
  return n;
}

/** Valor mensal do cliente = mensalidade (se ligada) + itens mensais personalizados. */
export async function totalMensal(supabase: SupabaseClient, o: { id: string; mensalidade: number; mensalidade_ativa: boolean }) {
  const { data } = await supabase.from('plan_items').select('valor').eq('org_id', o.id).eq('tipo', 'mensal');
  return (o.mensalidade_ativa ? Number(o.mensalidade) : 0) + (data || []).reduce((t, i) => t + Number(i.valor), 0);
}

