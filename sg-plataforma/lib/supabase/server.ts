import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/** Cliente do Supabase no servidor, agindo como o usuário logado (respeita as regras de acesso). */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(list) {
        try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* chamado de um Server Component: o middleware renova a sessão */ }
      }
    }
  });
}

/** Cliente com a chave de serviço. Só para convites por e-mail, sempre depois de checar permissão. */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Configure SUPABASE_SERVICE_ROLE_KEY para enviar convites.');
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
