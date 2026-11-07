import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Cta, PublicPage } from '@/components/PublicPage';
import { CIDADES, FAQ, SEGMENTOS, SITE } from '@/lib/seo';

// Renderizada sob demanda: o cache de páginas pré-geradas não é usado no Cloudflare.

export async function generateMetadata({ params }: { params: Promise<{ segmento: string }> }): Promise<Metadata> {
  const { segmento } = await params;
  const s = SEGMENTOS.find(x => x.slug === segmento);
  if (!s) return {};
  const url = `${SITE.url}/automacao/${s.slug}`;
  return {
    title: `${s.titulo} | SG Engenharias`,
    description: `${s.resumo} Automação sob medida para ${s.nome.toLowerCase()} em ${SITE.regiao}: WhatsApp, cobrança, agenda e relatórios.`,
    alternates: { canonical: url },
    openGraph: { title: s.titulo, description: s.resumo, url, siteName: SITE.nome, locale: 'pt_BR', type: 'website' }
  };
}

export default async function SegmentoPage({ params }: { params: Promise<{ segmento: string }> }) {
  const { segmento } = await params;
  const s = SEGMENTOS.find(x => x.slug === segmento);
  if (!s) notFound();
  const url = `${SITE.url}/automacao/${s.slug}`;
  const perguntas = FAQ.slice(1, 6);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.titulo,
      serviceType: 'Automação de processos empresariais',
      description: s.resumo,
      url,
      provider: { '@type': 'ProfessionalService', name: SITE.nome, url: SITE.url },
      areaServed: CIDADES.map(c => ({ '@type': 'City', name: c.nome })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `Automações para ${s.nome.toLowerCase()}`,
        itemListElement: s.modulos.map(m => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: m.nome, description: m.desc } }))
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'SG Engenharias', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: s.titulo, item: url }
      ]
    }
  ];

  return (
    <PublicPage jsonLd={jsonLd}>
      <section className="pub-hero">
        <div className="pub-wrap">
          <p className="pub-eyebrow">Soluções para {s.nome.toLowerCase()}</p>
          <h1>{s.titulo}</h1>
          <p className="pub-lead">{s.resumo}</p>
          <ul className="pub-pains">{s.dores.map(d => <li key={d}><span>Hoje</span>{d}</li>)}</ul>
        </div>
      </section>

      <section className="pub-sec">
        <div className="pub-wrap">
          <h2>O que dá para automatizar em {s.nome.toLowerCase()}</h2>
          <div className="pub-cards">
            {s.modulos.map(m => (
              <article key={m.id} className="pub-card">
                <h3>{m.nome}</h3>
                <p>{m.desc}</p>
              </article>
            ))}
          </div>
          <p className="pub-note">
            Essas automações podem ser combinadas entre si e com módulos de WhatsApp, cobrança, CRM e relatórios.{' '}
            <Link href={`/#${s.slug}`}>Ver demonstrações e faixas de investimento no catálogo</Link>.
          </p>
        </div>
      </section>

      <section className="pub-sec pub-alt">
        <div className="pub-wrap">
          <h2>Como funciona</h2>
          <ol className="pub-steps">
            <li><b>Conversa rápida</b>Você conta a rotina e onde a equipe perde tempo.</li>
            <li><b>Proposta sob medida</b>Escolhemos as automações certas e combinamos valor e prazo.</li>
            <li><b>Implantação</b>Configuramos com os dados da sua empresa e testamos com a equipe.</li>
            <li><b>Acompanhamento</b>Você acompanha tudo pela área do cliente e pede ajustes quando precisar.</li>
          </ol>
        </div>
      </section>

      <section className="pub-sec">
        <div className="pub-wrap">
          <h2>Perguntas frequentes</h2>
          <div className="pub-faq">
            {perguntas.map(f => (
              <details key={f.p}><summary>{f.p}</summary><p>{f.r}</p></details>
            ))}
          </div>
          <p className="pub-note">
            Atendemos {s.nome.toLowerCase()} em{' '}
            {CIDADES.map((c, i) => (
              <span key={c.slug}>{i ? (i === CIDADES.length - 1 ? ' e ' : ', ') : ''}<Link href={`/automacao-empresas/${c.slug}`}>{c.nome}</Link></span>
            ))}{' '}
            e em outras cidades, com atendimento pelo WhatsApp e por videochamada.
          </p>
        </div>
      </section>

      <Cta texto={`Olá, SG Engenharias! Tenho ${s.nome.toLowerCase()} e quero entender como automatizar.`} />
    </PublicPage>
  );
}
