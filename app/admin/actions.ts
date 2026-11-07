'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { convidar } from '@/lib/invite';
import { createServiceClient } from '@/lib/supabase/server';
import { KITS } from '@/lib/catalog';
import { addMeses, faturarItensUnicos, totalMensal } from '@/lib/billing';

const STATUS = ['aguardando', 'implantacao', 'ativo', 'suspenso'];
const MSTATUS = ['solicitado', 'implantacao', 'ativo', 'desligado'];
const s = (f: FormData, k: string) => String(f.get(k) || '').trim();
const back: (path: string, msg: string, erro?: boolean) => never = (path, msg, erro = false) => redirect(`${path}?${erro ? 'erro' : 'ok'}=${encodeURIComponent(msg)}`);

async function log(org_id: string | null, acao: string, detalhes: Record<string, unknown> = {}) {
  const { supabase } = await requireAdmin();
  await supabase.from('audit_log').insert({ org_id, acao, detalhes });
}

export async function salvarCliente(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(f, 'id'), path = `/admin/clientes/${id}`;
  const status = s(f, 'status');
  const upd = {
    status: STATUS.includes(status) ? status : 'aguardando', etapa: Math.min(3, Math.max(0, Number(s(f, 'etapa')) || 0)),
    plano: s(f, 'plano') || 'A definir', dominio: s(f, 'dominio') || null, observacoes: s(f, 'observacoes') || null,
    ia_habilitada: f.get('ia_habilitada') === 'on', ia_limite_mensal: Math.min(10000, Math.max(0, Number(s(f, 'ia_limite_mensal')) || 0))
  };
  const { error } = await supabase.from('organizations').update(upd).eq('id', id);
  if (!error) await log(id, 'cliente atualizado', upd);
  revalidatePath('/admin', 'layout');
  back(path, error ? error.message : 'Dados salvos', !!error);
}

export async function statusModulo(f: FormData) {
  const { supabase } = await requireAdmin();
  const org = s(f, 'org'), mod = s(f, 'modulo'), st = s(f, 'status');
  if (!MSTATUS.includes(st)) back(`/admin/clientes/${org}`, 'Situação inválida', true);
  const { error } = await supabase.from('org_modules').update({ status: st, updated_at: new Date().toISOString() }).eq('org_id', org).eq('module_id', mod);
  if (!error) await log(org, 'módulo alterado', { modulo: mod, status: st });
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org}`, error ? error.message : `${mod}: situação atualizada`, !!error);
}

export async function adicionarModulos(f: FormData) {
  const { supabase } = await requireAdmin();
  const org = s(f, 'org');
  const kit = KITS.find(k => k.id === s(f, 'kit'));
  const um = s(f, 'modulo').slice(0, 4);
  const ids = kit ? kit.modulos : /^[A-Z]-\d\d$/.test(um) ? [um] : [];
  if (!ids.length) back(`/admin/clientes/${org}`, 'Escolha um módulo ou kit', true);
  const { error } = await supabase.from('org_modules').upsert(ids.map(module_id => ({ org_id: org, module_id, status: 'implantacao' })), { onConflict: 'org_id,module_id', ignoreDuplicates: true });
  if (!error && kit) await supabase.from('organizations').update({ plano: kit.nome }).eq('id', org);
  if (!error) await log(org, 'módulos adicionados', { ids });
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org}`, error ? error.message : kit ? `${kit.nome} aplicado` : 'Módulo adicionado', !!error);
}

export async function lancarFatura(f: FormData) {
  const { supabase } = await requireAdmin();
  const org = s(f, 'org'), valor = Number(s(f, 'valor')), venc = s(f, 'vencimento');
  if (!s(f, 'referencia') || !(valor > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(venc)) back(`/admin/clientes/${org}`, 'Preencha referência, valor e vencimento', true);
  const { error } = await supabase.from('invoices').insert({ org_id: org, referencia: s(f, 'referencia'), valor, vencimento: venc });
  if (!error) await log(org, 'fatura lançada', { valor, venc });
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org}`, error ? error.message : 'Fatura lançada. Envie ao cliente pelo WhatsApp.', !!error);
}

export async function marcarPaga(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(f, 'id'), volta = s(f, 'volta') || '/admin/financeiro';
  const { data, error } = await supabase.from('invoices').update({ status: 'pago' }).eq('id', id).select('org_id').single();
  if (!error) await log(data?.org_id ?? null, 'fatura paga', { id });
  revalidatePath('/admin', 'layout');
  back(volta.startsWith('/admin') ? volta : '/admin/financeiro', error ? error.message : 'Fatura marcada como paga', !!error);
}

export async function gerarMensalidades() {
  const { supabase } = await requireAdmin();
  const hoje = new Date(), ref1 = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
  const mes = `${String(ref1.getMonth() + 1).padStart(2, '0')}/${ref1.getFullYear()}`;
  const ref = `Mensalidade ${mes}`;
  const { data: orgs } = await supabase.from('organizations').select('id,mensalidade,mensalidade_ativa,dia_vencimento,cobranca_inicio').eq('status', 'ativo');
  const { data: ja } = await supabase.from('invoices').select('org_id').eq('referencia', ref);
  const feitos = new Set((ja || []).map(x => x.org_id));
  let n = 0;
  for (const o of orgs || []) {
    if (feitos.has(o.id)) continue;
    const venc = addMeses(new Date().toISOString().slice(0, 10), 1, o.dia_vencimento || 10);
    if (o.cobranca_inicio && venc < o.cobranca_inicio) continue;
    const valor = await totalMensal(supabase, o);
    if (!(valor > 0)) continue;
    const { error } = await supabase.from('invoices').insert({ org_id: o.id, referencia: ref, valor, vencimento: venc });
    if (!error) n++;
  }
  await log(null, 'mensalidades geradas', { ref, quantidade: n });
  revalidatePath('/admin', 'layout');
  back('/admin/financeiro', n ? `${n} mensalidades geradas (${ref}). Envie pelo WhatsApp na ficha de cada cliente.` : `Nenhuma mensalidade nova para ${mes}`);
}

export async function salvarCobranca(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(f, 'id');
  const upd = {
    cpf_cnpj: s(f, 'cpf_cnpj').replace(/[^\d./-]/g, '') || null, email_cobranca: s(f, 'email_cobranca') || null,
    mensalidade_ativa: f.get('mensalidade_ativa') === 'on', mensalidade: Math.max(0, Number(s(f, 'mensalidade')) || 0),
    dia_vencimento: Math.min(28, Math.max(1, Number(s(f, 'dia_vencimento')) || 10)), cobranca_inicio: s(f, 'cobranca_inicio') || null
  };
  const { error } = await supabase.from('organizations').update(upd).eq('id', id);
  if (!error) await log(id, 'cobrança configurada', upd);
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${id}`, error ? error.message : 'Cobrança salva', !!error);
}

export async function adicionarItem(f: FormData) {
  const { supabase } = await requireAdmin();
  const org = s(f, 'org'), tipo = s(f, 'tipo') === 'mensal' ? 'mensal' : 'unico', valor = Number(s(f, 'valor'));
  if (s(f, 'descricao').length < 2 || !(valor > 0)) back(`/admin/clientes/${org}`, 'Preencha descrição e valor', true);
  const { error } = await supabase.from('plan_items').insert({
    org_id: org, descricao: s(f, 'descricao'), tipo, valor, parcelas: tipo === 'unico' ? Math.min(24, Math.max(1, Number(s(f, 'parcelas')) || 1)) : 1,
    primeiro_vencimento: tipo === 'unico' ? s(f, 'primeiro_vencimento') || null : null
  });
  if (!error) await log(org, 'item do plano adicionado', { descricao: s(f, 'descricao'), tipo, valor });
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org}`, error ? error.message : 'Item adicionado ao plano', !!error);
}

export async function removerItem(f: FormData) {
  const { supabase } = await requireAdmin();
  const org = s(f, 'org');
  const { error } = await supabase.from('plan_items').delete().eq('id', s(f, 'id')).eq('cobrado', false);
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org}`, error ? error.message : 'Item removido', !!error);
}

export async function gerarCobrancasCliente(f: FormData) {
  const { supabase } = await requireAdmin();
  const org = s(f, 'org');
  const n = await faturarItensUnicos(supabase, org);
  await log(org, 'cobranças geradas', { faturas: n });
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org}`, n ? `${n} fatura(s) criadas. Envie pelo WhatsApp.` : 'Nenhum item novo para cobrar');
}

export async function atualizarAtrasos() {
  await requireAdmin();
  let n = 0;
  try { const { data } = await createServiceClient().rpc('mark_overdue_invoices'); n = Number(data) || 0; }
  catch (e) { back('/admin/financeiro', (e as Error).message, true); }
  revalidatePath('/admin', 'layout');
  back('/admin/financeiro', `${n} fatura(s) marcadas como atrasadas`);
}

export async function responderChamado(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(f, 'id'), resposta = s(f, 'resposta').slice(0, 5000);
  if (!resposta) back('/admin/chamados', 'Escreva a resposta', true);
  const { error } = await supabase.from('tickets').update({ resposta, status: 'respondido', respondido_em: new Date().toISOString() }).eq('id', id);
  revalidatePath('/admin', 'layout');
  back('/admin/chamados', error ? error.message : 'Resposta enviada', !!error);
}

export async function statusPedido(f: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('leads').update({ status: s(f, 'status') }).eq('id', s(f, 'id'));
  revalidatePath('/admin', 'layout');
  back('/admin/pedidos', error ? error.message : 'Pedido atualizado', !!error);
}

/** Cria a empresa a partir de um pedido do site (ou do formulário "Novo cliente") e convida o contato. */
export async function criarCliente(f: FormData) {
  const { supabase } = await requireAdmin();
  const leadId = s(f, 'lead');
  let nome = s(f, 'empresa'), email = s(f, 'email').toLowerCase(), contato = s(f, 'contato'), whatsapp = s(f, 'whatsapp'), segmento = s(f, 'segmento');
  let modulos: string[] = [];
  const kit = KITS.find(k => k.id === s(f, 'kit'));
  if (leadId) {
    const { data: l } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (!l) back('/admin/pedidos', 'Pedido não encontrado', true);
    nome = l.empresa; email = l.email; contato = l.nome; whatsapp = l.whatsapp || ''; segmento = l.segmento || ''; modulos = l.modulos || [];
  }
  if (kit) modulos = Array.from(new Set(modulos.concat(kit.modulos)));
  if (nome.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) back('/admin/clientes', 'Preencha empresa e e-mail válido', true);
  // criado pela administradora = já aprovado
  const { data: org, error } = await supabase.from('organizations').insert({ status: 'implantacao', nome, marca: nome, whatsapp: whatsapp || null, segmento: segmento || null, plano: kit ? kit.nome : modulos.length ? 'Personalizado' : 'A definir' }).select('id').single();
  if (error || !org) back('/admin/clientes', 'Não foi possível criar: ' + (error?.message || ''), true);
  if (modulos.length) {
    const { data: validos } = await supabase.from('modules').select('id').in('id', modulos);
    if (validos?.length) await supabase.from('org_modules').insert(validos.map(v => ({ org_id: org!.id, module_id: v.id, status: 'solicitado' })));
  }
  if (leadId) await supabase.from('leads').update({ org_id: org!.id, status: 'em contato' }).eq('id', leadId);
  await log(org!.id, 'cliente criado pela administradora', { email, lead: leadId || null });
  const erroConvite = await convidar(email, contato, org!.id, 'Administrador');
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org!.id}`, erroConvite ? `Cliente criado. ${erroConvite}` : 'Cliente criado e convite enviado por e-mail', !!erroConvite);
}

export async function convidarParaCliente(f: FormData) {
  await requireAdmin();
  const org = s(f, 'org'), email = s(f, 'email').toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) back(`/admin/clientes/${org}`, 'E-mail inválido', true);
  const perfil = ['Operador', 'Financeiro', 'Administrador'].includes(s(f, 'perfil')) ? s(f, 'perfil') : 'Administrador';
  const erro = await convidar(email, s(f, 'nome'), org, perfil);
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${org}`, erro || 'Convite enviado', !!erro);
}

export async function moverEtapa(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(f, 'id'), col = Number(s(f, 'col'));
  const upd = col <= 0 ? { status: 'aguardando', etapa: 0 } : col >= 4 ? { status: 'ativo', etapa: 3 } : { status: 'implantacao', etapa: col - 1 };
  const { error } = await supabase.from('organizations').update(upd).eq('id', id);
  if (!error && col >= 4) await supabase.from('org_modules').update({ status: 'ativo' }).eq('org_id', id).eq('status', 'implantacao');
  if (!error && col >= 1 && col <= 3) await supabase.from('org_modules').update({ status: 'implantacao' }).eq('org_id', id).eq('status', 'solicitado');
  if (!error) await log(id, 'etapa alterada', upd);
  revalidatePath('/admin', 'layout');
  back('/admin/implantacoes', error ? error.message : 'Etapa atualizada', !!error);
}

export async function aprovarCadastro(f: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(f, 'id');
  const { error } = await supabase.from('organizations').update({ status: 'implantacao', etapa: 0 }).eq('id', id).eq('status', 'aguardando');
  if (!error) await log(id, 'cadastro aprovado', {});
  revalidatePath('/admin', 'layout');
  back(`/admin/clientes/${id}`, error ? error.message : 'Cadastro aprovado. O cliente já pode acessar a área dele.', !!error);
}
