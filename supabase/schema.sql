-- =====================================================================
-- SG Engenharias · Plataforma de automações
-- Rode este arquivo inteiro no Supabase (SQL Editor > New query > Run).
-- Depois rode supabase/seed_modulos.sql para carregar o catálogo.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Perfis (1 por usuário) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  nome text default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ---------- Empresas clientes ----------
do $$ begin
  create type public.org_status as enum ('aguardando','implantacao','ativo','suspenso');
exception when duplicate_object then null; end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  marca text,
  cor text not null default '#1A47B8',
  dominio text,
  segmento text,
  whatsapp text,
  plano text not null default 'A definir',
  status public.org_status not null default 'aguardando',
  etapa int not null default 0 check (etapa between 0 and 3),
  mensalidade numeric(12,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  org_id uuid not null references public.organizations on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  perfil text not null default 'Administrador' check (perfil in ('Administrador','Operador','Financeiro')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- liga membros ao perfil (permite listar nome e e-mail da equipe)
do $$ begin
  alter table public.memberships add constraint memberships_user_profile_fk foreign key (user_id) references public.profiles(id) on delete cascade;
exception when duplicate_object then null; end $$;

create or replace function public.is_member(o uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where org_id = o and user_id = auth.uid())
$$;

create or replace function public.is_org_admin(o uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where org_id = o and user_id = auth.uid() and perfil = 'Administrador')
$$;

-- colegas da mesma empresa podem ver nome e e-mail uns dos outros
create or replace function public.shares_org(u uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships a join public.memberships b on a.org_id = b.org_id
                 where a.user_id = auth.uid() and b.user_id = u)
$$;

-- ---------- Catálogo e módulos de cada cliente ----------
create table if not exists public.modules (
  id text primary key,
  nome text not null,
  descricao text not null default '',
  categoria text not null default '',
  complexidade int not null default 1
);

do $$ begin
  create type public.module_status as enum ('solicitado','implantacao','ativo','desligado');
exception when duplicate_object then null; end $$;

create table if not exists public.org_modules (
  org_id uuid not null references public.organizations on delete cascade,
  module_id text not null references public.modules,
  status public.module_status not null default 'solicitado',
  updated_at timestamptz not null default now(),
  primary key (org_id, module_id)
);

-- ---------- Faturas ----------
do $$ begin
  create type public.invoice_status as enum ('pend','pago','atr');
exception when duplicate_object then null; end $$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  numero bigserial,
  org_id uuid not null references public.organizations on delete cascade,
  referencia text not null,
  valor numeric(12,2) not null check (valor >= 0),
  vencimento date not null,
  status public.invoice_status not null default 'pend',
  created_at timestamptz not null default now()
);

-- ---------- Chamados ----------
do $$ begin
  create type public.ticket_status as enum ('aberto','respondido','fechado');
exception when duplicate_object then null; end $$;

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  numero bigserial,
  org_id uuid not null references public.organizations on delete cascade,
  autor uuid references auth.users on delete set null,
  assunto text not null check (char_length(assunto) between 2 and 200),
  mensagem text not null default '' check (char_length(mensagem) <= 5000),
  status public.ticket_status not null default 'aberto',
  resposta text,
  respondido_em timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Pedidos de orçamento vindos do site ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  protocolo text not null,
  nome text not null check (char_length(nome) between 2 and 120),
  empresa text not null check (char_length(empresa) between 1 and 160),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  whatsapp text,
  segmento text,
  porte text,
  descricao text check (char_length(descricao) <= 3000),
  modulos text[] not null default '{}',
  demos text[] not null default '{}',
  consentimento boolean not null,
  status text not null default 'novo' check (status in ('novo','em contato','proposta enviada','fechado','perdido')),
  org_id uuid references public.organizations on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Registro de auditoria ----------
create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  org_id uuid,
  acao text not null,
  detalhes jsonb not null default '{}'
);

-- =====================================================================
-- Regras de acesso (Row Level Security)
-- Cliente só enxerga a própria empresa. A administradora enxerga tudo.
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships   enable row level security;
alter table public.modules       enable row level security;
alter table public.org_modules   enable row level security;
alter table public.invoices      enable row level security;
alter table public.tickets       enable row level security;
alter table public.leads         enable row level security;
alter table public.audit_log     enable row level security;

-- perfis
drop policy if exists "perfil: ver o próprio ou admin" on public.profiles;
create policy "perfil: ver o próprio ou admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin() or public.shares_org(id));
drop policy if exists "perfil: editar o próprio" on public.profiles;
create policy "perfil: editar o próprio" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- ninguém se promove a administradora pelo app: só a coluna nome é editável
revoke update on public.profiles from authenticated, anon;
grant update (nome) on public.profiles to authenticated;

-- empresas
drop policy if exists "empresa: membros e admin leem" on public.organizations;
create policy "empresa: membros e admin leem" on public.organizations for select
  using (public.is_member(id) or public.is_admin());
drop policy if exists "empresa: admin altera" on public.organizations;
create policy "empresa: admin altera" on public.organizations for all
  using (public.is_admin()) with check (public.is_admin());

-- membros
drop policy if exists "membros: colegas e admin leem" on public.memberships;
create policy "membros: colegas e admin leem" on public.memberships for select
  using (public.is_member(org_id) or public.is_admin());
drop policy if exists "membros: admin altera" on public.memberships;
create policy "membros: admin altera" on public.memberships for all
  using (public.is_admin()) with check (public.is_admin());

-- catálogo: leitura pública
drop policy if exists "catálogo: todos leem" on public.modules;
create policy "catálogo: todos leem" on public.modules for select using (true);
drop policy if exists "catálogo: admin altera" on public.modules;
create policy "catálogo: admin altera" on public.modules for all
  using (public.is_admin()) with check (public.is_admin());

-- módulos da empresa: cliente só pode SOLICITAR
drop policy if exists "módulos: membros e admin leem" on public.org_modules;
create policy "módulos: membros e admin leem" on public.org_modules for select
  using (public.is_member(org_id) or public.is_admin());
drop policy if exists "módulos: membro solicita" on public.org_modules;
create policy "módulos: membro solicita" on public.org_modules for insert
  with check (public.is_member(org_id) and status = 'solicitado');
drop policy if exists "módulos: admin altera" on public.org_modules;
create policy "módulos: admin altera" on public.org_modules for all
  using (public.is_admin()) with check (public.is_admin());

-- faturas: cliente só lê
drop policy if exists "faturas: membros e admin leem" on public.invoices;
create policy "faturas: membros e admin leem" on public.invoices for select
  using (public.is_member(org_id) or public.is_admin());
drop policy if exists "faturas: admin altera" on public.invoices;
create policy "faturas: admin altera" on public.invoices for all
  using (public.is_admin()) with check (public.is_admin());

-- chamados: cliente abre; só a admin responde
drop policy if exists "chamados: membros e admin leem" on public.tickets;
create policy "chamados: membros e admin leem" on public.tickets for select
  using (public.is_member(org_id) or public.is_admin());
drop policy if exists "chamados: membro abre" on public.tickets;
create policy "chamados: membro abre" on public.tickets for insert
  with check (public.is_member(org_id) and autor = auth.uid() and status = 'aberto' and resposta is null);
drop policy if exists "chamados: admin altera" on public.tickets;
create policy "chamados: admin altera" on public.tickets for update
  using (public.is_admin()) with check (public.is_admin());

-- pedidos do site: qualquer visitante ENVIA; só a admin LÊ
drop policy if exists "pedidos: visitante envia" on public.leads;
create policy "pedidos: visitante envia" on public.leads for insert to anon, authenticated
  with check (consentimento = true and status = 'novo' and org_id is null);
drop policy if exists "pedidos: admin lê e altera" on public.leads;
create policy "pedidos: admin lê e altera" on public.leads for all
  using (public.is_admin()) with check (public.is_admin());

-- auditoria: só admin
drop policy if exists "auditoria: admin" on public.audit_log;
create policy "auditoria: admin" on public.audit_log for all
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Funções chamadas pelo app (validam permissão por dentro)
-- =====================================================================

-- Cliente recém-cadastrado cria a própria empresa (status aguardando).
create or replace function public.create_organization(p_nome text, p_segmento text, p_whatsapp text, p_modulos text[])
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  if char_length(coalesce(p_nome,'')) < 2 then raise exception 'nome da empresa obrigatório'; end if;
  if exists (select 1 from memberships where user_id = auth.uid()) then
    raise exception 'você já tem uma empresa cadastrada';
  end if;
  insert into organizations (nome, marca, segmento, whatsapp, plano)
    values (p_nome, p_nome, nullif(p_segmento,''), nullif(p_whatsapp,''), case when coalesce(array_length(p_modulos,1),0) > 0 then 'Personalizado' else 'A definir' end)
    returning id into v_org;
  insert into memberships (org_id, user_id, perfil) values (v_org, auth.uid(), 'Administrador');
  insert into org_modules (org_id, module_id, status)
    select v_org, m.id, 'solicitado' from modules m where m.id = any(coalesce(p_modulos,'{}'));
  insert into audit_log (org_id, acao, detalhes) values (v_org, 'empresa criada pelo cliente', jsonb_build_object('nome', p_nome));
  return v_org;
end $$;

-- Administrador da empresa ajusta a identidade visual.
create or replace function public.update_brand(p_org uuid, p_marca text, p_cor text, p_dominio text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_org_admin(p_org) or public.is_admin()) then raise exception 'sem permissão'; end if;
  if p_cor !~ '^#[0-9A-Fa-f]{6}$' then raise exception 'cor inválida'; end if;
  update organizations set marca = left(p_marca, 80), cor = p_cor, dominio = nullif(left(p_dominio, 120), '') where id = p_org;
  insert into audit_log (org_id, acao, detalhes) values (p_org, 'marca atualizada', jsonb_build_object('marca', p_marca, 'cor', p_cor));
end $$;

-- Faturas vencidas viram "atrasada" (rode 1x por dia: Database > Cron, ou pelo app).
create or replace function public.mark_overdue_invoices()
returns int language sql security definer set search_path = public as $$
  with u as (update invoices set status = 'atr' where status = 'pend' and vencimento < current_date returning 1)
  select count(*)::int from u
$$;

grant execute on function public.create_organization(text,text,text,text[]) to authenticated;
grant execute on function public.update_brand(uuid,text,text,text) to authenticated;
revoke execute on function public.mark_overdue_invoices() from anon, authenticated;

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_invoices_org on public.invoices(org_id);
create index if not exists idx_tickets_org on public.tickets(org_id);
create index if not exists idx_leads_created on public.leads(created_at desc);

-- =====================================================================
-- IA de ajustes (liberada por cliente, conforme o plano)
-- =====================================================================
alter table public.organizations add column if not exists ia_habilitada boolean not null default false;
alter table public.organizations add column if not exists ia_limite_mensal int not null default 30 check (ia_limite_mensal between 0 and 10000);
alter table public.organizations add column if not exists config jsonb not null default '{}';
-- chave secreta que as automações (n8n, Make, scripts) usam para ler a configuração do cliente.
-- Fica numa tabela separada que só a administradora lê.
create table if not exists public.org_secrets (
  org_id uuid primary key references public.organizations on delete cascade,
  api_token uuid not null default gen_random_uuid()
);
alter table public.org_secrets enable row level security;
drop policy if exists "segredos: só admin" on public.org_secrets;
create policy "segredos: só admin" on public.org_secrets for all using (public.is_admin()) with check (public.is_admin());
create or replace function public.ensure_org_secret() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into org_secrets (org_id) values (new.id) on conflict do nothing; return new; end $$;
drop trigger if exists on_org_created on public.organizations;
create trigger on_org_created after insert on public.organizations for each row execute function public.ensure_org_secret();
insert into public.org_secrets (org_id) select id from public.organizations on conflict do nothing;

-- O que pode ser ajustado. A IA só mexe nestas chaves, e só nas dos módulos que o cliente tem.
create table if not exists public.config_keys (
  chave text primary key,
  modulo text,               -- null = vale para todos os clientes
  tipo text not null check (tipo in ('texto','inteiro','numero','booleano','opcao','horario')),
  descricao text not null,
  minimo numeric,
  maximo numeric,
  opcoes text[],
  padrao jsonb not null,
  so_admin boolean not null default false
);
alter table public.config_keys enable row level security;
drop policy if exists "config: todos leem" on public.config_keys;
create policy "config: todos leem" on public.config_keys for select using (true);
drop policy if exists "config: admin altera" on public.config_keys;
create policy "config: admin altera" on public.config_keys for all using (public.is_admin()) with check (public.is_admin());

insert into public.config_keys (chave, modulo, tipo, descricao, minimo, maximo, opcoes, padrao, so_admin) values
 ('tom_mensagens', null, 'opcao', 'Tom das mensagens automáticas', null, null, '{formal,próximo,descontraído}', '"próximo"', false),
 ('assinatura_mensagens', null, 'texto', 'Assinatura no fim das mensagens', null, 120, null, '"Equipe {{empresa}}"', false),
 ('horario_inicio_envio', null, 'horario', 'Horário a partir do qual mensagens podem ser enviadas', null, null, null, '"08:00"', false),
 ('horario_fim_envio', null, 'horario', 'Horário limite para envio de mensagens', null, null, null, '"20:00"', false),
 ('enviar_fim_de_semana', null, 'booleano', 'Enviar mensagens automáticas aos sábados e domingos', null, null, null, 'false', false),
 ('cobranca_dias_antes', 'A-04', 'inteiro', 'Dias antes do vencimento para o primeiro lembrete de cobrança', 0, 15, null, '3', false),
 ('cobranca_intervalo_dias', 'A-04', 'inteiro', 'Intervalo em dias entre lembretes depois do vencimento', 1, 15, null, '3', false),
 ('cobranca_max_lembretes', 'A-04', 'inteiro', 'Número máximo de lembretes depois do vencimento', 1, 10, null, '4', false),
 ('texto_lembrete_cobranca', 'A-04', 'texto', 'Texto do lembrete de cobrança ({{nome}}, {{valor}}, {{vencimento}}, {{link}})', null, 600, null, '"Olá, {{nome}}! Sua fatura de {{valor}} vence em {{vencimento}}. Pague por aqui: {{link}}"', false),
 ('mensagem_boas_vindas', 'D-01', 'texto', 'Primeira mensagem do atendimento no WhatsApp', null, 600, null, '"Olá! Como podemos ajudar?"', false),
 ('horario_atendimento_humano', 'D-04', 'texto', 'Horário em que há pessoas para atender', null, 120, null, '"Segunda a sexta, das 8h às 18h"', false),
 ('confirmacao_horas_antes', 'D-06', 'inteiro', 'Horas antes do compromisso para pedir confirmação', 2, 72, null, '24', false),
 ('nps_nota_alerta', 'D-07', 'inteiro', 'Nota de satisfação igual ou abaixo da qual o gestor é avisado', 0, 10, null, '6', false),
 ('menu_negocios_texto', 'D-09', 'texto', 'Mensagem do menu quando não dá para saber o negócio', null, 400, null, '"Olá! Com qual das nossas empresas você quer falar?"', false),
 ('followup_dias', 'C-04', 'inteiro', 'Dias sem resposta até o follow-up automático', 1, 30, null, '2', false),
 ('alcada_aprovacao_valor', 'B-02', 'numero', 'Valor em R$ acima do qual o pedido precisa de aprovação do gestor', 0, 1000000, null, '2000', false),
 ('aluguel_dias_antes', 'H-06', 'inteiro', 'Dias antes do vencimento do aluguel para enviar o boleto/Pix', 0, 15, null, '5', false),
 ('texto_lembrete_aluguel', 'H-06', 'texto', 'Texto do lembrete de aluguel ({{nome}}, {{imovel}}, {{valor}}, {{vencimento}})', null, 600, null, '"Olá, {{nome}}! O aluguel de {{imovel}} ({{valor}}) vence em {{vencimento}}."', false),
 ('assembleia_dias_antes', 'J-04', 'inteiro', 'Dias antes da assembleia para avisar o consorciado', 1, 15, null, '5', false),
 ('relatorio_dia_semana', 'V-03', 'opcao', 'Dia da semana em que o relatório financeiro é enviado', null, null, '{segunda,terça,quarta,quinta,sexta}', '"segunda"', false)
on conflict (chave) do update set modulo = excluded.modulo, tipo = excluded.tipo, descricao = excluded.descricao, minimo = excluded.minimo, maximo = excluded.maximo, opcoes = excluded.opcoes, padrao = excluded.padrao;

do $$ begin
  create type public.ai_change_status as enum ('proposta','aplicada','recusada','desfeita');
exception when duplicate_object then null; end $$;

create table if not exists public.ai_changes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations on delete cascade,
  autor uuid references auth.users on delete set null,
  origem text not null check (origem in ('cliente','admin')),
  pedido text not null check (char_length(pedido) <= 2000),
  resumo text not null default '',
  mudancas jsonb not null,           -- [{chave, antes, depois}]
  status public.ai_change_status not null default 'proposta',
  created_at timestamptz not null default now(),
  aplicada_em timestamptz
);
alter table public.ai_changes enable row level security;
drop policy if exists "ia: membros e admin leem" on public.ai_changes;
create policy "ia: membros e admin leem" on public.ai_changes for select using (public.is_member(org_id) or public.is_admin());
-- escrita só pelas funções abaixo
create index if not exists idx_ai_changes_org on public.ai_changes(org_id, created_at desc);

-- Valida um valor contra a definição da chave. Retorna null se inválido.
create or replace function public.valida_config(k public.config_keys, v jsonb)
returns jsonb language plpgsql immutable as $$
begin
  if k.tipo = 'texto' then
    if jsonb_typeof(v) <> 'string' or char_length(v #>> '{}') > coalesce(k.maximo, 600) then return null; end if;
  elsif k.tipo in ('inteiro','numero') then
    if jsonb_typeof(v) <> 'number' then return null; end if;
    if k.tipo = 'inteiro' and (v #>> '{}')::numeric <> trunc((v #>> '{}')::numeric) then return null; end if;
    if (k.minimo is not null and (v #>> '{}')::numeric < k.minimo) or (k.maximo is not null and (v #>> '{}')::numeric > k.maximo) then return null; end if;
  elsif k.tipo = 'booleano' then
    if jsonb_typeof(v) <> 'boolean' then return null; end if;
  elsif k.tipo = 'opcao' then
    if jsonb_typeof(v) <> 'string' or not ((v #>> '{}') = any(k.opcoes)) then return null; end if;
  elsif k.tipo = 'horario' then
    if jsonb_typeof(v) <> 'string' or (v #>> '{}') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then return null; end if;
  end if;
  return v;
end $$;

-- Registra uma proposta da IA (não aplica). Checa permissão, plano, limite do mês e cada chave.
create or replace function public.propose_ai_change(p_org uuid, p_pedido text, p_resumo text, p_mudancas jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_admin boolean := public.is_admin();
  v_org organizations;
  v_usadas int;
  v_item jsonb;
  v_key config_keys;
  v_val jsonb;
  v_out jsonb := '[]';
  v_id uuid;
begin
  if not (v_admin or public.is_member(p_org)) then raise exception 'sem permissão'; end if;
  select * into v_org from organizations where id = p_org;
  if not v_admin then
    if not v_org.ia_habilitada then raise exception 'IA não incluída no plano deste cliente'; end if;
    select count(*) into v_usadas from ai_changes where org_id = p_org and origem = 'cliente' and created_at >= date_trunc('month', now());
    if v_usadas >= v_org.ia_limite_mensal then raise exception 'limite de ajustes com IA do mês atingido'; end if;
  end if;
  if jsonb_typeof(p_mudancas) <> 'array' or jsonb_array_length(p_mudancas) = 0 or jsonb_array_length(p_mudancas) > 10 then
    raise exception 'nenhuma mudança válida';
  end if;
  for v_item in select * from jsonb_array_elements(p_mudancas) loop
    select * into v_key from config_keys where chave = v_item->>'chave';
    if not found then raise exception 'ajuste não permitido: %', v_item->>'chave'; end if;
    if v_key.so_admin and not v_admin then raise exception 'ajuste reservado à SG: %', v_key.chave; end if;
    if v_key.modulo is not null and not exists (select 1 from org_modules where org_id = p_org and module_id = v_key.modulo and status in ('ativo','implantacao')) then
      raise exception 'o cliente não tem o módulo % para o ajuste %', v_key.modulo, v_key.chave;
    end if;
    v_val := public.valida_config(v_key, v_item->'valor');
    if v_val is null then raise exception 'valor inválido para %', v_key.chave; end if;
    v_out := v_out || jsonb_build_object('chave', v_key.chave, 'descricao', v_key.descricao,
      'antes', coalesce(v_org.config->v_key.chave, v_key.padrao), 'depois', v_val);
  end loop;
  insert into ai_changes (org_id, autor, origem, pedido, resumo, mudancas)
    values (p_org, auth.uid(), case when v_admin then 'admin' else 'cliente' end, left(p_pedido, 2000), left(coalesce(p_resumo,''), 500), v_out)
    returning id into v_id;
  return v_id;
end $$;

-- Aplica, recusa ou desfaz uma proposta.
create or replace function public.decide_ai_change(p_id uuid, p_acao text)
returns void language plpgsql security definer set search_path = public as $$
declare c ai_changes; v_patch jsonb := '{}'; v_item jsonb;
begin
  select * into c from ai_changes where id = p_id for update;
  if not found or not (public.is_admin() or public.is_member(c.org_id)) then raise exception 'sem permissão'; end if;
  if p_acao = 'aplicar' and c.status = 'proposta' then
    for v_item in select * from jsonb_array_elements(c.mudancas) loop v_patch := v_patch || jsonb_build_object(v_item->>'chave', v_item->'depois'); end loop;
    update organizations set config = config || v_patch where id = c.org_id;
    update ai_changes set status = 'aplicada', aplicada_em = now() where id = p_id;
  elsif p_acao = 'recusar' and c.status = 'proposta' then
    update ai_changes set status = 'recusada' where id = p_id;
  elsif p_acao = 'desfazer' and c.status = 'aplicada' then
    for v_item in select * from jsonb_array_elements(c.mudancas) loop v_patch := v_patch || jsonb_build_object(v_item->>'chave', v_item->'antes'); end loop;
    update organizations set config = config || v_patch where id = c.org_id;
    update ai_changes set status = 'desfeita' where id = p_id;
  else
    raise exception 'ação inválida para esta proposta';
  end if;
  insert into audit_log (org_id, acao, detalhes) values (c.org_id, 'ajuste com IA: ' || p_acao, jsonb_build_object('id', p_id, 'mudancas', c.mudancas));
end $$;

grant execute on function public.propose_ai_change(uuid,text,text,jsonb) to authenticated;
grant execute on function public.decide_ai_change(uuid,text) to authenticated;

-- =====================================================================
-- Plano e cobrança personalizados por cliente
-- =====================================================================
alter table public.organizations add column if not exists cpf_cnpj text;
alter table public.organizations add column if not exists email_cobranca text;
alter table public.organizations add column if not exists mensalidade_ativa boolean not null default false;
alter table public.organizations add column if not exists dia_vencimento int not null default 10 check (dia_vencimento between 1 and 28);
alter table public.organizations add column if not exists cobranca_inicio date;

-- Itens do plano: pacote/implantação (único, em parcelas) e extras personalizados (únicos ou mensais)
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations on delete cascade,
  descricao text not null check (char_length(descricao) between 2 and 160),
  tipo text not null check (tipo in ('unico','mensal')),
  valor numeric(12,2) not null check (valor >= 0),
  parcelas int not null default 1 check (parcelas between 1 and 24),
  primeiro_vencimento date,
  cobrado boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.plan_items enable row level security;
drop policy if exists "plano: membros e admin leem" on public.plan_items;
create policy "plano: membros e admin leem" on public.plan_items for select using (public.is_member(org_id) or public.is_admin());
drop policy if exists "plano: admin altera" on public.plan_items;
create policy "plano: admin altera" on public.plan_items for all using (public.is_admin()) with check (public.is_admin());

alter table public.invoices add column if not exists item_id uuid references public.plan_items on delete set null;

-- =====================================================================
-- Pagamento pela Stripe (Pix, cartão e boleto)
-- Cada fatura tem um link de pagamento permanente: /pagar/<pay_token>
-- =====================================================================
alter table public.invoices add column if not exists pay_token uuid not null default gen_random_uuid();
create unique index if not exists idx_invoices_pay_token on public.invoices(pay_token);
alter table public.invoices add column if not exists stripe_session_id text;
alter table public.invoices add column if not exists pago_em timestamptz;
alter table public.invoices add column if not exists forma_pagamento text;
