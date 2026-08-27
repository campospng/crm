export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
}

export interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note";
  description: string;
  date: string;
  user: string;
}

export interface Note {
  id: string;
  content: string;
  date: string;
  user: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  status: "active" | "inactive" | "prospect";
  tags: string[];
  avatar: string;
  revenue: number;
  joinedDate: string;
  lastContact: string;
  deals: Deal[];
  activities: Activity[];
  notes: Note[];
  industry: string;
  employees: string;
  source: string;
}

export const clients: Client[] = [
  {
    id: "1",
    name: "Sofia Andrade",
    company: "Nexus Digital",
    email: "sofia@nexusdigital.com.br",
    phone: "+55 11 99231-4821",
    website: "nexusdigital.com.br",
    address: "Av. Paulista, 1374, 12º andar",
    city: "São Paulo",
    country: "Brasil",
    status: "active",
    tags: ["Enterprise", "SaaS", "Prioritário"],
    avatar: "SO",
    revenue: 284000,
    joinedDate: "2023-03-14",
    lastContact: "2026-08-20",
    industry: "Tecnologia",
    employees: "50–200",
    source: "Indicação",
    deals: [
      { id: "d1", title: "Plataforma Analytics Q4", value: 148000, stage: "negotiation", probability: 75, closeDate: "2026-09-30" },
      { id: "d2", title: "Renovação Anual 2026", value: 96000, stage: "won", probability: 100, closeDate: "2026-01-15" },
    ],
    activities: [
      { id: "a1", type: "call", description: "Chamada de alinhamento sobre proposta Q4. Sofia confirmou interesse, aguarda aprovação do CFO.", date: "2026-08-20", user: "Você" },
      { id: "a2", type: "email", description: "Enviado deck com detalhes do plano Enterprise e ROI estimado.", date: "2026-08-15", user: "Você" },
      { id: "a3", type: "meeting", description: "Reunião presencial na sede da Nexus. Apresentação para time técnico.", date: "2026-08-08", user: "Você" },
    ],
    notes: [
      { id: "n1", content: "Sofia prefere comunicação via WhatsApp fora do horário comercial. CFO é o gargalo nas aprovações acima de R$100k.", date: "2026-08-20", user: "Você" },
      { id: "n2", content: "Empresa planeja expansão para 3 filiais em 2027. Oportunidade para upsell.", date: "2026-08-08", user: "Você" },
    ],
  },
  {
    id: "2",
    name: "Rafael Mendes",
    company: "Construtech BH",
    email: "rafael.mendes@construtech.com.br",
    phone: "+55 31 98741-2203",
    website: "construtech.com.br",
    address: "Rua dos Carijós, 110, Sala 301",
    city: "Belo Horizonte",
    country: "Brasil",
    status: "active",
    tags: ["Construção", "Mid-Market"],
    avatar: "RM",
    revenue: 112000,
    joinedDate: "2024-01-22",
    lastContact: "2026-08-18",
    industry: "Construção Civil",
    employees: "10–50",
    source: "LinkedIn",
    deals: [
      { id: "d3", title: "Sistema de Gestão de Obras", value: 64000, stage: "proposal", probability: 55, closeDate: "2026-10-15" },
    ],
    activities: [
      { id: "a4", type: "email", description: "Enviado proposta atualizada com desconto de 10% para fechamento até setembro.", date: "2026-08-18", user: "Você" },
      { id: "a5", type: "call", description: "Rafael solicitou ajuste no escopo — remover módulo de RH.", date: "2026-08-12", user: "Você" },
    ],
    notes: [
      { id: "n3", content: "Decisor principal é o sócio-fundador Cláudio Mendes. Rafael é o contato técnico.", date: "2026-08-12", user: "Você" },
    ],
  },
  {
    id: "3",
    name: "Camila Torres",
    company: "Farmácias Bem Estar",
    email: "camila.torres@bemestarf.com.br",
    phone: "+55 21 97612-9945",
    website: "farmaciasbemestar.com.br",
    address: "Rua da Assembleia, 34",
    city: "Rio de Janeiro",
    country: "Brasil",
    status: "prospect",
    tags: ["Varejo", "Saúde", "Novo"],
    avatar: "CT",
    revenue: 0,
    joinedDate: "2026-07-10",
    lastContact: "2026-08-22",
    industry: "Varejo / Saúde",
    employees: "200–500",
    source: "Evento",
    deals: [
      { id: "d4", title: "ERP para Rede de Farmácias", value: 210000, stage: "qualified", probability: 35, closeDate: "2026-11-30" },
    ],
    activities: [
      { id: "a6", type: "meeting", description: "Demo do produto para Camila e equipe de TI. Muito interesse no módulo de estoque.", date: "2026-08-22", user: "Você" },
    ],
    notes: [
      { id: "n4", content: "Camila ficou impressionada com a integração ao SNGPC. Concorrente principal: TOTVS.", date: "2026-08-22", user: "Você" },
    ],
  },
  {
    id: "4",
    name: "Pedro Luz",
    company: "Agro Futuro",
    email: "pedro@agrofuturo.ag",
    phone: "+55 65 99312-7741",
    website: "agrofuturo.ag",
    address: "Rod. MT-222, Km 12",
    city: "Sinop",
    country: "Brasil",
    status: "inactive",
    tags: ["Agro", "Churn Risk"],
    avatar: "PL",
    revenue: 48000,
    joinedDate: "2022-11-05",
    lastContact: "2026-05-30",
    industry: "Agronegócio",
    employees: "10–50",
    source: "Google Ads",
    deals: [
      { id: "d5", title: "Renovação — Módulo Rastreamento", value: 32000, stage: "lost", probability: 0, closeDate: "2026-06-30" },
    ],
    activities: [
      { id: "a7", type: "call", description: "Pedro não atendeu. Deixado voicemail.", date: "2026-05-30", user: "Você" },
    ],
    notes: [
      { id: "n5", content: "Conta com alto risco de churn. Pedro mencionou insatisfação com suporte em março.", date: "2026-05-10", user: "Você" },
    ],
  },
  {
    id: "5",
    name: "Ana Beatriz Costa",
    company: "Studio Arco",
    email: "ana@studioarco.design",
    phone: "+55 11 93341-5502",
    website: "studioarco.design",
    address: "Rua Haddock Lobo, 595, Cj 82",
    city: "São Paulo",
    country: "Brasil",
    status: "active",
    tags: ["Design", "Pequeno Porte"],
    avatar: "AB",
    revenue: 29000,
    joinedDate: "2025-04-18",
    lastContact: "2026-08-14",
    industry: "Design & Criativo",
    employees: "2–10",
    source: "Site Orgânico",
    deals: [
      { id: "d6", title: "Plano Profissional — Renovação", value: 14400, stage: "won", probability: 100, closeDate: "2026-07-01" },
      { id: "d7", title: "Add-on: Clientes Ilimitados", value: 6000, stage: "lead", probability: 20, closeDate: "2026-09-15" },
    ],
    activities: [
      { id: "a8", type: "email", description: "Enviado proposta de upgrade com benefícios do plano ilimitado.", date: "2026-08-14", user: "Você" },
    ],
    notes: [
      { id: "n6", content: "Ana é muito ativa na comunidade de design. Potencial para caso de sucesso/depoimento.", date: "2026-08-14", user: "Você" },
    ],
  },
  {
    id: "6",
    name: "Lucas Ferreira",
    company: "LogMov Transportes",
    email: "lucas.ferreira@logmov.com.br",
    phone: "+55 41 98821-6634",
    website: "logmov.com.br",
    address: "Av. Marechal Floriano, 1050",
    city: "Curitiba",
    country: "Brasil",
    status: "active",
    tags: ["Logística", "Enterprise"],
    avatar: "LF",
    revenue: 196000,
    joinedDate: "2023-08-30",
    lastContact: "2026-08-19",
    industry: "Logística & Transporte",
    employees: "200–500",
    source: "Parceiro",
    deals: [
      { id: "d8", title: "Plataforma de Rastreamento Nacional", value: 320000, stage: "negotiation", probability: 65, closeDate: "2026-10-01" },
    ],
    activities: [
      { id: "a9", type: "meeting", description: "Reunião de negociação contratual. Lucas quer cláusula de SLA 99.9%.", date: "2026-08-19", user: "Você" },
      { id: "a10", type: "email", description: "Enviado minuta do contrato para revisão jurídica.", date: "2026-08-16", user: "Você" },
    ],
    notes: [
      { id: "n7", content: "Jurídico da LogMov costuma demorar 3 semanas para aprovações. Calcular no cronograma.", date: "2026-08-19", user: "Você" },
    ],
  },
];

export const pipelineStages: { id: DealStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "#94a3b8" },
  { id: "qualified", label: "Qualificado", color: "#60a5fa" },
  { id: "proposal", label: "Proposta", color: "#a78bfa" },
  { id: "negotiation", label: "Negociação", color: "#fb923c" },
  { id: "won", label: "Ganho", color: "#34d399" },
  { id: "lost", label: "Perdido", color: "#f87171" },
];
