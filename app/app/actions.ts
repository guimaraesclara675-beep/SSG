'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth';
import { convidar } from '@/lib/invite';

export async function solicitarModulo(form: FormData) {
  const { supabase, org } = await requireClient();
  const id = String(form.get('modulo') || '').slice(0, 4);
  if (!/^[A-Z]-\d\d$/.test(id)) redirect('/app/modulos?erro=Escolha um módulo da lista');
  const { error } = await supabase.from('org_modules').insert({ org_id: org.id, module_id: id, status: 'solicitado' });
  revalidatePath('/app/modulos');
  redirect('/app/modulos?' + (error ? 'erro=Esse módulo já está na sua conta' : 'ok=Solicitação enviada para a SG'));
}

export async function abrirChamado(form: FormData) {
  const { supabase, org, user } = await requireClient();
  const assunto = String(form.get('assunto') || '').trim().slice(0, 200);
  const mensagem = String(form.get('mensagem') || '').trim().slice(0, 5000);
  if (assunto.length < 2) redirect('/app/suporte?erro=Escreva o assunto');
  const { error } = await supabase.from('tickets').insert({ org_id: org.id, autor: user!.id, assunto, mensagem, status: 'aberto' });
  revalidatePath('/app/suporte');
  redirect('/app/suporte?' + (error ? 'erro=Não foi possível abrir o chamado' : 'ok=Chamado aberto. A SG responde por aqui.'));
}

export async function salvarMarca(form: FormData) {
  const { supabase, org } = await requireClient();
  const { error } = await supabase.rpc('update_brand', {
    p_org: org.id, p_marca: String(form.get('marca') || ''), p_cor: String(form.get('cor') || '#1A47B8'), p_dominio: String(form.get('dominio') || '')
  });
  revalidatePath('/app', 'layout');
  redirect('/app/marca?' + (error ? 'erro=' + encodeURIComponent(error.message) : 'ok=Identidade salva'));
}

export async function convidarPessoa(form: FormData) {
  const { org, perfil } = await requireClient();
  if (perfil !== 'Administrador') redirect('/app/equipe?erro=Só administradores da empresa convidam pessoas');
  const email = String(form.get('email') || '').trim().toLowerCase();
  const nome = String(form.get('nome') || '').trim();
  const papel = ['Operador', 'Financeiro', 'Administrador'].includes(String(form.get('perfil'))) ? String(form.get('perfil')) : 'Operador';
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect('/app/equipe?erro=Digite um e-mail válido');
  const r = await convidar(email, nome, org.id, papel);
  revalidatePath('/app/equipe');
  redirect('/app/equipe?' + (r ? 'erro=' + encodeURIComponent(r) : 'ok=Convite enviado por e-mail'));
}

