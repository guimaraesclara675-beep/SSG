import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { Chip } from '@/components/Chip';
import { Flash } from '@/components/Flash';
import { brl, data, ORG_STATUS, SEGMENTOS } from '@/lib/format';
import { KITS } from '@/lib/catalog';
import { criarCliente } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Clientes({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: orgs } = await supabase.from('organizations').select('*, org_modules(status)').order('created_at', { ascending: false });
  return (
    <AdminShell current="/admin/clientes" title="Clientes">
      <Flash sp={searchParams} />
      <div className="tbl"><table><thead><tr><th>Cliente</th><th>Segmento</th><th>Plano</th><th>Módulos</th><th>Mensalidade</th><th>Situação</th></tr></thead><tbody>
        {(orgs || []).map((o: any) => {
          const ms = o.org_modules || [], at = ms.filter((m: any) => m.status === 'ativo').length, so = ms.filter((m: any) => m.status === 'solicitado').length;
          return (
            <tr key={o.id}>
              <td><Link className="link" href={`/admin/clientes/${o.id}`}>{o.nome}</Link><div className="fine">desde {data(o.created_at)}</div></td>
              <td>{o.segmento || '—'}</td><td>{o.plano}</td>
              <td>{at} ativos{so ? <b style={{ color: 'var(--gold)' }}> · {so} solicitados</b> : null}</td>
              <td>{o.mensalidade_ativa && Number(o.mensalidade) ? brl(o.mensalidade) : '—'}</td><td><Chip map={ORG_STATUS} value={o.status} /></td>
            </tr>
          );
        })}
      </tbody></table></div>
      <details className="card">
        <summary className="cursor-pointer font-semibold">Novo cliente</summary>
        <form action={criarCliente} className="form mt-3">
          <div className="fld"><label htmlFor="empresa">Empresa</label><input id="empresa" name="empresa" required /></div>
          <div className="fld"><label htmlFor="contato">Contato</label><input id="contato" name="contato" /></div>
          <div className="fld"><label htmlFor="email">E-mail do contato</label><input id="email" name="email" type="email" required /></div>
          <div className="fld"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" /></div>
          <div className="fld"><label htmlFor="segmento">Segmento</label><select id="segmento" name="segmento"><option value="">—</option>{SEGMENTOS.map(x => <option key={x}>{x}</option>)}</select></div>
          <div className="fld"><label htmlFor="kit">Kit inicial</label><select id="kit" name="kit"><option value="">Nenhum</option>{KITS.map(k => <option key={k.id} value={k.id}>{k.nome}</option>)}</select></div>
          <div className="full"><button className="btn btn-primary">Criar e enviar convite</button></div>
        </form>
      </details>
    </AdminShell>
  );
}
