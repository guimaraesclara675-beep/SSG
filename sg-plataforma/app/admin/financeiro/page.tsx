import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { Chip } from '@/components/Chip';
import { Flash } from '@/components/Flash';
import { brl, data, INV_STATUS } from '@/lib/format';
import { atualizarAtrasos, gerarMensalidades, marcarPaga } from '../actions';

export const dynamic = 'force-dynamic';
const ORD: Record<string, number> = { atr: 0, pend: 1, pago: 2 };

export default async function Financeiro({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: inv } = await supabase.from('invoices').select('*, organizations(nome)').order('vencimento', { ascending: false }).limit(500);
  const I = (inv || []).slice().sort((a: any, b: any) => ORD[a.status] - ORD[b.status]);
  const soma = (st: string) => I.filter((x: any) => x.status === st).reduce((t: number, x: any) => t + Number(x.valor), 0);
  return (
    <AdminShell current="/admin/financeiro" title="Financeiro">
      <Flash sp={searchParams} />
      <div className="kpis"><div className="kpi"><span>Recebido</span><b>{brl(soma('pago'))}</b></div><div className="kpi"><span>A receber</span><b>{brl(soma('pend'))}</b></div><div className="kpi"><span>Em atraso</span><b style={{ color: 'var(--bad)' }}>{brl(soma('atr'))}</b></div></div>
      <div className="flex flex-wrap gap-2">
        <form action={gerarMensalidades}><button className="btn btn-primary btn-sm">Gerar mensalidades do próximo mês</button></form>
        <form action={atualizarAtrasos}><button className="btn btn-line btn-sm">Marcar vencidas como atrasadas</button></form>
      </div>
      <div className="tbl"><table><thead><tr><th>Cliente</th><th>Referência</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th></th></tr></thead><tbody>
        {I.map((f: any) => (
          <tr key={f.id}><td><Link className="link" href={`/admin/clientes/${f.org_id}`}>{f.organizations?.nome}</Link></td><td>{f.referencia}</td><td>{data(f.vencimento)}</td><td>{brl(f.valor)}</td><td><Chip map={INV_STATUS} value={f.status} /></td>
            <td>{f.status !== 'pago' ? <form action={marcarPaga}><input type="hidden" name="id" value={f.id} /><button className="link">Marcar como paga</button></form> : null}</td></tr>
        ))}
        {!I.length ? <tr><td colSpan={6} className="fine">Nenhuma fatura ainda.</td></tr> : null}
      </tbody></table></div>
    </AdminShell>
  );
}
