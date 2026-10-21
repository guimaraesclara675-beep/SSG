import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { brl } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Visao() {
  const { supabase } = await requireAdmin();
  const [{ data: orgs }, { data: inv }, { data: leads }, { data: tk }, { data: sol }] = await Promise.all([
    supabase.from('organizations').select('id,nome,status,mensalidade,mensalidade_ativa'),
    supabase.from('invoices').select('valor,status,referencia,org_id,organizations(nome)').neq('status', 'pago'),
    supabase.from('leads').select('id,empresa,modulos').eq('status', 'novo').order('created_at', { ascending: false }).limit(20),
    supabase.from('tickets').select('id,assunto,org_id,organizations(nome)').eq('status', 'aberto'),
    supabase.from('org_modules').select('org_id,module_id,organizations(nome,status),modules(nome)').eq('status', 'solicitado')
  ]);
  const O = orgs || [];
  const mrr = O.filter(o => o.status === 'ativo' && o.mensalidade_ativa).reduce((t, o) => t + Number(o.mensalidade), 0);
  const pend = (inv || []).filter(i => i.status === 'pend'), atr = (inv || []).filter(i => i.status === 'atr');
  const soma = (l: { valor: number }[]) => l.reduce((t, i) => t + Number(i.valor), 0);
  const itens: [string, string, string, string][] = [
    ...O.filter(o => o.status === 'aguardando').map(o => ['Conta nova', `${o.nome} aguarda sua aprovação`, `/admin/clientes/${o.id}`, 'chip-gold'] as [string, string, string, string]),
    ...(sol || []).filter((m: any) => m.organizations?.status !== 'aguardando').map((m: any) => ['Módulo', `${m.organizations?.nome} solicitou ${m.module_id} ${m.modules?.nome}`, `/admin/clientes/${m.org_id}`, 'chip-gold'] as [string, string, string, string]),
    ...(tk || []).map((t: any) => ['Chamado', `${t.organizations?.nome}: ${t.assunto}`, '/admin/chamados', 'chip-blue'] as [string, string, string, string]),
    ...atr.map((i: any) => ['Atrasada', `${i.organizations?.nome} · ${i.referencia} · ${brl(i.valor)}`, '/admin/financeiro', 'chip-red'] as [string, string, string, string]),
    ...(leads || []).map(l => ['Pedido', `${l.empresa} pediu orçamento (${(l.modulos || []).length} módulos)`, '/admin/pedidos', 'chip-gold'] as [string, string, string, string])
  ];
  return (
    <AdminShell current="/admin" title="Visão geral">
      <div className="kpis">
        <div className="kpi"><span>Receita recorrente (mês)</span><b>{brl(mrr)}</b></div>
        <div className="kpi"><span>Clientes ativos</span><b>{O.filter(o => o.status === 'ativo').length}</b></div>
        <div className="kpi"><span>Em implantação</span><b>{O.filter(o => o.status === 'implantacao').length}</b></div>
        <div className="kpi"><span>A receber</span><b>{brl(soma(pend))}</b></div>
        <div className="kpi"><span>Em atraso</span><b style={{ color: 'var(--bad)' }}>{brl(soma(atr))}</b></div>
      </div>
      <div className="card">
        <b>Precisa da sua atenção</b>
        {itens.length ? (
          <ul className="mt-2">{itens.map(([tag, txt, href, cls], i) => (
            <li key={i} className="flex items-center gap-3 py-2 border-b last:border-0 text-sm" style={{ borderColor: 'var(--line)' }}>
              <span className={`chip ${cls}`}>{tag}</span><span className="flex-1">{txt}</span><Link className="link" href={href}>Abrir</Link>
            </li>))}</ul>
        ) : <p className="fine mt-2">Nada pendente. Tudo em dia.</p>}
      </div>
    </AdminShell>
  );
}
