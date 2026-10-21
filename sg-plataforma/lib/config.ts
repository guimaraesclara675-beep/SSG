import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { chavesDisponiveis, valorAtual, type ConfigKey } from '@/lib/ia';

/** Dados que a tela de ajustes com IA precisa: configuração atual, histórico e uso do mês. */
export async function dadosIA(supabase: SupabaseClient, orgId: string, config: Record<string, unknown>, admin: boolean) {
  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);
  const [{ data: keys }, { data: mods }, { data: hist }, { count }] = await Promise.all([
    supabase.from('config_keys').select('*').order('modulo', { nullsFirst: true }),
    supabase.from('org_modules').select('module_id').eq('org_id', orgId).in('status', ['ativo', 'implantacao']),
    supabase.from('ai_changes').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(30),
    supabase.from('ai_changes').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('origem', 'cliente').gte('created_at', inicioMes.toISOString())
  ]);
  const disp = chavesDisponiveis((keys || []) as ConfigKey[], (mods || []).map(m => m.module_id), admin);
  const atual = disp.map(k => ({ chave: k.chave, descricao: k.descricao, valor: valorAtual(config || {}, k) }));
  const exemplos = [
    disp.some(k => k.chave === 'cobranca_dias_antes') ? 'Mandar o lembrete de cobrança 5 dias antes do vencimento' : null,
    disp.some(k => k.chave === 'texto_lembrete_aluguel') ? 'Deixar o lembrete de aluguel mais gentil' : null,
    'Não enviar mensagens depois das 19h', 'Usar um tom mais formal nas mensagens'
  ].filter(Boolean) as string[];
  return { atual, historico: hist || [], usadasNoMes: count || 0, exemplos };
}
