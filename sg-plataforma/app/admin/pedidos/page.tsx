import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { Flash } from '@/components/Flash';
import { data, LEAD_STATUS } from '@/lib/format';
import { criarCliente, statusPedido } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Pedidos({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(200);
  return (
    <AdminShell current="/admin/pedidos" title="Pedidos">
      <Flash sp={searchParams} />
      <p className="muted text-sm">Pedidos de orçamento enviados pelo site, com os módulos escolhidos e as demonstrações que a pessoa abriu.</p>
      {leads?.length ? (
        <div className="tbl"><table><thead><tr><th>Data</th><th>Contato</th><th>Empresa</th><th>Módulos</th><th>Situação</th><th></th></tr></thead><tbody>
          {leads.map((l: any) => (
            <tr key={l.id}>
              <td>{data(l.created_at)}<div className="font-mono text-xs fine">{l.protocolo}</div></td>
              <td><b>{l.nome}</b><div className="fine">{l.email}{l.whatsapp ? ` · ${l.whatsapp}` : ''}</div>{l.whatsapp ? <a className="link text-xs" target="_blank" rel="noopener" href={`https://wa.me/55${String(l.whatsapp).replace(/\D/g, '').replace(/^55/, '')}`}>WhatsApp</a> : null}</td>
              <td>{l.empresa}<div className="fine">{[l.segmento, l.porte].filter(Boolean).join(' · ')}</div>{l.descricao ? <div className="fine mt-1">“{l.descricao}”</div> : null}</td>
              <td className="text-sm">{(l.modulos || []).join(', ') || '—'}<div className="fine">{(l.demos || []).length} demonstrações vistas</div></td>
              <td><form action={statusPedido} className="flex gap-1"><input type="hidden" name="id" value={l.id} />
                <label htmlFor={`ls-${l.id}`} className="sr-only">Situação</label><select id={`ls-${l.id}`} name="status" defaultValue={l.status} className="inp" style={{ width: 'auto' }}>{LEAD_STATUS.map(s => <option key={s}>{s}</option>)}</select>
                <button className="btn btn-line btn-sm">OK</button></form></td>
              <td>{l.org_id ? <Link className="link text-sm" href={`/admin/clientes/${l.org_id}`}>Ver cliente</Link> : <form action={criarCliente}><input type="hidden" name="lead" value={l.id} /><button className="btn btn-primary btn-sm">Converter em cliente</button></form>}</td>
            </tr>
          ))}
        </tbody></table></div>
      ) : <div className="card muted">Nenhum pedido ainda. Eles chegam aqui quando alguém envia o orçamento pelo site.</div>}
    </AdminShell>
  );
}
