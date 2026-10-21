import { Shell } from '@/components/Shell';
import { createClient } from '@/lib/supabase/server';

export async function AdminShell({ current, title, children }: { current: string; title: string; children: React.ReactNode }) {
  const supabase = createClient();
  const [{ count: novos }, { count: abertos }, { count: aguardando }] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'aberto'),
    supabase.from('organizations').select('id', { count: 'exact', head: true }).eq('status', 'aguardando')
  ]);
  return (
    <Shell brand="SG Engenharias" sub="Painel da administradora" current={current} title={title}
      nav={[
        { href: '/admin', label: 'Visão geral' }, { href: '/admin/clientes', label: 'Clientes', badge: aguardando || 0 },
        { href: '/admin/pedidos', label: 'Pedidos', badge: novos || 0 }, { href: '/admin/implantacoes', label: 'Implantações' },
        { href: '/admin/financeiro', label: 'Financeiro' }, { href: '/admin/chamados', label: 'Chamados', badge: abertos || 0 }
      ]}>
      {children}
    </Shell>
  );
}
