import { requireClient } from '@/lib/auth';
import { ClientShell } from '@/components/ClientShell';
import { Flash } from '@/components/Flash';
import { salvarMarca } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Marca({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const { org, perfil } = await requireClient();
  const pode = perfil === 'Administrador';
  return (
    <ClientShell org={org} current="/app/marca" title="Minha marca">
      <Flash sp={searchParams} />
      <form action={salvarMarca} className="card form">
        <div className="fld full"><label htmlFor="marca">Nome exibido</label><input id="marca" name="marca" defaultValue={org.marca || org.nome} disabled={!pode} /></div>
        <div className="fld"><label htmlFor="cor">Cor principal</label><input id="cor" name="cor" type="color" defaultValue={org.cor} disabled={!pode} /></div>
        <div className="fld"><label htmlFor="dominio">Endereço desejado</label><input id="dominio" name="dominio" defaultValue={org.dominio || ''} placeholder="sistema.suaempresa.com.br" disabled={!pode} /></div>
        {pode ? <div><button className="btn btn-primary">Salvar</button></div> : <p className="fine full">Só administradores da empresa alteram a marca.</p>}
        <p className="fine full">O endereço próprio é configurado pela SG na implantação.</p>
      </form>
    </ClientShell>
  );
}
