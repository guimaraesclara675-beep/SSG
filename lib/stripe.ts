import 'server-only';
import Stripe from 'stripe';

export const stripeAtivo = () => !!process.env.STRIPE_SECRET_KEY;
let cliente: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Configure STRIPE_SECRET_KEY.');
  // fetch funciona tanto no Cloudflare Workers quanto em Node
  return (cliente ??= new Stripe(process.env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() }));
}
/** Verificação de assinatura com Web Crypto (exigida no Cloudflare Workers). */
export const cryptoProvider = Stripe.createSubtleCryptoProvider();
/** Link permanente de pagamento da fatura (abre o checkout da Stripe na hora em que o cliente clica). */
export const linkPagamento = (payToken: string) => `${process.env.NEXT_PUBLIC_SITE_URL || ''}/pagar/${payToken}`;
