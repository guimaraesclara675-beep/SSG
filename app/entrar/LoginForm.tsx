'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm({ modo, volta }: { modo: 'entrar' | 'criar'; volta?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [aceite, setAceite] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState('');
  const [espera, setEspera] = useState(0);

  // contagem regressiva para liberar o reenvio do código
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera(espera - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);
  const destino = volta && volta.startsWith('/') && !volta.startsWith('//') ? volta : (modo === 'criar' ? '/bem-vindo' : '/app');

  async function google() {
    setErro('');
    if (modo === 'criar' && !aceite) { setErro('Marque a autorização de uso dos dados.'); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?volta=${encodeURIComponent(destino)}` }
    });
    if (error) setErro('Não foi possível abrir o login do Google.');
  }

  async function pedirCodigo() {
    return supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: modo === 'criar', data: modo === 'criar' ? { nome: nome.trim() } : undefined }
    });
  }

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setAviso('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErro('Digite um e-mail válido.'); return; }
    if (modo === 'criar' && (!nome.trim() || !aceite)) { setErro('Preencha seu nome e marque a autorização de uso dos dados.'); return; }
    setBusy(true);
    const { error } = await pedirCodigo();
    setBusy(false);
    if (error) {
      setErro(modo === 'entrar' ? 'Não encontramos uma conta com esse e-mail. Use “Criar conta”.' : 'Não foi possível enviar o código. Tente de novo em instantes.');
      return;
    }
    setEtapa('codigo');
    setEspera(60);
  }

  async function reenviar() {
    if (espera > 0 || busy) return;
    setErro(''); setAviso(''); setBusy(true);
    const { error } = await pedirCodigo();
    setBusy(false);
    if (error) { setErro('Não foi possível reenviar agora. Aguarde um minuto e tente de novo.'); setEspera(60); return; }
    setCodigo('');
    setAviso('Enviamos um novo código. Use o do e-mail mais recente.');
    setEspera(60);
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setBusy(true);
    const token = codigo.trim();
    // Conta nova recebe o código de confirmação de cadastro; conta existente, o de login.
    let { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) ({ error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' }));
    setBusy(false);
    if (error) { setErro('Código incorreto ou expirado. Confira o e-mail e tente de novo.'); return; }
    router.replace(destino);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {modo === 'criar' && etapa === 'email' ? (
        <label className="flex gap-2 text-sm muted items-start" htmlFor="aceite">
          <input id="aceite" type="checkbox" checked={aceite} onChange={e => setAceite(e.target.checked)} className="mt-1" />
          Autorizo a SG Engenharias a usar meus dados para criar a conta e preparar o orçamento, conforme a LGPD.
        </label>
      ) : null}
      <button className="btn btn-line w-full" type="button" onClick={google}>Continuar com Google</button>
      <div className="or">ou com seu e-mail</div>
      {etapa === 'email' ? (
        <form onSubmit={enviarCodigo} className="flex flex-col gap-3">
          {modo === 'criar' ? (
            <div className="fld"><label htmlFor="nome">Seu nome</label><input id="nome" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" /></div>
          ) : null}
          <div className="fld"><label htmlFor="email">E-mail</label><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="voce@empresa.com.br" /></div>
          {erro ? <p className="alert alert-err">{erro}</p> : null}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Enviando…' : 'Receber código por e-mail'}</button>
        </form>
      ) : (
        <form onSubmit={verificar} className="flex flex-col gap-3">
          <p className="text-sm muted">Enviamos um código de acesso para <b>{email}</b>.</p>
          <div className="fld"><label htmlFor="codigo">Código</label><input id="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
          {erro ? <p className="alert alert-err">{erro}</p> : null}
          {aviso ? <p className="alert alert-ok">{aviso}</p> : null}
          <button className="btn btn-primary" disabled={busy || codigo.length < 6}>{busy ? 'Entrando…' : 'Entrar'}</button>
          <button type="button" className="link text-sm" onClick={reenviar} disabled={espera > 0 || busy}>
            {espera > 0 ? `Reenviar código em ${espera}s` : 'Não recebeu? Reenviar código'}
          </button>
          <p className="text-xs muted">Confira também a caixa de spam.</p>
          <button type="button" className="link text-sm" onClick={() => { setEtapa('email'); setCodigo(''); setErro(''); setAviso(''); }}>Usar outro e-mail</button>
        </form>
      )}
    </div>
  );
}
