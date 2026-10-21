export function Chip({ map, value }: { map: Record<string, [string, string]>; value: string }) {
  const [label, cls] = map[value] || [value, 'chip-gray'];
  return <span className={`chip ${cls}`}>{label}</span>;
}
