import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { Chip } from '@/components/Chip';
import { Flash } from '@/components/Flash';
import { data, TICKET_STATUS } from '@/lib/format';
import { responderChamado } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Chamados({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: tk } = await supabase.from('tickets').select('*, organizations(nome)').order('created_at', { ascending: false }).limit(200);
  const T = (tk || []).slice().sort((a: any, b: any) => (a.status === 'aberto' ? 0 : 1) - (b.status === 'aberto' ? 0 : 1));
  return (
    <AdminShell current="/admin/chamados" title="Chamados">
      <Flash sp={searchParams} />
      {T.length ? T.map((t: any) => (
        <div key={t.id} className="card">
          <div className="rowb"><b>{t.assunto}</b><Chip map={TICKET_STATUS} value={t.status} /></div>
          <p className="fine"><Link className="link" href={`/admin/clientes/${t.org_id}`}>{t.organizations?.nome}</Link> · #{t.numero} · {data(t.created_at)}</p>
          {t.mensagem ? <p className="mt-2 text-sm">{t.mensagem}</p> : null}
          {t.resposta ? <div className="resp"><b className="block text-xs" style={{ color: 'var(--gold)' }}>Sua resposta</b>{t.resposta}</div> : (
            <form action={responderChamado} className="flex gap-2 mt-3"><input type="hidden" name="id" value={t.id} />
              <label htmlFor={`r-${t.id}`} className="sr-only">Resposta</label><input id={`r-${t.id}`} name="resposta" className="inp flex-1" placeholder="Escreva a resposta ao cliente…" required />
              <button className="btn btn-primary">Responder</button></form>
          )}
        </div>
      )) : <div className="card muted">Nenhum chamado.</div>}
    </AdminShell>
  );
}
