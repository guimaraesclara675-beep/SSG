import { requireClient } from '@/lib/auth';
import { ClientShell } from '@/components/ClientShell';
import { Chip } from '@/components/Chip';
import { brl, data, INV_STATUS, waLink } from '@/lib/format';
import { stripeAtivo } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export default async function Faturas() {
  const { supabase, org } = await requireClient();
  const { data: inv } = await supabase.from('invoices').select('*').eq('org_id', org.id).order('vencimento', { ascending: false });
  const { data: itens } = await supabase.from('plan_items').select('descricao,tipo,valor,parcelas').eq('org_id', org.id).order('created_at');
  const full = (await supabase.from('organizations').select('mensalidade,mensalidade_ativa,dia_vencimento').eq('id', org.id).single()).data;
  const mensal = (full?.mensalidade_ativa ? Number(full.mensalidade) : 0) + (itens || []).filter(i => i.tipo === 'mensal').reduce((t, i) => t + Number(i.valor), 0);
  return (
    <ClientShell org={org} current="/app/faturas" title="Faturas">
      <p className="muted text-sm">{stripeAtivo() ? 'Pague cada fatura por Pix, cartão ou boleto. A confirmação é automática e a fatura aparece como paga aqui.' : 'O pagamento é combinado direto com a SG pelo WhatsApp. Assim que for confirmado, a fatura aparece como paga aqui.'}</p>
      {(itens?.length || mensal > 0) ? (
        <div className="card">
          <div className="rowb"><b>Seu plano</b>{mensal > 0 ? <span className="text-sm">Total mensal: <b>{brl(mensal)}</b>{full?.dia_vencimento ? <span className="fine"> · vence todo dia {full.dia_vencimento}</span> : null}</span> : null}</div>
          <ul className="mt-2 text-sm flex flex-col gap-1">
            {full?.mensalidade_ativa ? <li className="rowb"><span>Mensalidade</span><b>{brl(full.mensalidade)}/mês</b></li> : null}
            {(itens || []).map((i, k) => <li key={k} className="rowb"><span>{i.descricao}</span><b>{brl(i.valor)}{i.tipo === 'mensal' ? '/mês' : i.parcelas > 1 ? ` em ${i.parcelas}x` : ''}</b></li>)}
          </ul>
        </div>
      ) : null}
      {inv?.length ? (
        <div className="tbl"><table><thead><tr><th>Nº</th><th>Referência</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th></th></tr></thead><tbody>
          {inv.map((f: any) => (
            <tr key={f.id}>
              <td className="font-mono text-xs">{f.numero}</td><td>{f.referencia}</td><td>{data(f.vencimento)}</td><td>{brl(f.valor)}</td><td><Chip map={INV_STATUS} value={f.status} /></td>
              <td>{f.status === 'pago' ? <span className="fine">Recebida{f.pago_em ? ` em ${data(f.pago_em)}` : ''}</span> : stripeAtivo() ? <a className="btn btn-primary btn-sm" href={`/pagar/${f.pay_token}`}>Pagar</a> : <a className="btn btn-wa btn-sm" target="_blank" rel="noopener" href={waLink(`Olá, SG Engenharias! Quero combinar o pagamento da fatura ${f.referencia} (${brl(f.valor)}, vencimento ${data(f.vencimento)}) da ${org.nome}.`)}>Combinar pagamento</a>}</td>
            </tr>
          ))}
        </tbody></table></div>
      ) : <div className="card muted">Nenhuma fatura ainda. Elas aparecem aqui depois da contratação.</div>}
    </ClientShell>
  );
}
