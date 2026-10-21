import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SEGMENTOS } from '@/lib/format';
import { criarEmpresa } from './actions';

export const dynamic = 'force-dynamic';

export default async function BemVindo({ searchParams }: { searchParams: { modulos?: string; erro?: string } }) {
  const { supabase, user, profile } = await getSession();
  if (!user) redirect('/entrar?modo=criar');
  const { data: m } = await supabase.from('memberships').select('org_id').eq('user_id', user.id).limit(1).maybeSingle();
  if (m) redirect('/app');
  const ids = (searchParams.modulos || '').split(',').filter(x => /^[A-Z]-\d\d$/.test(x)).slice(0, 30);
  const { data: mods } = ids.length ? await supabase.from('modules').select('id,nome').in('id', ids) : { data: [] as { id: string; nome: string }[] };
  return (
    <div className="auth">
      <section className="auth-side">
        <a href="/" className="flex items-center gap-3 font-semibold"><img src="/logo-sg-completo.png" alt="SG Engenharias · Salford & Co." width={180} height={139} style={{ width: 180, height: 'auto' }} /></a>
        <div><h2>Falta só a sua empresa.</h2><p>Com isso a SG já vê o seu pedido e agenda a conversa de diagnóstico.</p></div>
        <span />
      </section>
      <section className="auth-box">
        <h1 className="h2">Olá{profile?.nome ? `, ${profile.nome.split(' ')[0]}` : ''}!</h1>
        {searchParams.erro ? <p className="alert alert-err">{searchParams.erro}</p> : null}
        <form action={criarEmpresa} className="form">
          <div className="fld full"><label htmlFor="nome">Nome da empresa</label><input id="nome" name="nome" required minLength={2} /></div>
          <div className="fld"><label htmlFor="segmento">Segmento</label><select id="segmento" name="segmento" defaultValue=""><option value="">Selecione</option>{SEGMENTOS.map(s => <option key={s}>{s}</option>)}</select></div>
          <div className="fld"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" inputMode="tel" placeholder="(81) 9 0000-0000" /></div>
          {mods && mods.length ? (
            <div className="full card">
              <b className="text-sm">Módulos que você escolheu no site</b>
              <ul className="mt-2 text-sm muted">{mods.map(x => <li key={x.id}>{x.id} · {x.nome}</li>)}</ul>
              <input type="hidden" name="modulos" value={mods.map(x => x.id).join(',')} />
            </div>
          ) : null}
          <button className="btn btn-primary full">Criar minha área</button>
        </form>
      </section>
    </div>
  );
}
