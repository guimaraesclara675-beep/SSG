import Link from 'next/link';
import { CIDADES, SEGMENTOS, SITE, waLink } from '@/lib/seo';

/** Moldura das páginas públicas (serviços, cidades e perguntas frequentes). */
export function PublicPage({ children, jsonLd }: { children: React.ReactNode; jsonLd?: object[] }) {
  return (
    <div className="pub">
      {jsonLd?.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <header className="pub-top">
        <div className="pub-wrap pub-top-in">
          <Link href="/" className="pub-brand" aria-label="SG Engenharias, página inicial">
            <img src="/logo-sg.png" alt="" width={36} height={36} />
            <span><b>SG Engenharias</b><small>Automação empresarial</small></span>
          </Link>
          <nav className="pub-nav">
            <Link href="/">Catálogo</Link>
            <Link href="/perguntas-frequentes">Perguntas</Link>
            <Link href="/entrar">Área do cliente</Link>
            <a className="btn btn-gold btn-sm" href={waLink('Olá, SG Engenharias! Quero automatizar minha empresa.')} target="_blank" rel="noopener">WhatsApp</a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="pub-foot">
        <div className="pub-wrap pub-foot-grid">
          <div>
            <b>SG Engenharias</b>
            <p>{SITE.descricao}</p>
            <p>WhatsApp {SITE.whatsappFmt} · {SITE.email}</p>
          </div>
          <div>
            <b>Automação por segmento</b>
            <ul>{SEGMENTOS.map(s => <li key={s.slug}><Link href={`/automacao/${s.slug}`}>{s.nome}</Link></li>)}</ul>
          </div>
          <div>
            <b>Onde atendemos</b>
            <ul>{CIDADES.map(c => <li key={c.slug}><Link href={`/automacao-empresas/${c.slug}`}>{c.nome} ({c.uf})</Link></li>)}</ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Cta({ texto }: { texto: string }) {
  return (
    <section className="pub-cta">
      <div className="pub-wrap">
        <h2>Vamos ver o que dá para automatizar na sua empresa?</h2>
        <p>Conte a rotina que mais toma tempo da equipe. O orçamento é gratuito.</p>
        <div className="pub-actions">
          <a className="btn btn-gold" href={waLink(texto)} target="_blank" rel="noopener">Falar no WhatsApp</a>
          <Link className="btn btn-hero-line" href="/">Ver o catálogo e as demonstrações</Link>
        </div>
      </div>
    </section>
  );
}
