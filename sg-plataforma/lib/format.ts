export const brl = (v: number | string | null | undefined) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const data = (v: string | null | undefined) => (v ? new Date(v.length === 10 ? v + 'T12:00:00' : v).toLocaleDateString('pt-BR') : '—');
export const ETAPAS = ['Diagnóstico', 'Configuração', 'Testes', 'No ar'];
export const ORG_STATUS: Record<string, [string, string]> = {
  aguardando: ['Aguardando ativação', 'chip-gold'], implantacao: ['Em implantação', 'chip-blue'], ativo: ['Ativo', 'chip-green'], suspenso: ['Suspenso', 'chip-red']
};
export const MOD_STATUS: Record<string, [string, string]> = {
  solicitado: ['Solicitado', 'chip-gold'], implantacao: ['Em implantação', 'chip-blue'], ativo: ['Ativo', 'chip-green'], desligado: ['Desligado', 'chip-gray']
};
export const INV_STATUS: Record<string, [string, string]> = { pend: ['Em aberto', 'chip-blue'], pago: ['Paga', 'chip-green'], atr: ['Atrasada', 'chip-red'] };
export const TICKET_STATUS: Record<string, [string, string]> = { aberto: ['Aberto', 'chip-gold'], respondido: ['Respondido', 'chip-green'], fechado: ['Fechado', 'chip-gray'] };
export const LEAD_STATUS = ['novo', 'em contato', 'proposta enviada', 'fechado', 'perdido'];
export const SEGMENTOS = ['Imobiliárias', 'Engenharia e construção', 'Consórcios e financiamentos', 'Clínicas e saúde', 'E-commerce e varejo', 'Logística e transportes', 'Restaurantes e delivery', 'Hotelaria e turismo', 'Educação', 'Escritórios jurídicos', 'Contabilidade', 'Indústria', 'Serviços técnicos', 'Outro'];
export const waLink = (texto: string, numero = process.env.NEXT_PUBLIC_WHATSAPP || '5511915471870') => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
