'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mud = { chave: string; descricao: string; antes: unknown; depois: unknown };
type Change = { id: string; pedido: string; resumo: string; mudancas: Mud[]; status: string; origem: string; created_at: string };
type Linha = { chave: string; descricao: string; valor: unknown };

const fmt = (v: unknown) => (typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : typeof v === 'string' ? v : JSON.stringify(v));
const ST: Record<string, [string, string]> = { proposta: ['Aguardando aprovação', 'chip-gold'], aplicada: ['Aplicada', 'chip-green'], recusada: ['Recusada', 'chip-gray'], desfeita: ['Desfeita', 'chip-gray'] };

export function AiPanel({ org, historico, atual, exemplos, uso }: { org?: string; historico: Change[]; atual: Linha[]; exemplos: string[]; uso?: string }) {
  const router = useRouter();
  const [pedido, setPedido] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'erro' | 'info'; m: string } | null>(null);
  const [prop, setProp] = useState<Change | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setProp(null);
    if (pedido.trim().length < 4) return;
    setBusy(true);
    const r = await fetch('/api/ia/propor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pedido, org }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (j.erro) setMsg({ t: 'erro', m: j.erro });
    else if (j.pergunta) setMsg({ t: 'info', m: j.pergunta });
    else if (j.change) setProp(j.change);
  }
  async function decidir(id: string, acao: 'aplicar' | 'recusar' | 'desfazer') {
    setBusy(true);
    const r = await fetch('/api/ia/decidir', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, acao }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (j.erro) { setMsg({ t: 'erro', m: j.erro }); return; }
    setProp(null); setPedido('');
    setMsg({ t: 'info', m: acao === 'aplicar' ? 'Ajuste aplicado. As automações já usam a nova configuração.' : acao === 'desfazer' ? 'Ajuste desfeito. Voltou ao valor anterior.' : 'Proposta recusada. Nada mudou.' });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={enviar} className="card flex flex-col gap-3">
        <div className="rowb"><b>O que você quer ajustar?</b>{uso ? <span className="fine">{uso}</span> : null}</div>
        <label htmlFor="pedido" className="sr-only">Pedido</label>
        <textarea id="pedido" className="inp" rows={3} maxLength={2000} value={pedido} onChange={e => setPedido(e.target.value)} placeholder="Ex.: quero que o lembrete de cobrança saia 5 dias antes do vencimento, num tom mais leve" />
        <div className="flex flex-wrap gap-2">{exemplos.map(x => <button type="button" key={x} className="chip chip-blue" onClick={() => setPedido(x)}>{x}</button>)}</div>
        <div><button className="btn btn-primary" disabled={busy || pedido.trim().length < 4}>{busy ? 'Pensando…' : 'Ver o que muda'}</button></div>
        <p className="fine">A IA só sugere. Nada muda até você aprovar, e todo ajuste pode ser desfeito.</p>
      </form>

      {msg ? <p className={`alert ${msg.t === 'erro' ? 'alert-err' : 'alert-ok'}`} role="status">{msg.m}</p> : null}

      {prop ? (
        <div className="card card-hl flex flex-col gap-3">
          <b>{prop.resumo || 'Proposta de ajuste'}</b>
          <div className="tbl"><table><thead><tr><th>Ajuste</th><th>Antes</th><th>Depois</th></tr></thead><tbody>
            {prop.mudancas.map(m => <tr key={m.chave}><td>{m.descricao}</td><td className="muted">{fmt(m.antes)}</td><td><b>{fmt(m.depois)}</b></td></tr>)}
          </tbody></table></div>
          <div className="flex gap-2"><button className="btn btn-primary" disabled={busy} onClick={() => decidir(prop.id, 'aplicar')}>Aprovar e aplicar</button><button className="btn btn-line" disabled={busy} onClick={() => decidir(prop.id, 'recusar')}>Recusar</button></div>
        </div>
      ) : null}

      <div className="card">
        <b>Configuração atual</b>
        <div className="tbl mt-3"><table><tbody>{atual.map(l => <tr key={l.chave}><td>{l.descricao}</td><td><b>{fmt(l.valor)}</b></td></tr>)}</tbody></table></div>
      </div>

      <div className="card">
        <b>Histórico de ajustes</b>
        {historico.length ? (
          <ul className="mt-2 flex flex-col">{historico.map(h => (
            <li key={h.id} className="py-3 border-b last:border-0 text-sm" style={{ borderColor: 'var(--line)' }}>
              <div className="rowb"><span><b>{h.resumo || h.pedido}</b> <span className="fine">· {new Date(h.created_at).toLocaleString('pt-BR')} · {h.origem === 'admin' ? 'SG Engenharias' : 'cliente'}</span></span><span className={`chip ${ST[h.status]?.[1]}`}>{ST[h.status]?.[0]}</span></div>
              <p className="fine mt-1">“{h.pedido}”</p>
              {h.status === 'aplicada' ? <button className="link text-sm mt-1" disabled={busy} onClick={() => decidir(h.id, 'desfazer')}>Desfazer</button> : null}
              {h.status === 'proposta' ? <span className="flex gap-3 mt-1"><button className="link text-sm" onClick={() => decidir(h.id, 'aplicar')}>Aplicar</button><button className="link text-sm" onClick={() => decidir(h.id, 'recusar')}>Recusar</button></span> : null}
            </li>))}</ul>
        ) : <p className="fine mt-2">Nenhum ajuste ainda.</p>}
      </div>
    </div>
  );
}
