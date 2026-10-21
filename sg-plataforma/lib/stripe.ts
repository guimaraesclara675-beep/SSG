import 'server-only';
import Stripe from 'stripe';

export const stripeAtivo = () => !!process.env.STRIPE_SECRET_KEY;
let cliente: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Configure STRIPE_SECRET_KEY.');
  return (cliente ??= new Stripe(process.env.STRIPE_SECRET_KEY));
}
/** Link permanente de pagamento da fatura (abre o checkout da Stripe na hora em que o cliente clica). */
export const linkPagamento = (payToken: string) => `${process.env.NEXT_PUBLIC_SITE_URL || ''}/pagar/${payToken}`;
