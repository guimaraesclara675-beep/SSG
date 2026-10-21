import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null } as const;
  const { data: profile } = await supabase.from('profiles').select('id,email,nome,is_admin').eq('id', user.id).single();
  return { supabase, user, profile } as const;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s.user) redirect('/entrar?volta=/admin');
  if (!s.profile?.is_admin) redirect('/app');
  return s;
}

/** Empresa do cliente logado. Sem empresa ainda: vai para o cadastro. */
export async function requireClient(opts: { permitirPendente?: boolean } = {}) {
  const s = await getSession();
  if (!s.user) redirect('/entrar?volta=/app');
  const { data: m } = await s.supabase.from('memberships').select('perfil, organizations(*)').eq('user_id', s.user.id).limit(1).maybeSingle();
  if (!m?.organizations) {
    if (s.profile?.is_admin) redirect('/admin');
    redirect('/bem-vindo');
  }
  const org = m.organizations as unknown as Org;
  // Cadastro novo só entra depois que a SG aprova no painel.
  if (org.status === 'aguardando' && !opts.permitirPendente) redirect('/app/analise');
  return { ...s, org, perfil: m.perfil as string };
}

export type Org = {
  id: string; nome: string; marca: string | null; cor: string; dominio: string | null; segmento: string | null; whatsapp: string | null;
  plano: string; status: 'aguardando' | 'implantacao' | 'ativo' | 'suspenso'; etapa: number; mensalidade: number; observacoes: string | null; created_at: string;
};
