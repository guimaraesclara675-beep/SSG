import { Shell } from '@/components/Shell';
import type { Org } from '@/lib/auth';

export function ClientShell({ org, current, title, children, respondidos = 0 }: { org: Org; current: string; title: string; children: React.ReactNode; respondidos?: number }) {
  return (
    <Shell brand={org.marca || org.nome} sub="por SG Engenharias" cor={org.cor} current={current} title={title}
      nav={[
        { href: '/app', label: 'Início' }, { href: '/app/modulos', label: 'Meus módulos' }, { href: '/app/ia', label: 'Ajustes com IA' }, { href: '/app/faturas', label: 'Faturas' },
        { href: '/app/suporte', label: 'Suporte', badge: respondidos }, { href: '/app/equipe', label: 'Equipe' }, { href: '/app/marca', label: 'Minha marca' }
      ]}>
      {children}
    </Shell>
  );
}
