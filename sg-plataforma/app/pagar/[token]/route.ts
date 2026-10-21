import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { stripe, stripeAtivo } from '@/lib/stripe';
import { waLink } from '@/lib/format';

/**
 * Link de pagamento da fatura. Cria a sessão de checkout da Stripe na hora do clique,
 * então o link enviado pelo WhatsApp nunca expira.
 */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  if (!/^[0-9a-f-]{36}$/i.test(params.token)) return NextResponse.redirect(`${site}/`, 303);
  const svc = createServiceClient();
  const { data: f } = await svc.from('invoices').select('id,referencia,valor,status,org_id,organizations(nome,email_cobranca)').eq('pay_token', params.token).maybeSingle();
  if (!f) return NextResponse.redirect(`${site}/`, 303);
  if (f.status === 'pago') return NextResponse.redirect(`${site}/pagar/obrigado?status=pago`, 303);
  const org = f.organizations as unknown as { nome: string; email_cobranca: string | null } | null;
  if (!stripeAtivo()) return NextResponse.redirect(waLink(`Olá, SG Engenharias! Quero pagar a fatura ${f.referencia} (${org?.nome || ''}).`), 303);
  try {
    const s = await stripe().checkout.sessions.create({
      mode: 'payment',
      // As formas de pagamento (Pix, cartão, boleto) vêm do que estiver ativado no painel da Stripe.
      line_items: [{ quantity: 1, price_data: { currency: 'brl', unit_amount: Math.round(Number(f.valor) * 100), product_data: { name: f.referencia, description: org?.nome ? `SG Engenharias · ${org.nome}` : 'SG Engenharias' } } }],
      customer_email: org?.email_cobranca || undefined,
      client_reference_id: f.id,
      metadata: { invoice_id: f.id },
      payment_intent_data: { metadata: { invoice_id: f.id }, description: f.referencia },
      success_url: `${site}/pagar/obrigado?status=ok`,
      cancel_url: `${site}/pagar/obrigado?status=cancelado`,
      locale: 'pt-BR'
    });
    await svc.from('invoices').update({ stripe_session_id: s.id }).eq('id', f.id);
    return NextResponse.redirect(s.url!, 303);
  } catch {
    return NextResponse.redirect(`${site}/pagar/obrigado?status=erro`, 303);
  }
}
