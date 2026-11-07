import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

/** Convida por e-mail (ou reaproveita a conta existente) e vincula à empresa. Retorna mensagem de erro ou null. */
export async function convidar(email: string, nome: string, orgId: string, perfil: string): Promise<string | null> {
  let svc;
  try { svc = createServiceClient(); } catch (e) { return (e as Error).message; }
  const { data: existente } = await svc.from('profiles').select('id').eq('email', email).maybeSingle();
  let userId = existente?.id as string | undefined;
  if (!userId) {
    const site = process.env.NEXT_PUBLIC_SITE_URL || '';
    const { data, error } = await svc.auth.admin.inviteUserByEmail(email, { data: { nome }, redirectTo: `${site}/auth/callback?volta=/app` });
    if (error || !data.user) return 'Não foi possível enviar o convite: ' + (error?.message || 'erro desconhecido');
    userId = data.user.id;
  }
  const { error: e2 } = await svc.from('memberships').upsert({ org_id: orgId, user_id: userId, perfil });
  if (e2) return 'Convite enviado, mas não foi possível vincular à empresa: ' + e2.message;
  await svc.from('audit_log').insert({ org_id: orgId, acao: 'pessoa convidada', detalhes: { email, perfil } });
  return null;
}
