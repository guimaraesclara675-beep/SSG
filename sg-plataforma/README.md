# SG Engenharias · Plataforma

Site (vitrine com catálogo e demonstrações), área do cliente, painel da administradora e IA de ajustes.

- **Vitrine**: `/` (arquivo `public/vitrine.html`). Pedidos de orçamento vão para o banco e aparecem em **Painel › Pedidos**.
- **Área do cliente**: `/app` (início, módulos, ajustes com IA, faturas, suporte, equipe, marca).
- **Painel da administradora**: `/admin` (visão geral, clientes, pedidos, implantações, financeiro, chamados).
- **Login**: código por e-mail ou Google. Sem senha.
- **Segurança**: cada cliente só enxerga a própria empresa (regras de acesso no banco). Só a administradora vê pedidos, todos os clientes e as chaves das automações.

## Publicar (cerca de 30 minutos, tudo com planos gratuitos para começar)

### 1. Banco de dados e login (Supabase)
1. Crie uma conta em supabase.com e um projeto novo. **Região: South America (São Paulo)**.
2. Em **SQL Editor › New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Faça o mesmo com `supabase/seed_modulos.sql` (carrega os 215 módulos do catálogo).
4. Em **Authentication › Email Templates › Magic Link**, troque o texto para incluir o código:
   `Seu código de acesso à SG Engenharias é: {{ .Token }}`
5. (Opcional) Login com Google: **Authentication › Providers › Google**, siga o passo a passo do Supabase.
6. Em **Project Settings › API**, copie a *Project URL*, a chave *anon* e a chave *service_role*.

### 2. Site (Vercel)
1. Suba esta pasta para um repositório no GitHub.
2. Em vercel.com, **Add New › Project**, escolha o repositório.
3. Em **Environment Variables**, preencha as variáveis do arquivo `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ex.: `https://app.sgengenharias.com`)
   - `NEXT_PUBLIC_WHATSAPP=5511915471870`
   - `ANTHROPIC_API_KEY` (para a IA de ajustes; crie em console.anthropic.com) e, se quiser, `ANTHROPIC_MODEL`
   - `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` (pagamentos; veja a seção da Stripe)
4. Clique em **Deploy**.
5. No Supabase, em **Authentication › URL Configuration**, coloque o endereço do site em *Site URL* e adicione `https://SEU-SITE/auth/callback` em *Redirect URLs*.

### 3. Virar administradora
1. Abra o site, clique em **Criar conta** e entre com o seu e-mail.
2. No Supabase, **SQL Editor**, rode (com o seu e-mail):
   ```sql
   update public.profiles set is_admin = true where email = 'seu@email.com';
   ```
3. Acesse `/admin`.

### 4. Endereço próprio
Na Vercel, **Settings › Domains**, adicione `app.sgengenharias.com` e crie o registro CNAME que ela indicar no seu provedor de domínio.

## Aprovação de cadastro
Quem cria conta pelo site entra numa tela de **Cadastro em análise** e não acessa nada até você aprovar. No painel, o cadastro aparece em **Visão geral** e em **Clientes** como *Aguardando ativação*; na ficha, clique em **Aprovar cadastro**. Clientes que você mesma cria (ou converte de um pedido) já entram aprovados.

## Visual + processos
O catálogo inclui serviços de marca e site (identidade visual, site institucional, landing page, redesign, kit para redes sociais e site integrado aos processos) e o pacote **Transformação completa: visual + processos**. No pedido de orçamento, o cliente pode marcar que quer melhorar também o visual da empresa; isso chega no seu WhatsApp e no pedido do painel.

## Como o dia a dia funciona
1. Cliente pede orçamento no site → aparece em **Pedidos** (e ele também pode mandar pelo WhatsApp).
2. Você clica em **Converter em cliente** → a empresa é criada e o contato recebe o convite por e-mail.
3. Ou o cliente cria a conta sozinho → aparece em **Clientes** como *Aguardando ativação*.
4. Você aplica um kit ou módulos, define a mensalidade e move a implantação de etapa. O cliente acompanha tudo na área dele.
5. Faturas: configure o plano na ficha do cliente e gere as cobranças; as mensalidades saem pelo Financeiro. Envie pelo WhatsApp e marque como paga quando receber.
6. Chamados abertos pelo cliente chegam em **Chamados**; a resposta aparece na área dele.

## IA de ajustes
- Ligue por cliente em **Clientes › ficha › IA de ajustes liberada** e defina o limite mensal (conforme o plano).
- O cliente escreve o pedido em português; a IA propõe as mudanças (antes → depois) e **só aplica com aprovação**. Tudo fica no histórico e pode ser desfeito.
- A IA só altera as chaves da tabela `config_keys` (prazos, horários, textos, tom), apenas dos módulos que o cliente tem. Para liberar novos ajustes, inclua linhas nessa tabela.
- Você usa a mesma IA na ficha de qualquer cliente, mesmo sem a IA no plano dele.

## Plano e cobrança de cada cliente
Na ficha do cliente (**Clientes › cliente › Plano e cobrança**) você define tudo por cliente:
- **Mensalidade**: liga ou desliga, valor e dia do vencimento (e a partir de quando cobrar).
- **Itens do plano**:
  - *Pagamento único* (compra do pacote, implantação, uma personalização), com número de parcelas e 1º vencimento;
  - *Mensal* (um extra personalizado que soma à mensalidade).
- **Gerar cobranças dos itens a faturar** cria as faturas (com as parcelas). As mensalidades saem em **Financeiro › Gerar mensalidades do próximo mês**, já somando os itens mensais.
- Cada fatura tem **Enviar no WhatsApp**, que abre a conversa com o cliente já com o valor e o vencimento.
- O cliente vê o plano e as faturas em **Faturas**, na área dele.

## Pagamentos com a Stripe (Pix, cartão e boleto)
Cada fatura ganha um **link de pagamento permanente** (`/pagar/...`). Quando o cliente abre, o sistema cria na hora o checkout da Stripe, então o link enviado pelo WhatsApp não expira. Quando o pagamento é confirmado, a Stripe avisa o sistema, que **verifica a assinatura do aviso** e marca a fatura como paga sozinha.

1. Crie a conta em stripe.com com o **CNPJ da SG** (o dinheiro cai na conta bancária cadastrada lá).
2. Em **Configurações › Formas de pagamento**, ative **Pix**, **Cartões** e **Boleto** (o Pix depende de aprovação da Stripe para a sua conta).
3. Em **Desenvolvedores › Chaves de API**, copie a chave secreta (`sk_live_...`) para `STRIPE_SECRET_KEY` na Vercel.
4. Em **Desenvolvedores › Webhooks**, adicione o endpoint `https://SEU-SITE/api/stripe/webhook` com os eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded` e `checkout.session.async_payment_failed`. Copie o *segredo de assinatura* (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.
5. Teste primeiro com as chaves de teste (`sk_test_...`) e um cartão de teste da Stripe; depois troque pelas chaves reais.

Como fica no dia a dia:
- **Seu painel:** cada fatura tem **Enviar no WhatsApp** (a mensagem já leva o link de pagamento) e **Link de pagamento**. Quando o cliente paga, a fatura vira *Paga* e mostra a forma usada.
- **Área do cliente:** cada fatura em aberto tem o botão **Pagar**.
- **Onde o dinheiro cai:** no saldo da sua conta Stripe, que transfere automaticamente para a sua conta bancária no prazo da Stripe para cada forma de pagamento. As taxas são as da tabela da Stripe.
- Pix na Stripe é só para pagamentos avulsos (o Pix Automático não está disponível), o que funciona bem aqui porque cada mensalidade vira uma fatura própria.
- Sem as chaves da Stripe, o sistema volta a funcionar no modo manual: botão **Combinar pagamento** no WhatsApp e **Marcar como paga** no painel.

## Ligar as automações à configuração
Cada cliente tem uma chave (aparece na ficha dele, em *Ajustar este cliente com IA*). As automações (n8n, Make ou scripts) leem a configuração atual assim:
```
GET https://SEU-SITE/api/config
Authorization: Bearer <chave do cliente>
```
Resposta: `{ empresa, modulos_ativos, config: { cobranca_dias_antes: 3, ... } }`. Assim, quando o cliente ajusta algo com a IA, a automação passa a usar o novo valor na próxima execução.

## Rodar no computador
```
npm install
cp .env.example .env.local   # e preencha
npm run dev
```

## O que ainda falta para produção
- Fazer um pagamento real de valor baixo pela Stripe antes de enviar aos clientes.
- Envio real de WhatsApp: API oficial da Meta ou um parceiro oficial.
- Rotina diária para `mark_overdue_invoices()` (Supabase › Database › Cron) e backups do plano pago do Supabase.
- Revisão jurídica do termo de uso, da política de privacidade e do contrato de tratamento de dados (LGPD).
