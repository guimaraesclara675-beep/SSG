import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * As automações (n8n, Make, scripts) leem aqui a configuração do cliente.
 * Envie o cabeçalho: Authorization: Bearer <token do cliente> (fica no painel da administradora).
 */
export async function GET(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ erro: 'token ausente' }, { status: 401 });
  const svc = createServiceClient();
  const { data: sec } = await svc.from('org_secrets').select('org_id').eq('api_token', token).maybeSingle();
  if (!sec) return NextResponse.json({ erro: 'token inválido' }, { status: 401 });
  const [{ data: org }, { data: keys }, { data: mods }] = await Promise.all([
    svc.from('organizations').select('id,nome,marca,status,config').eq('id', sec.org_id).single(),
    svc.from('config_keys').select('chave,modulo,padrao'),
    svc.from('org_modules').select('module_id,status').eq('org_id', sec.org_id)
  ]);
  if (!org || org.status === 'suspenso') return NextResponse.json({ erro: 'cliente suspenso' }, { status: 403 });
  const ativos = (mods || []).filter(m => m.status === 'ativo').map(m => m.module_id);
  const config: Record<string, unknown> = {};
  (keys || []).filter(k => !k.modulo || ativos.includes(k.modulo)).forEach(k => { config[k.chave] = k.chave in (org.config || {}) ? org.config[k.chave] : k.padrao; });
  return NextResponse.json({ empresa: org.marca || org.nome, modulos_ativos: ativos, config }, { headers: { 'cache-control': 'no-store' } });
}
