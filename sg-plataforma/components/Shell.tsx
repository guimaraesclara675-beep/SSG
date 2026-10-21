import Link from 'next/link';

export type NavItem = { href: string; label: string; badge?: number };

export function Shell({ brand, sub, cor, nav, current, title, children, banner }: {
  brand: string; sub: string; cor?: string; nav: NavItem[]; current: string; title: string; children: React.ReactNode; banner?: React.ReactNode;
}) {
  const ini = brand.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="shell">
      <aside className="side">
        <div className="side-brand">
          {cor ? <span className="logo" style={{ background: cor }}>{ini}</span> : <img src="/logo-sg.png" alt="SG" width={40} height={24} style={{ height: 24, width: 'auto' }} />}
          <span><b>{brand}</b><small>{sub}</small></span>
        </div>
        <nav className="side-nav">
          {nav.map(n => (
            <Link key={n.href} href={n.href} className={current === n.href ? 'on' : ''}>
              <span>{n.label}</span>{n.badge ? <i>{n.badge}</i> : null}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <a href="/">← Voltar ao site</a>
          <form action="/sair" method="post"><button>Sair</button></form>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">{banner}<h1>{title}</h1></header>
        <div className="body">{children}</div>
      </main>
    </div>
  );
}
