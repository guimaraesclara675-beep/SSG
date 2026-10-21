import { requireClient } from '@/lib/auth';
import { ClientShell } from '@/components/ClientShell';
import { Chip } from '@/components/Chip';
import { Flash } from '@/components/Flash';
import { MOD_STATUS } from '@/lib/format';
import { solicitarModulo } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Modulos({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { supabase, org } = await requireClient();
  const [{ data: mods }, { data: cat }] = await Promise.all([
    supabase.from('org_modules').select('module_id,status,modules(nome,descricao)').eq('org_id', org.id).order('module_id'),
    supabase.from('modules').select('id,nome').order('id')
  ]);
  return (
    <ClientShell org={org} current="/app/modulos" title="Meus módulos">
      <Flash sp={searchParams} />
      <p className="muted text-sm">Para incluir um módulo novo, solicite abaixo. A SG confirma o valor com você antes de ativar.</p>
      {mods?.length ? (
        <div className="grid-cards">
          {mods.map((m: any) => (
            <div key={m.module_id} className="card flex flex-col gap-2">
              <div className="rowb"><span className="text-xs font-mono" style={{ color: 'var(--gold)' }}>{m.module_id}</span><Chip map={MOD_STATUS} value={m.status} /></div>
              <b>{m.modules?.nome}</b>
              <p className="text-sm muted flex-1">{m.modules?.descricao}</p>
              {m.status === 'solicitado' ? <span className="fine">Aguardando aprovação da SG</span> : null}
            </div>
          ))}
        </div>
      ) : <div className="card muted">Nenhum módulo ainda. Escolha no catálogo do site ou solicite abaixo.</div>}
      <form action={solicitarModulo} className="card flex flex-col gap-2">
        <label htmlFor="modulo"><b>Solicitar novo módulo</b></label>
        <div className="flex gap-2">
          <input id="modulo" name="modulo" list="cat" className="inp" placeholder="Digite para buscar: cobrança, WhatsApp, obra…" autoComplete="off" />
          <button className="btn btn-primary">Solicitar</button>
        </div>
        <datalist id="cat">{(cat || []).map(c => <option key={c.id} value={`${c.id} · ${c.nome}`} />)}</datalist>
      </form>
    </ClientShell>
  );
}
