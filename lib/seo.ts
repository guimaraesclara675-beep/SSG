// Dados das páginas públicas usadas por buscadores e assistentes de IA.
// Gerado a partir do catálogo (supabase/seed_modulos.sql) e dos segmentos da vitrine.

export const SITE = {
  url: 'https://sgengenharias.com',
  nome: 'SG Engenharias',
  descricao:
    'A SG Engenharias é uma empresa brasileira de automação de sistemas: transforma as rotinas complexas do dia a dia em processos que funcionam sozinhos, para mais de 500 tipos de empresas e processos, de locadoras de barcos, produtoras de vídeo e estúdios de gravação a BPO financeiro, leiloeiros, holdings familiares e prefeituras.',
  whatsapp: '5511915471870',
  whatsappFmt: '(11) 91547-1870',
  email: 'adm@sgengenharias.com',
  regiao: 'todo o Brasil'
};

export type Modulo = { id: string; nome: string; desc: string };
export type Segmento = {
  slug: string; seg: string; nome: string; titulo: string; resumo: string; dores: string[]; modulos: Modulo[];
};

export const SEGMENTOS: Segmento[] = [
 {
  "slug": "imobiliarias",
  "seg": "Imobiliárias",
  "nome": "Imobiliárias",
  "titulo": "Automação para imobiliárias",
  "resumo": "Mais visitas agendadas, aluguel cobrado sozinho e repasses sem planilha.",
  "dores": [
   "O corretor perde o lead porque demorou a responder",
   "Cobrança de aluguel e repasse feitos à mão",
   "Contratos montados copiando o anterior"
  ],
  "modulos": [
   {
    "id": "H-03",
    "nome": "Agendamento de visitas",
    "desc": "O interessado escolhe o horário, o corretor confirma e todos recebem lembrete."
   },
   {
    "id": "H-06",
    "nome": "Cobrança de aluguel",
    "desc": "Emite boleto ou Pix do aluguel e acompanha atrasos automaticamente."
   },
   {
    "id": "H-07",
    "nome": "Repasses a proprietários",
    "desc": "Calcula a taxa de administração e repassa valores com demonstrativo."
   },
   {
    "id": "D-09",
    "nome": "Um WhatsApp, vários negócios",
    "desc": "Um único número atende empresas diferentes: identifica de qual negócio é cada mensagem, responde com a identidade certa e entrega para a equipe certa."
   },
   {
    "id": "H-01",
    "nome": "Captação de imóveis",
    "desc": "Recebe ofertas de proprietários, organiza fotos e documentos e publica nos portais."
   },
   {
    "id": "H-02",
    "nome": "Cadastro de proprietários e locatários",
    "desc": "Fichas completas com documentos e histórico de cada parte."
   },
   {
    "id": "H-04",
    "nome": "Propostas e reservas",
    "desc": "Registra propostas, envia ao proprietário e controla a reserva do imóvel."
   },
   {
    "id": "H-05",
    "nome": "Contratos de locação e venda",
    "desc": "Gera contratos, coleta assinaturas e arquiva tudo por imóvel."
   }
  ]
 },
 {
  "slug": "consorcios",
  "seg": "Consórcios e financiamentos",
  "nome": "Consórcios",
  "titulo": "Automação para consórcios",
  "resumo": "Sua carteira de cotas, lances e assembleias sob controle, com o cliente avisado na hora certa.",
  "dores": [
   "Datas de assembleia lembradas de cabeça",
   "Lances combinados por mensagem e esquecidos",
   "Clientes perguntando a parcela o tempo todo"
  ],
  "modulos": [
   {
    "id": "J-05",
    "nome": "Propostas de lance",
    "desc": "Organiza a estratégia de lances por grupo e lembra os prazos de oferta."
   },
   {
    "id": "J-01",
    "nome": "CRM de consorciados",
    "desc": "Clientes, cotas, grupos e administradoras em um só lugar."
   },
   {
    "id": "J-03",
    "nome": "Acompanhamento de parcelas",
    "desc": "Mostra parcelas pagas, em aberto e atrasadas de cada cota."
   },
   {
    "id": "D-09",
    "nome": "Um WhatsApp, vários negócios",
    "desc": "Um único número atende empresas diferentes: identifica de qual negócio é cada mensagem, responde com a identidade certa e entrega para a equipe certa."
   },
   {
    "id": "J-02",
    "nome": "Simulador de consórcio e financiamento",
    "desc": "Compara cartas, parcelas e prazos e gera a simulação para o cliente."
   },
   {
    "id": "J-04",
    "nome": "Alertas de assembleia",
    "desc": "Avisa clientes e equipe das datas de assembleia e dos resultados."
   },
   {
    "id": "J-06",
    "nome": "Contemplações",
    "desc": "Registra contemplações, pendências de documentos e liberação da carta."
   },
   {
    "id": "J-07",
    "nome": "Documentação do consorciado",
    "desc": "Checklist de documentos com envio pelo WhatsApp e conferência."
   }
  ]
 },
 {
  "slug": "engenharia",
  "seg": "Engenharia e construção",
  "nome": "Engenharia e obras",
  "titulo": "Automação para engenharia e obras",
  "resumo": "Diário de obra, medições e compras pelo celular, com relatório pronto para o cliente.",
  "dores": [
   "Diário de obra em papel ou no grupo do WhatsApp",
   "Medições em planilhas soltas",
   "Compras pedidas por telefone, sem aprovação"
  ],
  "modulos": [
   {
    "id": "I-04",
    "nome": "Diário de obra digital",
    "desc": "Registro diário com clima, equipe, atividades e fotos, direto do celular."
   },
   {
    "id": "I-03",
    "nome": "Medições de obra",
    "desc": "Registra medições em campo e gera boletins para aprovação e faturamento."
   },
   {
    "id": "I-07",
    "nome": "Relatórios fotográficos",
    "desc": "Organiza fotos por etapa e data e monta o relatório para o cliente."
   },
   {
    "id": "I-01",
    "nome": "Orçamento de obras",
    "desc": "Monta orçamentos a partir de composições e tabelas de referência, com BDI."
   },
   {
    "id": "I-02",
    "nome": "Cronograma físico-financeiro",
    "desc": "Acompanha etapas previstas e realizadas e alerta desvios de prazo e custo."
   },
   {
    "id": "I-05",
    "nome": "Gestão de materiais",
    "desc": "Controla entradas, saídas e saldo por obra e avisa quando repor."
   },
   {
    "id": "I-06",
    "nome": "Solicitações de compra da obra",
    "desc": "O engenheiro pede pelo celular, compras cota e o gestor aprova."
   },
   {
    "id": "I-08",
    "nome": "Indicadores de obras",
    "desc": "Painel com avanço, custo, produtividade e pendências de cada obra."
   }
  ]
 },
 {
  "slug": "clinicas",
  "seg": "Clínicas e saúde",
  "nome": "Clínicas",
  "titulo": "Automação para clínicas e consultórios",
  "resumo": "Menos faltas, recepção mais leve e convênios em dia.",
  "dores": [
   "Pacientes faltam sem avisar",
   "Recepção presa ao telefone",
   "Glosas descobertas tarde demais"
  ],
  "modulos": [
   {
    "id": "K-02",
    "nome": "Confirmação de consultas",
    "desc": "Confirma presença e libera horários quando o paciente cancela."
   },
   {
    "id": "K-01",
    "nome": "Agendamento online de consultas",
    "desc": "Pacientes marcam pelo site ou WhatsApp conforme a agenda de cada profissional."
   },
   {
    "id": "K-04",
    "nome": "Faturamento de convênios",
    "desc": "Organiza guias e lotes e acompanha glosas."
   },
   {
    "id": "D-02",
    "nome": "Atendimento com IA",
    "desc": "Assistente que entende perguntas abertas e responde com base nas informações da empresa."
   },
   {
    "id": "K-03",
    "nome": "Recepção digital",
    "desc": "Ficha de cadastro e termos preenchidos antes da chegada."
   },
   {
    "id": "K-05",
    "nome": "Estoque de insumos",
    "desc": "Materiais e medicamentos com alerta de validade e reposição."
   },
   {
    "id": "K-06",
    "nome": "Lembretes de retorno",
    "desc": "Avisa pacientes quando chega a hora do retorno ou do exame periódico."
   },
   {
    "id": "K-07",
    "nome": "Comunicação com pacientes",
    "desc": "Orientações antes e depois do atendimento, com cuidado com dados sensíveis."
   }
  ]
 },
 {
  "slug": "ecommerce",
  "seg": "E-commerce e varejo",
  "nome": "E-commerce",
  "titulo": "Automação para lojas virtuais",
  "resumo": "Pedidos, estoque e nota fiscal andando juntos, e o carrinho abandonado volta a vender.",
  "dores": [
   "Estoque diferente em cada canal",
   "Nota fiscal emitida à mão",
   "Cliente perguntando onde está o pedido"
  ],
  "modulos": [
   {
    "id": "L-01",
    "nome": "Gestão de pedidos",
    "desc": "Pedidos de todos os canais em uma fila única com status automático."
   },
   {
    "id": "L-02",
    "nome": "Estoque integrado",
    "desc": "Atualiza o estoque em todos os canais a cada venda."
   },
   {
    "id": "L-05",
    "nome": "Recuperação de carrinho",
    "desc": "Lembra quem abandonou o carrinho com mensagem e cupom."
   },
   {
    "id": "L-03",
    "nome": "Emissão fiscal automática",
    "desc": "Emite a nota por provedor autorizado assim que o pagamento é aprovado."
   },
   {
    "id": "L-04",
    "nome": "Rastreamento de entregas",
    "desc": "Acompanha transportadoras e avisa o cliente a cada etapa."
   },
   {
    "id": "L-06",
    "nome": "Trocas e devoluções",
    "desc": "Solicitação, aprovação, logística reversa e reembolso em um fluxo."
   },
   {
    "id": "L-07",
    "nome": "Atendimento pós-venda com IA",
    "desc": "Responde dúvidas de pedido e abre chamado quando necessário."
   },
   {
    "id": "L-08",
    "nome": "Relatórios da loja",
    "desc": "Faturamento, ticket médio e mais vendidos por dia."
   }
  ]
 },
 {
  "slug": "restaurantes",
  "seg": "Restaurantes e delivery",
  "nome": "Restaurantes",
  "titulo": "Automação para restaurantes e delivery",
  "resumo": "Pedido da mesa e do delivery direto na cozinha, e o custo de cada prato na ponta do lápis.",
  "dores": [
   "Pedidos de vários aplicativos misturados",
   "Fila na porta e mesa ociosa",
   "Não saber quanto custa cada prato"
  ],
  "modulos": [
   {
    "id": "N-02",
    "nome": "Delivery centralizado",
    "desc": "Reúne pedidos dos aplicativos e do WhatsApp em uma fila só."
   },
   {
    "id": "N-01",
    "nome": "Cardápio digital com pedidos",
    "desc": "O cliente pede pelo QR Code da mesa e o pedido vai direto para a cozinha."
   },
   {
    "id": "N-07",
    "nome": "Estoque e ficha técnica",
    "desc": "Baixa ingredientes a cada venda e calcula o custo dos pratos."
   },
   {
    "id": "N-06",
    "nome": "Tela de cozinha",
    "desc": "Pedidos em ordem de preparo com o tempo de cada prato."
   },
   {
    "id": "N-03",
    "nome": "Reservas de mesa",
    "desc": "Reserva online com confirmação e lista de espera."
   },
   {
    "id": "N-04",
    "nome": "Fila de espera digital",
    "desc": "O cliente entra na fila pelo celular e é chamado por mensagem."
   },
   {
    "id": "N-05",
    "nome": "Mesas e comandas",
    "desc": "Mapa de mesas, comandas e divisão de conta."
   },
   {
    "id": "N-08",
    "nome": "Pagamento na mesa",
    "desc": "Pix e cartão direto na mesa, com divisão da conta."
   }
  ]
 },
 {
  "slug": "juridico",
  "seg": "Escritórios jurídicos",
  "nome": "Escritórios jurídicos",
  "titulo": "Automação para escritórios de advocacia",
  "resumo": "Prazos que não escapam e clientes que acompanham o caso sem precisar ligar.",
  "dores": [
   "Prazos controlados em agenda de papel",
   "Cliente ligando para saber do processo",
   "Honorários sem controle de parcelas"
  ],
  "modulos": [
   {
    "id": "Q-01",
    "nome": "Controle de prazos processuais",
    "desc": "Agenda prazos e audiências e alerta a equipe com antecedência."
   },
   {
    "id": "Q-06",
    "nome": "Portal do cliente",
    "desc": "O cliente consulta o andamento do caso sem precisar ligar."
   },
   {
    "id": "Q-07",
    "nome": "Honorários e cobranças",
    "desc": "Controla honorários, parcelas e repasses por caso."
   },
   {
    "id": "Q-05",
    "nome": "Minutas com apoio de IA",
    "desc": "Rascunhos de peças a partir de modelos, sempre revisados pelo advogado."
   },
   {
    "id": "Q-02",
    "nome": "Organização de processos",
    "desc": "Pasta digital de cada processo com documentos e andamentos."
   },
   {
    "id": "Q-03",
    "nome": "Acompanhamento de publicações",
    "desc": "Consulta, por integração permitida, publicações e andamentos."
   },
   {
    "id": "Q-04",
    "nome": "Contratos do escritório",
    "desc": "Modelos, revisão, aprovação e controle de vigência."
   },
   {
    "id": "Q-08",
    "nome": "Relatórios de carteira",
    "desc": "Processos por fase, risco e responsável."
   }
  ]
 },
 {
  "slug": "contabilidade",
  "seg": "Contabilidade",
  "nome": "Contabilidade",
  "titulo": "Automação para escritórios de contabilidade",
  "resumo": "Documentos dos clientes chegando sozinhos e fechamento do mês sem correria.",
  "dores": [
   "Cobrar documentos de cada cliente todo mês",
   "Redigitar lançamentos e notas",
   "Obrigações com prazo apertado"
  ],
  "modulos": [
   {
    "id": "R-01",
    "nome": "Coleta de documentos de clientes",
    "desc": "Pede, recebe e confere os documentos mensais de cada cliente."
   },
   {
    "id": "R-08",
    "nome": "Leitura de notas fiscais",
    "desc": "Extrai dados de XML e PDF e classifica automaticamente."
   },
   {
    "id": "R-04",
    "nome": "Rotinas de fechamento",
    "desc": "Checklist de fechamento mensal com o status de cada cliente."
   },
   {
    "id": "R-06",
    "nome": "Obrigações acessórias",
    "desc": "Calendário de obrigações com alertas e responsáveis."
   },
   {
    "id": "R-02",
    "nome": "Conciliação contábil",
    "desc": "Concilia lançamentos e extratos e aponta divergências."
   },
   {
    "id": "R-03",
    "nome": "Envio ao sistema contábil",
    "desc": "Envia lançamentos e notas ao sistema contábil sem redigitar."
   },
   {
    "id": "R-05",
    "nome": "Emissão de notas de serviço",
    "desc": "Emissão por provedor autorizado a partir de contratos e recorrências."
   },
   {
    "id": "R-07",
    "nome": "Relatórios gerenciais",
    "desc": "DRE, balancete e indicadores enviados aos clientes."
   }
  ]
 },
 {
  "slug": "educacao",
  "seg": "Educação",
  "nome": "Escolas e cursos",
  "titulo": "Automação para escolas e cursos",
  "resumo": "Matrícula online, mensalidade em dia e responsáveis sempre informados.",
  "dores": [
   "Matrícula em papel e fila na secretaria",
   "Mensalidades cobradas por telefone",
   "Responsáveis sabendo das faltas tarde"
  ],
  "modulos": [
   {
    "id": "P-01",
    "nome": "Matrículas online",
    "desc": "Inscrição, documentos, contrato e pagamento em um fluxo só."
   },
   {
    "id": "P-02",
    "nome": "Mensalidades escolares",
    "desc": "Boletos e Pix com lembretes e acordos de pagamento."
   },
   {
    "id": "P-04",
    "nome": "Controle de frequência",
    "desc": "Chamada pelo celular com aviso aos responsáveis quando o aluno falta."
   },
   {
    "id": "P-06",
    "nome": "Comunicação com responsáveis",
    "desc": "Comunicados, autorizações e confirmação de leitura."
   },
   {
    "id": "P-03",
    "nome": "Gestão de turmas",
    "desc": "Turmas, horários, professores e salas organizados."
   },
   {
    "id": "P-05",
    "nome": "Notas e boletins",
    "desc": "Lançamento de notas, boletins e alertas de desempenho."
   },
   {
    "id": "P-07",
    "nome": "Emissão de certificados",
    "desc": "Gera e envia certificados com código de validação."
   },
   {
    "id": "P-08",
    "nome": "Acompanhamento pedagógico",
    "desc": "Painel por aluno com frequência, notas e alertas."
   }
  ]
 }
];

export type Cidade = { slug: string; nome: string; uf: string; estado: string };

export const CIDADES: Cidade[] = [
  { slug: 'recife', nome: 'Recife', uf: 'PE', estado: 'Pernambuco' },
  { slug: 'cabo-de-santo-agostinho', nome: 'Cabo de Santo Agostinho', uf: 'PE', estado: 'Pernambuco' },
  { slug: 'jaboatao-dos-guararapes', nome: 'Jaboatão dos Guararapes', uf: 'PE', estado: 'Pernambuco' },
  { slug: 'joao-pessoa', nome: 'João Pessoa', uf: 'PB', estado: 'Paraíba' },
  { slug: 'campina-grande', nome: 'Campina Grande', uf: 'PB', estado: 'Paraíba' }
];

export const FAQ: { p: string; r: string }[] = [
  { p: 'O que a SG Engenharias faz?',
    r: 'A SG Engenharias cria automações sob medida para empresas: atendimento automático no WhatsApp, cobrança e lembretes de pagamento, CRM e funil de vendas, agendamentos, relatórios e rotinas administrativas. A SG automatiza mais de 500 tipos de empresas e processos, combinando as automações conforme o negócio.' },
  { p: 'Para que tipo de empresa a automação serve?',
    r: 'Para empresas de qualquer porte que repetem tarefas todos os dias. A SG automatiza os sistemas de mais de 500 tipos de empresas e processos, como anfitriões de Airbnb, receptivos e passeios, DJs e bandas, produtoras de vídeo, BPO financeiro, auditorias, call centers, leiloeiros, holdings familiares, revendas de software, prefeituras e associações de moradores. Também temos soluções prontas para consórcios, imobiliárias, clínicas, engenharia e obras, lojas virtuais, restaurantes, escritórios jurídicos, contabilidade e escolas, e fazemos sob medida para outros ramos.' },
  { p: 'Onde a SG Engenharias atende?',
    r: 'Atendemos empresas de todo o Brasil e do exterior. A implantação é feita pelo WhatsApp e por videochamada, e quem preferir pode ser atendido presencialmente na nossa sala no Novo Mundo Empresarial, no Cabo de Santo Agostinho.' },
  { p: 'Dá para automatizar o WhatsApp da empresa?',
    r: 'Sim. O WhatsApp pode responder perguntas frequentes, fazer o primeiro atendimento, agendar, enviar lembretes e cobranças e passar a conversa para a pessoa certa da equipe. Também é possível usar um único número para mais de um negócio, separando as mensagens de cada um.' },
  { p: 'Quanto custa uma automação?',
    r: 'Cada automação do catálogo mostra uma faixa de investimento. O valor final depende do que será combinado e das integrações necessárias, e sai depois de uma conversa rápida sobre a rotina da empresa. O pedido de orçamento pelo site ou pelo WhatsApp é gratuito.' },
  { p: 'Quanto tempo leva para implantar?',
    r: 'Automações simples, como lembretes e respostas automáticas, costumam ficar prontas em poucos dias. Projetos com várias integrações levam mais tempo; o prazo é combinado no orçamento e o cliente acompanha cada etapa pela área do cliente.' },
  { p: 'Os dados da minha empresa ficam seguros?',
    r: 'Sim. Cada cliente acessa somente os dados da própria empresa, o login é feito por código enviado ao e-mail, sem senha para vazar, e o tratamento dos dados segue a LGPD.' },
  { p: 'Depois de pronto, consigo ajustar a automação?',
    r: 'Sim. Pela área do cliente é possível acompanhar os módulos, abrir chamados e, nos planos com IA, pedir ajustes em português, como mudar horários, textos e prazos de lembretes. Toda mudança fica registrada e pode ser desfeita.' }
];

export function waLink(texto: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}
