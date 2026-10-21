'use client';
import { useState } from 'react';
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

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault(); setErro('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErro('Digite um e-mail válido.'); return; }
    if (modo === 'criar' && (!nome.trim() || !aceite)) { setErro('Preencha seu nome e marque a autorização de uso dos dados.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: modo === 'criar', data: modo === 'criar' ? { nome: nome.trim() } : undefined }
    });
    setBusy(false);
    if (error) {
      setErro(modo === 'entrar' ? 'Não encontramos uma conta com esse e-mail. Use “Criar conta”.' : 'Não foi possível enviar o código. Tente de novo em instantes.');
      return;
    }
    setEtapa('codigo');
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo.trim(), type: 'email' });
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
          <p className="text-sm muted">Enviamos um código de 6 dígitos para <b>{email}</b>.</p>
          <div className="fld"><label htmlFor="codigo">Código</label><input id="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
          {erro ? <p className="alert alert-err">{erro}</p> : null}
          <button className="btn btn-primary" disabled={busy || codigo.length < 6}>{busy ? 'Entrando…' : 'Entrar'}</button>
          <button type="button" className="link text-sm" onClick={() => { setEtapa('email'); setCodigo(''); }}>Usar outro e-mail</button>
        </form>
      )}
    </div>
  );
}
