import { requireClient } from '@/lib/auth';
import { ClientShell } from '@/components/ClientShell';
import { Flash } from '@/components/Flash';
import { convidarPessoa } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Equipe({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase, org, perfil } = await requireClient();
  const { data: ms } = await supabase.from('memberships').select('user_id,perfil,profiles:user_id(nome,email)').eq('org_id', org.id);
  return (
    <ClientShell org={org} current="/app/equipe" title="Equipe">
      <Flash sp={searchParams} />
      <div className="tbl"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th></tr></thead><tbody>
        {(ms || []).map((m: any) => <tr key={m.user_id}><td>{m.profiles?.nome || '—'}</td><td>{m.profiles?.email || '—'}</td><td>{m.perfil}</td></tr>)}
      </tbody></table></div>
      {perfil === 'Administrador' ? (
        <form action={convidarPessoa} className="card form">
          <b className="full">Convidar pessoa da equipe</b>
          <div className="fld"><label htmlFor="nome">Nome</label><input id="nome" name="nome" /></div>
          <div className="fld"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required /></div>
          <div className="fld"><label htmlFor="perfil">Perfil</label><select id="perfil" name="perfil"><option>Operador</option><option>Financeiro</option><option>Administrador</option></select></div>
          <div className="fld justify-end"><button className="btn btn-primary">Enviar convite</button></div>
          <p className="fine full">A pessoa recebe um e-mail para entrar com o próprio login.</p>
        </form>
      ) : <p className="fine">Só administradores da empresa convidam pessoas.</p>}
    </ClientShell>
  );
}
