'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function criarEmpresa(form: FormData) {
  const supabase = createClient();
  const nome = String(form.get('nome') || '').trim();
  const modulos = String(form.get('modulos') || '').split(',').filter(Boolean);
  const { error } = await supabase.rpc('create_organization', {
    p_nome: nome, p_segmento: String(form.get('segmento') || ''), p_whatsapp: String(form.get('whatsapp') || ''), p_modulos: modulos
  });
  if (error) redirect('/bem-vindo?erro=' + encodeURIComponent('Não foi possível criar a empresa: ' + error.message));
  redirect('/app');
}
