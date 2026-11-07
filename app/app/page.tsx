import Link from 'next/link';
import { requireClient } from '@/lib/auth';
import { ClientShell } from '@/components/ClientShell';
import { Chip } from '@/components/Chip';
import { brl, data, ETAPAS, ORG_STATUS, waLink } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Inicio() {
  const { supabase, org, profile } = await requireClient();
  const [{ data: mods }, { data: inv }, { data: tk }] = await Promise.all([
    supabase.from('org_modules').select('module_id,status,modules(nome)').eq('org_id', org.id),
    supabase.from('invoices').select('valor,vencimento,status').eq('org_id', org.id).neq('status', 'pago').order('vencimento').limit(1),
    supabase.from('tickets').select('status').eq('org_id', org.id)
  ]);
  const ativos = (mods || []).filter(m => m.status === 'ativo');
  const prox = inv?.[0];
  const abertos = (tk || []).filter(t => t.status === 'aberto').length;
  const respondidos = (tk || []).filter(t => t.status === 'respondido').length;
  const passos: [string, boolean][] = [['Conta criada', true], [`Escolher módulos${mods?.length ? ` (${mods.length})` : ''}`, !!mods?.length], ['Conversa de diagnóstico com a SG', org.status !== 'aguardando'], ['Ativação dos módulos', org.status === 'ativo']];
  return (
    <ClientShell org={org} current="/app" title="Início" respondidos={respondidos}>
      <div><h2 className="h2">Olá{profile?.nome ? `, ${profile.nome.split(' ')[0]}` : ''}</h2><p className="muted">{org.nome} · {org.plano}</p></div>
      {org.status === 'aguardando' ? (
        <div className="card card-hl">
          <div className="rowb"><b>Próximos passos</b><Chip map={ORG_STATUS} value={org.status} /></div>
          <ol className="mt-3 flex flex-col gap-2 text-sm">{passos.map(([t, ok]) => <li key={t} className={ok ? '' : 'muted'}>{ok ? '✓' : '○'} {t}</li>)}</ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn btn-primary" href="/app/modulos">Escolher módulos</Link>
            <a className="btn btn-wa" target="_blank" rel="noopener" href={waLink(`Olá, SG Engenharias! Criei minha conta (${org.nome}) e quero agendar o diagnóstico.`)}>Agendar diagnóstico no WhatsApp</a>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="rowb"><b>Implantação</b><Chip map={ORG_STATUS} value={org.status} /></div>
          <ol className="steps">{ETAPAS.map((e, i) => <li key={e} className={i < org.etapa || org.status === 'ativo' ? 'done' : i === org.etapa ? 'on' : ''}>{e}</li>)}</ol>
        </div>
      )}
      <div className="kpis">
        <div className="kpi"><span>Módulos ativos</span><b>{ativos.length} de {mods?.length || 0}</b></div>
        <div className="kpi"><span>Próxima fatura</span><b>{prox ? brl(prox.valor) : '—'}</b>{prox ? <span>vence {data(prox.vencimento)}</span> : null}</div>
        <div className="kpi"><span>Chamados abertos</span><b>{abertos}</b></div>
        <div className="kpi"><span>Endereço do sistema</span><b className="text-sm break-all">{org.dominio || 'definido na implantação'}</b></div>
      </div>
    </ClientShell>
  );
}
