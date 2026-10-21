import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';
import { Chip } from '@/components/Chip';
import { Flash } from '@/components/Flash';
import { brl, data, ETAPAS, INV_STATUS, MOD_STATUS, ORG_STATUS, TICKET_STATUS } from '@/lib/format';
import { KITS } from '@/lib/catalog';
import { linkPagamento, stripeAtivo } from '@/lib/stripe';
import { AiPanel } from '@/components/AiPanel';
import { dadosIA } from '@/lib/config';
import { aprovarCadastro, adicionarItem, adicionarModulos, convidarParaCliente, gerarCobrancasCliente, lancarFatura, marcarPaga, removerItem, salvarCliente, salvarCobranca, statusModulo } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function Cliente({ params, searchParams }: { params: { id: string }; searchParams: { ok?: string; erro?: string } }) {
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase.from('organizations').select('*').eq('id', params.id).maybeSingle();
  if (!o) notFound();
  const [{ data: mods }, { data: inv }, { data: tk }, { data: ms }, { data: cat }] = await Promise.all([
    supabase.from('org_modules').select('module_id,status,modules(nome)').eq('org_id', o.id).order('module_id'),
    supabase.from('invoices').select('*').eq('org_id', o.id).order('vencimento', { ascending: false }),
    supabase.from('tickets').select('id,assunto,status,created_at').eq('org_id', o.id).order('created_at', { ascending: false }),
    supabase.from('memberships').select('user_id,perfil,profiles:user_id(nome,email)').eq('org_id', o.id),
    supabase.from('modules').select('id,nome').order('id')
  ]);
  const wa = o.whatsapp ? `https://wa.me/55${String(o.whatsapp).replace(/\D/g, '').replace(/^55/, '')}` : null;
  const { data: itens } = await supabase.from('plan_items').select('*').eq('org_id', o.id).order('created_at');
  const mensais = (itens || []).filter((i: any) => i.tipo === 'mensal').reduce((t: number, i: any) => t + Number(i.valor), 0);
  const totalMes = (o.mensalidade_ativa ? Number(o.mensalidade) : 0) + mensais;
  const pendentes = (itens || []).filter((i: any) => i.tipo === 'unico' && !i.cobrado);
  const zap = (f: any) => wa ? `${wa}?text=${encodeURIComponent(`Olá! Segue a fatura da SG Engenharias: ${f.referencia}, ${brl(f.valor)}, vencimento ${data(f.vencimento)}.${stripeAtivo() ? ` Pague por Pix, cartão ou boleto aqui: ${linkPagamento(f.pay_token)}` : ' Qualquer dúvida sobre o pagamento, é só me chamar por aqui.'}`)}` : null;
  const ia = await dadosIA(supabase, o.id, o.config || {}, true);
  const { data: sec } = await supabase.from('org_secrets').select('api_token').eq('org_id', o.id).maybeSingle();
  return (
    <AdminShell current="/admin/clientes" title="Clientes">
      <Link className="link text-sm" href="/admin/clientes">← Todos os clientes</Link>
      <Flash sp={searchParams} />
      {o.status === 'aguardando' ? (
        <form action={aprovarCadastro} className="card card-hl rowb">
          <input type="hidden" name="id" value={o.id} />
          <span className="text-sm"><b>Cadastro aguardando sua aprovação.</b> Enquanto isso, o cliente só vê a tela “Cadastro em análise”.</span>
          <button className="btn btn-primary btn-sm">Aprovar cadastro</button>
        </form>
      ) : null}
      <div className="rowb"><div><h2 className="h2">{o.nome}</h2><p className="muted text-sm">{[o.segmento, o.plano].filter(Boolean).join(' · ')}</p></div>
        <div className="flex gap-2 items-center"><Chip map={ORG_STATUS} value={o.status} />{wa ? <a className="btn btn-wa btn-sm" href={wa} target="_blank" rel="noopener">WhatsApp</a> : null}</div></div>

      <form action={salvarCliente} className="card form">
        <input type="hidden" name="id" value={o.id} />
        <div className="fld"><label htmlFor="status">Situação</label><select id="status" name="status" defaultValue={o.status}>{Object.entries(ORG_STATUS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></div>
        <div className="fld"><label htmlFor="etapa">Etapa</label><select id="etapa" name="etapa" defaultValue={o.etapa}>{ETAPAS.map((e, i) => <option key={e} value={i}>{e}</option>)}</select></div>
        <div className="fld"><label htmlFor="plano">Plano</label><input id="plano" name="plano" defaultValue={o.plano} /></div>
        <div className="fld"><label htmlFor="dominio">Endereço do sistema</label><input id="dominio" name="dominio" defaultValue={o.dominio || ''} /></div>
        <div className="fld"><label className="flex items-center gap-2" htmlFor="ia_habilitada"><input id="ia_habilitada" name="ia_habilitada" type="checkbox" defaultChecked={o.ia_habilitada} />IA de ajustes liberada para o cliente</label><span className="fine">Ligue conforme o plano contratado.</span></div>
        <div className="fld"><label htmlFor="ia_limite_mensal">Limite de ajustes com IA por mês</label><input id="ia_limite_mensal" name="ia_limite_mensal" type="number" min="0" max="10000" defaultValue={o.ia_limite_mensal} /></div>
        <div className="fld full"><label htmlFor="observacoes">Observações internas</label><textarea id="observacoes" name="observacoes" defaultValue={o.observacoes || ''} /></div>
        <div><button className="btn btn-primary">Salvar</button></div>
      </form>

      <div className="card flex flex-col gap-3">
        <b>Módulos</b>
        <div className="tbl"><table><thead><tr><th>Módulo</th><th>Situação</th><th></th></tr></thead><tbody>
          {(mods || []).map((m: any) => (
            <tr key={m.module_id}><td><span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>{m.module_id}</span> {m.modules?.nome}</td><td><Chip map={MOD_STATUS} value={m.status} /></td>
              <td><form action={statusModulo} className="flex gap-2"><input type="hidden" name="org" value={o.id} /><input type="hidden" name="modulo" value={m.module_id} />
                <label htmlFor={`st-${m.module_id}`} className="sr-only">Nova situação</label><select id={`st-${m.module_id}`} name="status" defaultValue={m.status} className="inp" style={{ width: 'auto' }}>{Object.entries(MOD_STATUS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
                <button className="btn btn-line btn-sm">Aplicar</button></form></td></tr>
          ))}
          {!mods?.length ? <tr><td colSpan={3} className="fine">Nenhum módulo.</td></tr> : null}
        </tbody></table></div>
        <form action={adicionarModulos} className="flex flex-wrap gap-2">
          <input type="hidden" name="org" value={o.id} />
          <label htmlFor="mod" className="sr-only">Módulo</label><input id="mod" name="modulo" list="cat" className="inp flex-1" style={{ minWidth: 220 }} placeholder="Adicionar módulo do catálogo…" autoComplete="off" />
          <label htmlFor="kit" className="sr-only">Kit</label><select id="kit" name="kit" className="inp" style={{ width: 'auto' }}><option value="">ou aplicar um kit…</option>{KITS.map(k => <option key={k.id} value={k.id}>{k.nome}</option>)}</select>
          <button className="btn btn-line">Adicionar</button>
          <datalist id="cat">{(cat || []).map(c => <option key={c.id} value={`${c.id} · ${c.nome}`} />)}</datalist>
        </form>
      </div>

      <details className="card" open={false}>
        <summary className="cursor-pointer font-semibold">Ajustar este cliente com IA</summary>
        <p className="fine mt-1">Você pode ajustar qualquer cliente, mesmo sem a IA no plano dele. O cliente vê o histórico na área dele.</p>
        <div className="mt-3"><AiPanel org={o.id} historico={ia.historico as never} atual={ia.atual} exemplos={ia.exemplos} /></div>
        <p className="fine mt-3">Chave das automações (n8n, Make): <code className="font-mono select-all">{sec?.api_token || '—'}</code> · use em <code className="font-mono">GET /api/config</code> com o cabeçalho <code className="font-mono">Authorization: Bearer</code>.</p>
      </details>

      <div className="card flex flex-col gap-4">
        <div className="rowb"><b>Plano e cobrança</b><span className="text-sm">Total mensal: <b>{brl(totalMes)}</b></span></div>
        <form action={salvarCobranca} className="form">
          <input type="hidden" name="id" value={o.id} />
          <div className="fld"><label htmlFor="cpf_cnpj">CPF ou CNPJ</label><input id="cpf_cnpj" name="cpf_cnpj" defaultValue={o.cpf_cnpj || ''} placeholder="00.000.000/0001-00" /></div>
          <div className="fld"><label htmlFor="email_cobranca">E-mail de cobrança</label><input id="email_cobranca" name="email_cobranca" type="email" defaultValue={o.email_cobranca || ''} /></div>
          <div className="fld"><label className="flex items-center gap-2" htmlFor="mensalidade_ativa"><input id="mensalidade_ativa" name="mensalidade_ativa" type="checkbox" defaultChecked={o.mensalidade_ativa} />Cobra mensalidade</label></div>
          <div className="fld"><label htmlFor="mensalidade">Valor da mensalidade (R$)</label><input id="mensalidade" name="mensalidade" type="number" min="0" step="0.01" defaultValue={o.mensalidade} /></div>
          <div className="fld"><label htmlFor="dia_vencimento">Dia do vencimento</label><input id="dia_vencimento" name="dia_vencimento" type="number" min="1" max="28" defaultValue={o.dia_vencimento} /></div>
          <div className="fld"><label htmlFor="cobranca_inicio">Cobrar mensalidade a partir de</label><input id="cobranca_inicio" name="cobranca_inicio" type="date" defaultValue={o.cobranca_inicio || ''} /></div>
          <div><button className="btn btn-primary">Salvar cobrança</button></div>
        </form>
        <div>
          <b className="text-sm">Pacote, implantação e personalizações</b>
          <div className="tbl mt-2"><table><thead><tr><th>Item</th><th>Tipo</th><th>Valor</th><th>Situação</th><th></th></tr></thead><tbody>
            {(itens || []).map((i: any) => <tr key={i.id}><td>{i.descricao}</td><td>{i.tipo === 'mensal' ? 'Mensal' : i.parcelas > 1 ? `Único em ${i.parcelas}x` : 'Único'}</td><td>{brl(i.valor)}{i.tipo === 'mensal' ? '/mês' : ''}</td>
              <td>{i.tipo === 'mensal' ? <span className="fine">Somado à mensalidade</span> : i.cobrado ? <span className="chip chip-green">Faturado</span> : <span className="chip chip-gold">A faturar</span>}</td>
              <td>{!i.cobrado ? <form action={removerItem}><input type="hidden" name="org" value={o.id} /><input type="hidden" name="id" value={i.id} /><button className="link text-sm">Remover</button></form> : null}</td></tr>)}
            {!itens?.length ? <tr><td colSpan={5} className="fine">Nenhum item. Adicione o pacote, a implantação ou algo personalizado.</td></tr> : null}
          </tbody></table></div>
          <form action={adicionarItem} className="form mt-3">
            <input type="hidden" name="org" value={o.id} />
            <div className="fld full"><label htmlFor="descricao">Descrição</label><input id="descricao" name="descricao" placeholder="Ex.: Kit Imobiliária Completa · implantação" required /></div>
            <div className="fld"><label htmlFor="tipo">Tipo</label><select id="tipo" name="tipo"><option value="unico">Pagamento único (pacote, implantação, personalização)</option><option value="mensal">Mensal (somado à mensalidade)</option></select></div>
            <div className="fld"><label htmlFor="ivalor">Valor total (R$)</label><input id="ivalor" name="valor" type="number" min="1" step="0.01" required /></div>
            <div className="fld"><label htmlFor="parcelas">Parcelas (se único)</label><input id="parcelas" name="parcelas" type="number" min="1" max="24" defaultValue={1} /></div>
            <div className="fld"><label htmlFor="primeiro_vencimento">1º vencimento (se único)</label><input id="primeiro_vencimento" name="primeiro_vencimento" type="date" /></div>
            <div><button className="btn btn-line">Adicionar item</button></div>
          </form>
        </div>
        <form action={gerarCobrancasCliente} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="org" value={o.id} />
          <button className="btn btn-primary" disabled={!pendentes.length}>Gerar cobranças dos itens a faturar</button>
          <span className="fine">{pendentes.length ? `${pendentes.length} item(ns) a faturar.` : 'Nada a faturar.'} As mensalidades saem pelo Financeiro, todo mês, já somando os itens mensais.</span>
        </form>
      </div>

      <div className="card flex flex-col gap-3">
        <b>Faturas</b>
        <p className="fine">{stripeAtivo() ? 'Cada fatura tem um link de pagamento (Pix, cartão ou boleto). Envie pelo WhatsApp: quando o cliente pagar, a fatura vira paga sozinha.' : 'Envie cada fatura pelo WhatsApp e, quando o cliente pagar, clique em “Marcar como paga”.'}</p>
        {inv?.length ? <div className="tbl"><table><thead><tr><th>Referência</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th></th></tr></thead><tbody>
          {inv.map((f: any) => <tr key={f.id}><td>{f.referencia}</td><td>{data(f.vencimento)}</td><td>{brl(f.valor)}</td><td><Chip map={INV_STATUS} value={f.status} /></td>
            <td className="flex flex-wrap gap-3">{f.status !== 'pago' && zap(f) ? <a className="link" target="_blank" rel="noopener" href={zap(f)!}>Enviar no WhatsApp</a> : null}{f.status !== 'pago' && stripeAtivo() ? <a className="link" target="_blank" rel="noopener" href={linkPagamento(f.pay_token)}>Link de pagamento</a> : null}{f.status === 'pago' && f.forma_pagamento ? <span className="fine">via {f.forma_pagamento === 'card' ? 'cartão' : f.forma_pagamento}</span> : null}{f.status !== 'pago' ? <form action={marcarPaga}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="volta" value={`/admin/clientes/${o.id}`} /><button className="link">Marcar como paga</button></form> : null}</td></tr>)}
        </tbody></table></div> : <p className="fine">Nenhuma fatura.</p>}
        <form action={lancarFatura} className="form">
          <input type="hidden" name="org" value={o.id} />
          <div className="fld"><label htmlFor="referencia">Referência</label><input id="referencia" name="referencia" placeholder="Implantação 1/2" required /></div>
          <div className="fld"><label htmlFor="valor">Valor (R$)</label><input id="valor" name="valor" type="number" min="1" step="0.01" required /></div>
          <div className="fld"><label htmlFor="vencimento">Vencimento</label><input id="vencimento" name="vencimento" type="date" required /></div>
          <div><button className="btn btn-primary">Lançar fatura</button></div>
        </form>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <div className="card flex flex-col gap-3">
          <b>Pessoas com acesso</b>
          {(ms || []).length ? <ul className="text-sm flex flex-col gap-1">{(ms || []).map((m: any) => <li key={m.user_id}>{m.profiles?.nome || m.profiles?.email} <span className="fine">· {m.profiles?.email} · {m.perfil}</span></li>)}</ul> : <p className="fine">Ninguém ainda. Envie o convite abaixo.</p>}
          <form action={convidarParaCliente} className="flex flex-wrap gap-2">
            <input type="hidden" name="org" value={o.id} />
            <label htmlFor="cnome" className="sr-only">Nome</label><input id="cnome" name="nome" className="inp flex-1" style={{ minWidth: 140 }} placeholder="Nome" />
            <label htmlFor="cemail" className="sr-only">E-mail</label><input id="cemail" name="email" type="email" className="inp flex-1" style={{ minWidth: 180 }} placeholder="E-mail" required />
            <button className="btn btn-line">Convidar</button>
          </form>
        </div>
        <div className="card">
          <b>Chamados</b>
          {(tk || []).length ? <ul className="text-sm mt-2 flex flex-col gap-1">{(tk || []).map((t: any) => <li key={t.id} className="rowb"><span>{t.assunto}</span><Chip map={TICKET_STATUS} value={t.status} /></li>)}</ul> : <p className="fine mt-2">Nenhum chamado.</p>}
          <Link className="link text-sm mt-3 inline-block" href="/admin/chamados">Responder chamados</Link>
        </div>
      </div>
    </AdminShell>
  );
}
