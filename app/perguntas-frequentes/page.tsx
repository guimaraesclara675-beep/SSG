import type { Metadata } from 'next';
import { Cta, PublicPage } from '@/components/PublicPage';
import { FAQ, SITE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Perguntas frequentes sobre automação empresarial | SG Engenharias',
  description: 'Tire dúvidas sobre automação de WhatsApp, cobrança, CRM e processos: o que dá para automatizar, custos, prazos, segurança e cidades atendidas.',
  alternates: { canonical: `${SITE.url}/perguntas-frequentes` }
};

export default function PerguntasPage() {
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } }))
  }];
  return (
    <PublicPage jsonLd={jsonLd}>
      <section className="pub-hero">
        <div className="pub-wrap">
          <p className="pub-eyebrow">Perguntas frequentes</p>
          <h1>Dúvidas sobre automação empresarial</h1>
          <p className="pub-lead">O que dá para automatizar, quanto custa, quanto tempo leva e como a SG Engenharias trabalha.</p>
        </div>
      </section>
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-faq">
            {FAQ.map(f => (
              <details key={f.p} open><summary>{f.p}</summary><p>{f.r}</p></details>
            ))}
          </div>
        </div>
      </section>
      <Cta texto="Olá, SG Engenharias! Tenho uma dúvida sobre automação." />
    </PublicPage>
  );
}
