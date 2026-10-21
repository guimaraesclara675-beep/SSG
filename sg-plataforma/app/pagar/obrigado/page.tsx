import { waLink } from '@/lib/format';

const T: Record<string, [string, string]> = {
  ok: ['Pagamento enviado!', 'Assim que a confirmação chegar, a fatura aparece como paga na sua área. No Pix e no cartão isso costuma levar segundos; no boleto, até 2 dias úteis.'],
  pago: ['Esta fatura já está paga', 'Obrigado! Você pode conferir o recibo na sua área do cliente.'],
  cancelado: ['Pagamento não concluído', 'Nenhum valor foi cobrado. Você pode tentar de novo pelo mesmo link quando quiser.'],
  erro: ['Não conseguimos abrir o pagamento agora', 'Tente de novo em alguns minutos ou fale com a SG pelo WhatsApp.']
};

export default function Obrigado({ searchParams }: { searchParams: { status?: string } }) {
  const [titulo, texto] = T[searchParams.status || 'ok'] || T.ok;
  return (
    <div className="auth" style={{ gridTemplateColumns: '1fr' }}>
      <section className="auth-box" style={{ textAlign: 'center' }}>
        <span style={{ background: 'var(--hero)', borderRadius: 14, padding: '14px 18px', margin: '0 auto', display: 'inline-block' }}><img src="/logo-sg.png" alt="SG Engenharias" width={72} height={43} style={{ width: 72, height: 'auto' }} /></span>
        <h1 className="h2">{titulo}</h1>
        <p className="muted">{texto}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <a className="btn btn-primary" href="/app/faturas">Ir para minha área</a>
          <a className="btn btn-wa" href={waLink('Olá, SG Engenharias! Tenho uma dúvida sobre o pagamento da minha fatura.')} target="_blank" rel="noopener">Falar no WhatsApp</a>
        </div>
      </section>
    </div>
  );
}
