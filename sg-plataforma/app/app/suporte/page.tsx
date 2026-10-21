import { requireClient } from '@/lib/auth';
import { ClientShell } from '@/components/ClientShell';
import { Chip } from '@/components/Chip';
import { Flash } from '@/components/Flash';
import { data, TICKET_STATUS } from '@/lib/format';
import { abrirChamado } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Suporte({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase, org } = await requireClient();
  const { data: tk } = await supabase.from('tickets').select('*').eq('org_id', org.id).order('created_at', { ascending: false });
  return (
    <ClientShell org={org} current="/app/suporte" title="Suporte">
      <Flash sp={searchParams} />
      <form action={abrirChamado} className="card form">
        <b className="full">Abrir chamado</b>
        <div className="fld full"><label htmlFor="assunto">Assunto</label><input id="assunto" name="assunto" required maxLength={200} placeholder="Ex.: mudar o texto de uma mensagem" /></div>
        <div className="fld full"><label htmlFor="mensagem">Descreva o que precisa</label><textarea id="mensagem" name="mensagem" maxLength={5000} /></div>
        <div><button className="btn btn-primary">Enviar chamado</button></div>
      </form>
      {(tk || []).map((t: any) => (
        <div key={t.id} className="card">
          <div className="rowb"><b>{t.assunto}</b><Chip map={TICKET_STATUS} value={t.status} /></div>
          <p className="fine">#{t.numero} · aberto em {data(t.created_at)}</p>
          {t.mensagem ? <p className="mt-2 text-sm">{t.mensagem}</p> : null}
          {t.resposta ? <div className="resp"><b className="block text-xs" style={{ color: 'var(--gold)' }}>SG Engenharias</b>{t.resposta}</div> : null}
        </div>
      ))}
    </ClientShell>
  );
}
