import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth';
import { waLink } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Analise() {
  const { supabase, org } = await requireClient({ permitirPendente: true });
  if (org.status !== 'aguardando') redirect('/app');
  const { data: mods } = await supabase.from('org_modules').select('module_id,modules(nome)').eq('org_id', org.id);
  return (
    <div className="auth" style={{ gridTemplateColumns: '1fr' }}>
      <section className="auth-box" style={{ textAlign: 'center', maxWidth: 560 }}>
        <span style={{ background: 'var(--hero)', borderRadius: 14, padding: '14px 18px', margin: '0 auto', display: 'inline-block' }}><img src="/logo-sg.png" alt="SG Engenharias" width={72} height={43} style={{ width: 72, height: 'auto' }} /></span>
        <h1 className="h2">Recebemos o cadastro da {org.nome}</h1>
        <p className="muted">A SG Engenharias vai analisar e liberar o seu acesso. Normalmente isso acontece em até 1 dia útil, depois de uma conversa rápida para entender o que você precisa.</p>
        {mods?.length ? (
          <div className="card" style={{ textAlign: 'left' }}>
            <b className="text-sm">Módulos que você escolheu</b>
            <ul className="mt-2 text-sm muted">{mods.map((m: any) => <li key={m.module_id}>{m.module_id} · {m.modules?.nome}</li>)}</ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 justify-center">
          <a className="btn btn-wa" target="_blank" rel="noopener" href={waLink(`Olá, SG Engenharias! Acabei de criar a conta da ${org.nome} e quero agendar a conversa.`)}>Agendar a conversa no WhatsApp</a>
          <form action="/sair" method="post"><button className="btn btn-line">Sair</button></form>
        </div>
      </section>
    </div>
  );
}
