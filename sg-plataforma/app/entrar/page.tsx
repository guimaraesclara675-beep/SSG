import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default function Entrar({ searchParams }: { searchParams: { modo?: string; volta?: string; erro?: string } }) {
  const modo = searchParams.modo === 'criar' ? 'criar' : 'entrar';
  return (
    <div className="auth">
      <section className="auth-side">
        <a href="/" className="flex items-center gap-3 font-semibold"><img src="/logo-sg-completo.png" alt="SG Engenharias · Salford & Co." width={180} height={139} style={{ width: 180, height: 'auto' }} /></a>
        <div>
          <p className="text-xs uppercase tracking-[.12em]" style={{ color: 'var(--gold)' }}>Área do cliente</p>
          <h2>{modo === 'criar' ? 'Crie sua conta. A SG analisa o cadastro e libera o seu acesso.' : 'Seus módulos, faturas e chamados em um só lugar.'}</h2>
          <p>Sem senha para lembrar: você entra com um código enviado ao seu e-mail ou com a sua conta Google.</p>
        </div>
        <p className="fine" style={{ color: 'var(--on-hero-muted)' }}>Dados protegidos conforme a LGPD.</p>
      </section>
      <section className="auth-box">
        <div className="tabs">
          <a href={`/entrar${searchParams.volta ? `?volta=${encodeURIComponent(searchParams.volta)}` : ''}`} className={modo === 'entrar' ? 'on' : ''}>Entrar</a>
          <a href="/entrar?modo=criar" className={modo === 'criar' ? 'on' : ''}>Criar conta</a>
        </div>
        {searchParams.erro ? <p className="alert alert-err">Não foi possível entrar. Tente de novo.</p> : null}
        <LoginForm modo={modo} volta={searchParams.volta} />
      </section>
    </div>
  );
}
