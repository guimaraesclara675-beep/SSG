import { requireClient } from '@/lib/auth';
import { ClientShell } from '@/components/ClientShell';
import { AiPanel } from '@/components/AiPanel';
import { dadosIA } from '@/lib/config';
import { waLink } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AjustesIA() {
  const { supabase, org } = await requireClient();
  const full = (await supabase.from('organizations').select('config,ia_habilitada,ia_limite_mensal').eq('id', org.id).single()).data;
  if (!full?.ia_habilitada) {
    return (
      <ClientShell org={org} current="/app/ia" title="Ajustes com IA">
        <div className="card card-hl flex flex-col gap-3">
          <b>Ajuste o seu sistema conversando</b>
          <p className="text-sm muted">Com a IA de ajustes, você escreve o que quer mudar (prazos, horários, textos das mensagens) e aprova antes de aplicar. Está disponível nos planos com IA.</p>
          <div><a className="btn btn-wa" target="_blank" rel="noopener" href={waLink(`Olá, SG Engenharias! Quero incluir a IA de ajustes no plano da ${org.nome}.`)}>Quero a IA no meu plano</a></div>
        </div>
      </ClientShell>
    );
  }
  const d = await dadosIA(supabase, org.id, full.config, false);
  return (
    <ClientShell org={org} current="/app/ia" title="Ajustes com IA">
      <AiPanel historico={d.historico} atual={d.atual} exemplos={d.exemplos} uso={`${d.usadasNoMes} de ${full.ia_limite_mensal} ajustes usados neste mês`} />
    </ClientShell>
  );
}
