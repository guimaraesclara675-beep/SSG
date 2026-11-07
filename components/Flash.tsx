export function Flash({ sp }: { sp: { ok?: string; erro?: string } }) {
  if (sp.erro) return <p className="alert alert-err" role="alert">{sp.erro}</p>;
  if (sp.ok) return <p className="alert alert-ok" role="status">{sp.ok}</p>;
  return null;
}
