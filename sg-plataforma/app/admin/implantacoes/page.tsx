import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { Flash } from '@/components/Flash';
import { moverEtapa } from '../actions';

export const dynamic = 'force-dynamic';
const COLS = ['Aguardando', 'Diagnóstico', 'Configuração', 'Testes', 'No ar'];
const colOf = (o: { status: string; etapa: number }) => (o.status === 'aguardando' ? 0 : o.status === 'ativo' ? 4 : o.status === 'suspenso' ? -1 : Math.min(o.etapa, 2) + 1);

export default async function Implantacoes({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: orgs } = await supabase.from('organizations').select('id,nome,plano,status,etapa').order('created_at');
  return (
    <AdminShell current="/admin/implantacoes" title="Implantações">
      <Flash sp={searchParams} />
      <p className="muted text-sm">Mova cada cliente de etapa. Ele vê a etapa atual na área dele. Ao chegar em “No ar”, os módulos em implantação passam a ativos.</p>
      <div className="kanban">
        {COLS.map((c, i) => {
          const cs = (orgs || []).filter(o => colOf(o) === i);
          return (
            <div key={c} className="kcol"><h3>{c}<span>{cs.length}</span></h3>
              {cs.map(o => (
                <div key={o.id} className="kcard">
                  <Link className="font-semibold" href={`/admin/clientes/${o.id}`}>{o.nome}</Link><div className="fine">{o.plano}</div>
                  <div className="flex justify-between mt-2">
                    {i > 0 ? <form action={moverEtapa}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="col" value={i - 1} /><button className="btn btn-line btn-sm" aria-label="Voltar etapa">◀</button></form> : <span />}
                    {i < 4 ? <form action={moverEtapa}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="col" value={i + 1} /><button className="btn btn-line btn-sm" aria-label="Avançar etapa">▶</button></form> : <span />}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
