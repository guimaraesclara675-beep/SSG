import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

/** A Stripe avisa aqui quando a fatura é paga. A assinatura do aviso é verificada antes de dar baixa. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get('stripe-signature');
  if (!secret || !sig) return NextResponse.json({ erro: 'não autorizado' }, { status: 400 });
  let ev: Stripe.Event;
  try { ev = stripe().webhooks.constructEvent(await req.text(), sig, secret); }
  catch { return NextResponse.json({ erro: 'assinatura inválida' }, { status: 400 }); }

  if (ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded' || ev.type === 'checkout.session.async_payment_failed') {
    const s = ev.data.object as Stripe.Checkout.Session;
    const id = s.metadata?.invoice_id;
    if (id) {
      const svc = createServiceClient();
      // Pix e boleto podem chegar como "completed" ainda sem pagamento; só damos baixa quando estiver pago.
      if (ev.type !== 'checkout.session.async_payment_failed' && s.payment_status === 'paid') {
        let forma: string | null = null;
        try {
          if (typeof s.payment_intent === 'string') {
            const pi = await stripe().paymentIntents.retrieve(s.payment_intent, { expand: ['latest_charge'] });
            forma = (pi.latest_charge as Stripe.Charge | null)?.payment_method_details?.type || null;
          }
        } catch { /* a forma é só informativa */ }
        const { data } = await svc.from('invoices').update({ status: 'pago', pago_em: new Date().toISOString(), forma_pagamento: forma }).eq('id', id).neq('status', 'pago').select('org_id').maybeSingle();
        if (data) await svc.from('audit_log').insert({ org_id: data.org_id, acao: 'fatura paga (Stripe)', detalhes: { fatura: id, forma, sessao: s.id } });
      } else if (ev.type === 'checkout.session.async_payment_failed') {
        const { data } = await svc.from('invoices').select('org_id').eq('id', id).maybeSingle();
        if (data) await svc.from('audit_log').insert({ org_id: data.org_id, acao: 'pagamento não concluído (Stripe)', detalhes: { fatura: id, sessao: s.id } });
      }
    }
  }
  return NextResponse.json({ received: true });
}
