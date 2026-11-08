import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Cta, PublicPage } from '@/components/PublicPage';
import { CIDADES, FAQ, SEGMENTOS, SITE } from '@/lib/seo';

// Renderizada sob demanda: o cache de páginas pré-geradas não é usado no Cloudflare.

export async function generateMetadata({ params }: { params: Promise<{ cidade: string }> }): Promise<Metadata> {
  const { cidade } = await params;
  const c = CIDADES.find(x => x.slug === cidade);
  if (!c) return {};
  const url = `${SITE.url}/automacao-empresas/${c.slug}`;
  const titulo = `Automação de processos para empresas em ${c.nome}`;
  return {
    title: `${titulo} | SG Engenharias`,
    description: `Automação de WhatsApp, cobrança, CRM, agendamentos e rotinas administrativas para empresas de ${c.nome}. Soluções sob medida da SG Engenharias.`,
    alternates: { canonical: url },
    openGraph: { title: titulo, url, siteName: SITE.nome, locale: 'pt_BR', type: 'website' }
  };
}

export default async function CidadePage({ params }: { params: Promise<{ cidade: string }> }) {
  const { cidade } = await params;
  const c = CIDADES.find(x => x.slug === cidade);
  if (!c) notFound();
  const url = `${SITE.url}/automacao-empresas/${c.slug}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Automação de processos para empresas em ${c.nome}`,
      serviceType: 'Automação de processos empresariais',
      url,
      provider: { '@type': 'ProfessionalService', name: SITE.nome, url: SITE.url },
      areaServed: { '@type': 'City', name: c.nome }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'SG Engenharias', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: `Automação em ${c.nome}`, item: url }
      ]
    }
  ];

  return (
    <PublicPage jsonLd={jsonLd}>
      <section className="pub-hero">
        <div className="pub-wrap">
          <p className="pub-eyebrow">Automação empresarial em {c.nome}</p>
          <h1>Automação de processos para empresas em {c.nome}</h1>
          <p className="pub-lead">
            A SG Engenharias automatiza as tarefas repetitivas de empresas de {c.nome}: atendimento no WhatsApp,
            cobrança e lembretes de pagamento, agendamentos, CRM e relatórios. Cada solução é montada para a rotina da sua equipe.
          </p>
        </div>
      </section>

      <section className="pub-sec">
        <div className="pub-wrap">
          <h2>O que mais automatizamos</h2>
          <div className="pub-cards">
            <article className="pub-card"><h3>WhatsApp que responde sozinho</h3><p>Primeiro atendimento, perguntas frequentes, agendamento e encaminhamento para a pessoa certa, 24 horas por dia.</p></article>
            <article className="pub-card"><h3>Cobrança sem constrangimento</h3><p>Boleto ou Pix enviado no prazo, lembretes antes e depois do vencimento e baixa automática quando o cliente paga.</p></article>
            <article className="pub-card"><h3>Vendas organizadas</h3><p>CRM com funil, follow-up automático e aviso quando um cliente some, para nenhum contato ficar sem resposta.</p></article>
            <article className="pub-card"><h3>Rotina administrativa</h3><p>Relatórios, documentos e conferências que hoje são feitos à mão passam a acontecer sozinhos.</p></article>
          </div>
        </div>
      </section>

      <section className="pub-sec pub-alt">
        <div className="pub-wrap">
          <h2>Soluções por segmento em {c.nome}</h2>
          <div className="pub-links">
            {SEGMENTOS.map(s => (
              <Link key={s.slug} href={`/automacao/${s.slug}`} className="pub-link-card">
                <b>{s.titulo}</b><span>{s.resumo}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-sec">
        <div className="pub-wrap">
          <h2>Perguntas frequentes</h2>
          <div className="pub-faq">
            {FAQ.slice(0, 5).map(f => (
              <details key={f.p}><summary>{f.p}</summary><p>{f.r}</p></details>
            ))}
          </div>
        </div>
      </section>

      <Cta texto={`Olá, SG Engenharias! Tenho uma empresa em ${c.nome} e quero automatizar processos.`} />
    </PublicPage>
  );
}
