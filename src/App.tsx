import { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from "recharts";
import { clients as initialClients, pipelineStages, type Client } from "./data";

// ── Types ─────────────────────────────────────────────────────────────────────

type View = "dashboard" | "inbox" | "leads" | "clients" | "projects" | "messages"
          | "tasks" | "calendar" | "financial" | "domains" | "pipeline" | "analytics" | "goals";
type Range = "1D" | "7D" | "14D" | "1M" | "3M" | "6M" | "1A";
type NavItem = { id: string; label: string; icon: string; badge?: string };
type NavGroup = { label?: string; items: NavItem[] };

// ── Nav config ────────────────────────────────────────────────────────────────

const navGroups: NavGroup[] = [
  { items: [{ id: "dashboard", label: "Dashboard", icon: "⊞" }, { id: "inbox", label: "Inbox", icon: "⊡", badge: "3" }] },
  { label: "RELACIONAMENTO", items: [
    { id: "leads", label: "Leads", icon: "◉", badge: "12" },
    { id: "clients", label: "Clientes", icon: "◎" },
    { id: "projects", label: "Projetos", icon: "◇" },
    { id: "messages", label: "Mensagens", icon: "⌁", badge: "2" },
  ]},
  { label: "ANÁLISE", items: [
    { id: "analytics", label: "Analytics", icon: "◈" },
    { id: "goals", label: "Metas & OKRs", icon: "◬" },
  ]},
  { label: "GESTÃO", items: [
    { id: "tasks", label: "Tarefas", icon: "✓", badge: "5" },
    { id: "calendar", label: "Calendário", icon: "▭" },
    { id: "financial", label: "Financeiro", icon: "◒" },
    { id: "domains", label: "Domínios", icon: "⌘" },
  ]},
];

// ── Status ────────────────────────────────────────────────────────────────────

const statusConfig = {
  active:   { label: "Ativo",    cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/15" },
  inactive: { label: "Inativo",  cls: "bg-rose-50 text-rose-700 ring-rose-600/15" },
  prospect: { label: "Prospect", cls: "bg-violet-50 text-violet-700 ring-violet-600/15" },
};

// ── Static data ───────────────────────────────────────────────────────────────

const quickNotes = [
  { id: 1, text: "Preparar proposta revisada para Construtech BH", time: "09:42", done: false },
  { id: 2, text: "Confirmar reunião de kick-off da Vita Clinic", time: "ontem", done: false },
  { id: 3, text: "Enviar resumo de performance para Nexus Digital", time: "ontem", done: true },
];

const leadRows = [
  { name: "Marina Silveira",  company: "Casa Nativa",       source: "Instagram", status: "Novo",        score: 91, time: "18 min" },
  { name: "Gustavo Henrique", company: "Horizon Solar",     source: "Indicação", status: "Qualificado", score: 84, time: "1h 22m" },
  { name: "Renata Alves",     company: "Vita Clinic",       source: "Site",      status: "Em contato",  score: 72, time: "2h 10m" },
  { name: "Bruno Melo",       company: "Norte Engenharia",  source: "Google",    status: "Novo",        score: 58, time: "5h 04m" },
  { name: "Fernanda Lima",    company: "MedTech Brasil",    source: "LinkedIn",  status: "Qualificado", score: 76, time: "3h 11m" },
  { name: "Ricardo Saraiva",  company: "Primavera Agro",    source: "Evento",    status: "Novo",        score: 44, time: "1 dia" },
];

const projects = [
  { name: "Nexus Insights",    client: "Nexus Digital",         type: "CRM interno",       stage: "Desenvolvimento", progress: 68,  due: "12 set",  color: "#6366f1" },
  { name: "Casa Nativa",       client: "Casa Nativa",           type: "Landing page",      stage: "Design",          progress: 42,  due: "29 ago",  color: "#a855f7" },
  { name: "LogMov Portal",     client: "LogMov Transportes",    type: "Portal B2B",        stage: "Briefing",        progress: 15,  due: "18 set",  color: "#0ea5e9" },
  { name: "Studio Arco 2.0",  client: "Studio Arco",           type: "Site institucional", stage: "Publicado",       progress: 100, due: "Concluído", color: "#10b981" },
  { name: "Bem Estar ERP",     client: "Farmácias Bem Estar",   type: "Sistema ERP",       stage: "Briefing",        progress: 8,   due: "30 out",  color: "#f59e0b" },
];

const tasksData = [
  { id: 1, text: "Revisar proposta — Construtech BH",      priority: "alta",  category: "Clientes",    due: "Hoje",   done: false },
  { id: 2, text: "Follow-up lead — Casa Nativa",           priority: "alta",  category: "Leads",       due: "Hoje",   done: false },
  { id: 3, text: "Aprovar layout — Nexus Insights",        priority: "média", category: "Projetos",    due: "27 ago", done: false },
  { id: 4, text: "Cobrar mensalidade — Studio Arco",       priority: "alta",  category: "Financeiro",  due: "Hoje",   done: false },
  { id: 5, text: "Agendar discovery — Horizon Solar",      priority: "média", category: "Leads",       due: "28 ago", done: false },
  { id: 6, text: "Atualizar proposta — LogMov Portal",     priority: "baixa", category: "Projetos",    due: "30 ago", done: true  },
  { id: 7, text: "Enviar NF — Nexus Digital",              priority: "alta",  category: "Financeiro",  due: "29 ago", done: false },
];

const goals = [
  {
    id: "g1", objective: "Crescimento de receita Q3 2026", due: "Set 2026", status: "on-track" as const,
    keyResults: [
      { label: "MRR de R$ 45.000",           progress: 85,  target: "R$ 45k",    current: "R$ 38,4k" },
      { label: "10 novos clientes ativos",   progress: 60,  target: "10 clientes", current: "6 clientes" },
      { label: "Churn abaixo de 2%",         progress: 100, target: "< 2%",       current: "0%" },
    ],
  },
  {
    id: "g2", objective: "Excelência operacional", due: "Out 2026", status: "at-risk" as const,
    keyResults: [
      { label: "NPS acima de 70",                  progress: 77, target: "NPS 70",  current: "NPS 54" },
      { label: "Tempo de resposta < 30 min",       progress: 70, target: "< 30 min", current: "42 min" },
      { label: "100% dos projetos no prazo",        progress: 75, target: "100%",    current: "75%" },
    ],
  },
  {
    id: "g3", objective: "Expansão e aquisição", due: "Dez 2026", status: "off-track" as const,
    keyResults: [
      { label: "Pipeline acima de R$ 800k",        progress: 100, target: "R$ 800k",     current: "R$ 838k" },
      { label: "Taxa de conversão > 25%",          progress: 56,  target: "> 25%",         current: "14%" },
      { label: "3 parcerias estratégicas",         progress: 33,  target: "3 parcerias",  current: "1 parceria" },
    ],
  },
];

const goalStatusCfg = {
  "on-track":  { label: "No Prazo",  bg: "bg-emerald-50 text-emerald-700", dot: "#10b981" },
  "at-risk":   { label: "Em Risco",  bg: "bg-amber-50 text-amber-700",     dot: "#f59e0b" },
  "off-track": { label: "Atrasado",  bg: "bg-rose-50 text-rose-700",       dot: "#f43f5e" },
};

const conversionFunnel = [
  { stage: "Visitantes",          count: 4820, pct: 100  },
  { stage: "Leads capturados",    count: 342,  pct: 7.1  },
  { stage: "Qualificados",        count: 98,   pct: 28.7 },
  { stage: "Propostas enviadas",  count: 44,   pct: 44.9 },
  { stage: "Contratos fechados",  count: 12,   pct: 27.3 },
];

const acquisitionChannels = [
  { channel: "Indicação",   value: 38, color: "#6366f1" },
  { channel: "LinkedIn",    value: 24, color: "#60a5fa" },
  { channel: "Orgânico",    value: 18, color: "#34d399" },
  { channel: "Evento",      value: 12, color: "#f59e0b" },
  { channel: "Mídia paga",  value: 8,  color: "#a78bfa" },
];

const invoices = [
  { client: "Nexus Digital",        amount: 14800, due: "30/ago", status: "pendente"  as const, id: "INV-2026-041" },
  { client: "LogMov Transportes",   amount: 22400, due: "02/set", status: "pendente"  as const, id: "INV-2026-040" },
  { client: "Studio Arco",          amount: 3200,  due: "24/ago", status: "pago"      as const, id: "INV-2026-039" },
  { client: "Construtech BH",       amount: 8400,  due: "15/set", status: "vencendo"  as const, id: "INV-2026-042" },
  { client: "Agro Futuro",          amount: 4800,  due: "10/ago", status: "atrasado"  as const, id: "INV-2026-038" },
];

const domainsData = [
  { domain: "nexusinsights.com.br", client: "Nexus Digital",       expires: 142, ssl: true,  registrar: "Registro.br" },
  { domain: "casanativa.com.br",    client: "Casa Nativa",         expires: 81,  ssl: true,  registrar: "Registro.br" },
  { domain: "logmov.com.br",        client: "LogMov Transportes",  expires: 227, ssl: true,  registrar: "GoDaddy"     },
  { domain: "studioarco.design",    client: "Studio Arco",         expires: 18,  ssl: true,  registrar: "Namecheap"   },
  { domain: "construtech.com.br",   client: "Construtech BH",      expires: 64,  ssl: false, registrar: "Registro.br" },
  { domain: "agrofuturo.ag",        client: "Agro Futuro",         expires: 312, ssl: true,  registrar: "GoDaddy"     },
];

const calendarEvents = [
  { day: 26, title: "Check-in Nexus Digital",     time: "09:30", color: "#6366f1" },
  { day: 26, title: "Discovery — Horizon Solar",  time: "11:00", color: "#60a5fa" },
  { day: 26, title: "Revisão Casa Nativa",        time: "14:30", color: "#a855f7" },
  { day: 27, title: "Proposta — Construtech",     time: "10:00", color: "#f59e0b" },
  { day: 28, title: "Call LogMov",                time: "15:00", color: "#0ea5e9" },
  { day: 29, title: "NF — Nexus Digital",         time: "09:00", color: "#10b981" },
  { day: 3,  title: "Reunião Studio Arco",        time: "14:00", color: "#6366f1" },
  { day: 12, title: "Vencimento — Nexus Insights",time: "00:00", color: "#f43f5e" },
];

// ── Financial chart data ───────────────────────────────────────────────────────

const financialData: Record<Range, { label: string; revenue: number; mrr: number }[]> = {
  "1D": [
    { label: "8h",  revenue: 3200,  mrr: 38400 }, { label: "9h",  revenue: 8400,  mrr: 38400 },
    { label: "10h", revenue: 12100, mrr: 38400 }, { label: "11h", revenue: 9800,  mrr: 38400 },
    { label: "12h", revenue: 6200,  mrr: 38400 }, { label: "13h", revenue: 14800, mrr: 38400 },
    { label: "14h", revenue: 18200, mrr: 38400 }, { label: "15h", revenue: 22400, mrr: 38400 },
    { label: "16h", revenue: 16800, mrr: 38400 }, { label: "17h", revenue: 19600, mrr: 38400 },
    { label: "18h", revenue: 11200, mrr: 38400 },
  ],
  "7D": [
    { label: "Seg", revenue: 28400, mrr: 38400 }, { label: "Ter", revenue: 31200, mrr: 38400 },
    { label: "Qua", revenue: 24800, mrr: 38400 }, { label: "Qui", revenue: 38600, mrr: 38400 },
    { label: "Sex", revenue: 42200, mrr: 38400 }, { label: "Sáb", revenue: 18600, mrr: 38400 },
    { label: "Dom", revenue: 9800,  mrr: 38400 },
  ],
  "14D": [
    { label: "13/ago", revenue: 32400, mrr: 38400 }, { label: "14/ago", revenue: 28800, mrr: 38400 },
    { label: "15/ago", revenue: 41200, mrr: 38400 }, { label: "16/ago", revenue: 38600, mrr: 38400 },
    { label: "17/ago", revenue: 44800, mrr: 38400 }, { label: "18/ago", revenue: 51200, mrr: 38400 },
    { label: "19/ago", revenue: 48400, mrr: 38400 }, { label: "20/ago", revenue: 22800, mrr: 38400 },
    { label: "21/ago", revenue: 18400, mrr: 38400 }, { label: "22/ago", revenue: 56800, mrr: 38400 },
    { label: "23/ago", revenue: 62400, mrr: 38400 }, { label: "24/ago", revenue: 58200, mrr: 38400 },
    { label: "25/ago", revenue: 71200, mrr: 38400 }, { label: "26/ago", revenue: 43600, mrr: 38400 },
  ],
  "1M": [
    { label: "01/ago", revenue: 44200, mrr: 38400 }, { label: "08/ago", revenue: 52800, mrr: 38400 },
    { label: "15/ago", revenue: 48600, mrr: 38400 }, { label: "22/ago", revenue: 61400, mrr: 38400 },
    { label: "26/ago", revenue: 43600, mrr: 38400 },
  ],
  "3M": [
    { label: "Jun S1", revenue: 68400, mrr: 36000 }, { label: "Jun S2", revenue: 74200, mrr: 36000 },
    { label: "Jun S3", revenue: 71800, mrr: 36000 }, { label: "Jun S4", revenue: 79600, mrr: 36000 },
    { label: "Jul S1", revenue: 82400, mrr: 37200 }, { label: "Jul S2", revenue: 88200, mrr: 37200 },
    { label: "Jul S3", revenue: 85600, mrr: 37200 }, { label: "Jul S4", revenue: 91800, mrr: 37200 },
    { label: "Ago S1", revenue: 94200, mrr: 38400 }, { label: "Ago S2", revenue: 98600, mrr: 38400 },
    { label: "Ago S3", revenue: 102400, mrr: 38400 }, { label: "Ago S4", revenue: 108800, mrr: 38400 },
  ],
  "6M": [
    { label: "Mar", revenue: 241000, mrr: 33200 }, { label: "Abr", revenue: 268000, mrr: 34800 },
    { label: "Mai", revenue: 294000, mrr: 35600 }, { label: "Jun", revenue: 293800, mrr: 36000 },
    { label: "Jul", revenue: 347900, mrr: 37200 }, { label: "Ago", revenue: 403800, mrr: 38400 },
  ],
  "1A": [
    { label: "Set/25", revenue: 198400, mrr: 28400 }, { label: "Out/25", revenue: 214200, mrr: 29600 },
    { label: "Nov/25", revenue: 228600, mrr: 30800 }, { label: "Dez/25", revenue: 286400, mrr: 31200 },
    { label: "Jan/26", revenue: 241800, mrr: 32000 }, { label: "Fev/26", revenue: 258200, mrr: 33200 },
    { label: "Mar/26", revenue: 241000, mrr: 33200 }, { label: "Abr/26", revenue: 268000, mrr: 34800 },
    { label: "Mai/26", revenue: 294000, mrr: 35600 }, { label: "Jun/26", revenue: 293800, mrr: 36000 },
    { label: "Jul/26", revenue: 347900, mrr: 37200 }, { label: "Ago/26", revenue: 403800, mrr: 38400 },
  ],
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function money(v: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v); }
function dateShort(v: string) { return new Date(v + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); }
function yearsWith(v: string) { return Math.max(1, Math.floor((Date.now() - new Date(v).getTime()) / 31557600000)); }
function healthScore(c: Client) {
  let s = c.status === "active" ? 40 : c.status === "prospect" ? 22 : 5;
  const days = Math.floor((Date.now() - new Date(c.lastContact).getTime()) / 86400000);
  s += Math.max(0, 30 - Math.min(30, days * 1.5));
  s += Math.min(20, c.activities.length * 4);
  s += Math.min(10, c.deals.filter(d => d.stage !== "lost").length * 5);
  return Math.min(100, Math.round(s));
}
function healthColor(s: number) { return s >= 70 ? "#10b981" : s >= 40 ? "#f59e0b" : "#f43f5e"; }

// ── Avatar ─────────────────────────────────────────────────────────────────────

const avatarGrads: Record<string, string> = {
  SO: "from-indigo-500 to-violet-600", RM: "from-sky-500 to-blue-600",
  CT: "from-rose-400 to-pink-600",     PL: "from-orange-400 to-amber-600",
  AB: "from-teal-400 to-emerald-600",  LF: "from-violet-500 to-fuchsia-600",
};
function Avatar({ initials, size = "md" }: { initials: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const sz = { xs: "h-7 w-7 text-[9px]", sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-14 w-14 text-sm" };
  return <div className={`${sz[size]} shrink-0 rounded-full bg-gradient-to-br ${avatarGrads[initials] ?? "from-slate-500 to-slate-700"} grid place-items-center font-semibold text-white`}>{initials}</div>;
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) { return <p className="font-mono text-[10px] font-medium tracking-[.12em] text-slate-400 uppercase">{children}</p>; }
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_4px_rgba(15,23,42,.05),0_1px_2px_rgba(15,23,42,.03)] ${className}`}>{children}</section>;
}
function Page({ children }: { children: React.ReactNode }) { return <main className="flex-1 overflow-y-auto"><div className="mx-auto max-w-[1480px] p-5 md:p-8">{children}</div></main>; }
function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <header className="mb-7 flex items-end justify-between gap-4"><div>{eyebrow && <Label>{eyebrow}</Label>}<h1 className="mt-1.5 text-[27px] font-semibold tracking-[-.055em] text-slate-950">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>{action}</header>;
}
function Metric({ label, value, detail, trend }: { label: string; value: string; detail: string; trend?: string }) {
  return <Card className="p-5"><Label>{label}</Label><div className="mt-3 flex items-end justify-between"><p className="text-[23px] font-semibold leading-none tracking-[-.055em] text-slate-950">{value}</p>{trend && <span className="rounded-lg bg-emerald-50 px-2 py-1 font-mono text-[10px] text-emerald-700">↑ {trend}</span>}</div><p className="mt-2 text-[11px] text-slate-400">{detail}</p></Card>;
}
function HealthBar({ score }: { score: number }) {
  return <div className="flex items-center gap-2"><div className="h-1.5 w-14 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${score}%`, background: healthColor(score) }} /></div><span className="font-mono text-[10px] font-medium" style={{ color: healthColor(score) }}>{score}</span></div>;
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────

function ChartTip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
      <p className="mb-2 font-mono text-[10px] text-slate-400">{label}</p>
      {payload.map((p, i) => <p key={i} className={`text-sm font-semibold ${i === 0 ? "text-indigo-600" : "text-emerald-600"}`}>{money(p.value)}</p>)}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ view, onView, dark, toggleDark, backup, restore }: { view: View; onView: (v: View) => void; dark: boolean; toggleDark: () => void; backup: () => void; restore: (file: File) => void }) {
  return (
    <aside className="hidden h-full w-[228px] shrink-0 flex-col border-r border-white/[.05] bg-[#0f1117] lg:flex">
      <div className="flex h-[68px] items-center gap-3 border-b border-white/[.05] px-5">
        <div className="grid h-7 w-7 place-items-center rounded-[8px] bg-indigo-500 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/25">C</div>
        <div><p className="text-[13px] font-semibold tracking-[-0.03em] text-white">Cohort</p><p className="font-mono text-[9px] tracking-[.14em] text-slate-600">CRM STUDIO</p></div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && <p className="mb-1.5 px-3 font-mono text-[9px] font-medium tracking-[.16em] text-slate-600">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = view === item.id || (view === "pipeline" && item.id === "leads");
                return (
                  <button key={item.id} onClick={() => onView(item.id as View)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-all duration-150 ${active ? "bg-white/[.10] text-white" : "text-slate-500 hover:bg-white/[.04] hover:text-slate-200"}`}>
                    <span className={`grid h-4 w-4 shrink-0 place-items-center text-[14px] ${active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`}>{item.icon}</span>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center font-mono text-[9px] ${active ? "bg-indigo-400/20 text-indigo-300" : "bg-white/[.05] text-slate-600"}`}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/[.05] p-3">
        <button onClick={toggleDark} className="mb-2 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-slate-400 transition hover:bg-white/[.05] hover:text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[.06] text-sm">{dark ? "☀" : "☾"}</span>
          {dark ? "Usar tema claro" : "Usar tema escuro"}
        </button>
        <div className="mb-2 grid grid-cols-2 gap-1">
          <button onClick={backup} className="rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-500 transition hover:bg-white/[.05] hover:text-white">Exportar backup</button>
          <label className="cursor-pointer rounded-lg px-2 py-1.5 text-center text-[10px] font-medium text-slate-500 transition hover:bg-white/[.05] hover:text-white">Restaurar<input type="file" accept="application/json" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) restore(file); event.currentTarget.value = ""; }} /></label>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl p-2.5 transition hover:bg-white/[.04] cursor-pointer">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-semibold text-white">VC</div>
          <div className="min-w-0 flex-1"><p className="text-xs font-medium text-white">Victor</p><p className="font-mono text-[9px] text-slate-500">Administrador</p></div>
          <span className="text-slate-600 text-xs">⋯</span>
        </div>
      </div>
    </aside>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ clients, openClient, onView, createClient }: { clients: Client[]; openClient: (c: Client) => void; onView: (v: View) => void; createClient: () => void }) {
  const pipeline = clients.flatMap(c => c.deals).filter(d => !["won", "lost"].includes(d.stage));
  const total = clients.reduce((s, c) => s + c.revenue, 0);
  return (
    <Page>
      <PageHeader eyebrow="TERÇA · 26 AGO 2026" title="Bom dia, Victor." description="Sua operação está saudável. 3 alertas precisam de atenção." action={<button onClick={createClient} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[.98]">+ Criar novo</button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="RECEITA TOTAL" value={money(total)} detail="acumulado da carteira" trend="12,4%" />
        <Metric label="MRR · AGO" value="R$ 38.400" detail="recorrência mensal" trend="8,1%" />
        <Metric label="PIPELINE ATIVO" value={money(pipeline.reduce((s,d)=>s+d.value,0))} detail={`${pipeline.length} oportunidades em curso`} />
        <Metric label="CHURN RISK" value="1 conta" detail="Agro Futuro · 87 dias sem contato" />
        <Metric label="TEMPO RESPOSTA" value="42 min" detail="média últimos 7 dias" trend="18%" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_.85fr]">
        <Card className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div><h2 className="text-sm font-semibold">Receita & MRR</h2><p className="mt-0.5 text-xs text-slate-400">Mar — Ago 2026</p></div>
            <button onClick={() => onView("financial")} className="font-mono text-[10px] text-indigo-600 hover:text-indigo-800">VER TUDO →</button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={financialData["6M"]} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="dRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.14} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                <linearGradient id="dMrr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.1} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${Math.round(v/1000)}k`} tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#dRev)" dot={false} />
              <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={1.5} fill="url(#dMrr)" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-5">
            <div className="flex items-center gap-2"><div className="h-0.5 w-6 rounded bg-indigo-500" /><span className="font-mono text-[10px] text-slate-400">Receita</span></div>
            <div className="flex items-center gap-2"><div className="h-0.5 w-6" style={{ borderTop: "2px dashed #10b981" }} /><span className="font-mono text-[10px] text-slate-400">MRR</span></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold">Atenção necessária</h2><span className="grid h-6 w-6 place-items-center rounded-full bg-amber-50 text-xs text-amber-500">✦</span></div>
          <div className="space-y-2">
            {[
              { icon: "⚡", title: "Proposta vence amanhã",       sub: "Construtech BH · R$ 64.000",      action: "clients"  as View },
              { icon: "◑", title: "Lead sem resposta há 4h",      sub: "Bruno Melo · Norte Engenharia",   action: "leads"    as View },
              { icon: "◒", title: "Fatura vencida há 16 dias",    sub: "Agro Futuro · R$ 4.800",          action: "financial"as View },
              { icon: "⊡", title: "Domínio vence em 18 dias",    sub: "studioarco.design",                action: "domains"  as View },
            ].map(x => (
              <button key={x.title} onClick={() => onView(x.action)} className="flex w-full items-start gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40">
                <span className="mt-0.5 text-sm">{x.icon}</span>
                <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-800">{x.title}</p><p className="mt-0.5 text-[11px] text-slate-400">{x.sub}</p></div>
              </button>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.9fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div><h2 className="text-sm font-semibold">Clientes</h2><p className="mt-0.5 text-xs text-slate-400">Por último contato · com health score</p></div>
            <button onClick={() => onView("clients")} className="font-mono text-[10px] text-indigo-600">TODOS →</button>
          </div>
          {[...clients].sort((a,b) => b.lastContact.localeCompare(a.lastContact)).slice(0,5).map(c => {
            const hs = healthScore(c);
            return (
              <button key={c.id} onClick={() => openClient(c)} className="flex w-full items-center gap-3 border-b border-slate-50 px-6 py-3 text-left transition hover:bg-slate-50/80 last:border-0">
                <Avatar initials={c.avatar} size="sm" />
                <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-800">{c.name}</p><p className="text-[11px] text-slate-400">{c.company}</p></div>
                <HealthBar score={hs} />
                <span className="ml-1 font-mono text-[10px] text-slate-400">{dateShort(c.lastContact)}</span>
                <span className="text-slate-300 text-sm">›</span>
              </button>
            );
          })}
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="text-sm font-semibold">Pipeline por etapa</h2><button onClick={() => onView("pipeline")} className="font-mono text-[10px] text-indigo-600">KANBAN →</button></div>
          <div className="space-y-3.5">
            {pipelineStages.slice(0,4).map(s => {
              const ds = pipeline.filter(d => d.stage === s.id);
              return (
                <div key={s.id}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} /><span className="text-slate-600">{s.label}</span></div>
                    <span className="font-mono text-slate-400">{ds.length} · {money(ds.reduce((a,d)=>a+d.value,0))}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(6,ds.length*30)}%`, background: s.color }} /></div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 border border-indigo-100/60">
            <Label>PREVISÃO Q4</Label>
            <p className="mt-2 text-xl font-semibold tracking-tight text-indigo-900">R$ 838.000</p>
            <p className="mt-0.5 text-[11px] text-indigo-500/70">em negociação · fechamento médio 45 dias</p>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

function Inbox({ notes, setNotes, onView, createTask }: { notes: typeof quickNotes; setNotes: (next: typeof quickNotes) => void; onView: (view: View) => void; createTask: () => void }) {
  const [draft, setDraft] = useState("");
  const add = () => { if (draft.trim()) { setNotes([{ id: Date.now(), text: draft, time: "agora", done: false }, ...notes]); setDraft(""); } };
  return (
    <Page>
      <PageHeader eyebrow="CAPTURE, DEPOIS ORGANIZE" title="Inbox" description="Anotações rápidas para tirar da cabeça e transformar em ação." />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } }} placeholder="O que você precisa lembrar?" className="min-h-28 w-full resize-none text-lg font-medium tracking-tight text-slate-800 outline-none placeholder:text-slate-300" />
            <div className="mt-3 flex items-center justify-between"><span className="font-mono text-[10px] text-slate-400">ENTER PARA ADICIONAR</span><button onClick={add} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700">Adicionar</button></div>
          </div>
          <div className="divide-y divide-slate-100">
            {notes.map(n => (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50/60 ${n.done ? "opacity-50" : ""}`}>
                <button onClick={() => setNotes(notes.map(x => x.id === n.id ? { ...x, done: !x.done } : x))} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] transition ${n.done ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent hover:border-indigo-400"}`}>✓</button>
                <p className={`flex-1 text-sm leading-relaxed ${n.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{n.text}</p>
                <span className="font-mono text-[10px] text-slate-400">{n.time}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5"><Label>HOJE</Label><p className="mt-2 text-3xl font-semibold tracking-[-.05em]">{notes.filter(n=>!n.done).length} capturas</p><p className="mt-1 text-sm text-slate-400">Prontas para organizar.</p></Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Atalhos rápidos</h2>
            <div className="grid grid-cols-2 gap-2">
              {[{ label: "+ Nova tarefa", action: createTask }, { label: "◫ Agendar", action: () => onView("calendar") }, { label: "⌁ Mensagem", action: () => onView("messages") }, { label: "◇ Projeto", action: () => onView("projects") }].map(x => (
                <button key={x.label} onClick={x.action} className="rounded-xl border border-slate-200 px-3 py-3 text-left text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50/40">{x.label}</button>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-3">Progresso do dia</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.round(notes.filter(n=>n.done).length/notes.length*100)}%` }} /></div>
              <span className="font-mono text-[10px] text-slate-500">{notes.filter(n=>n.done).length}/{notes.length}</span>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

// ── Leads ─────────────────────────────────────────────────────────────────────

function Leads({ onPipeline, rows: leadItems, createLead, editLead }: { onPipeline: () => void; rows: typeof leadRows; createLead: () => void; editLead: (lead: (typeof leadRows)[number]) => void }) {
  const [filter, setFilter] = useState("Todos");
  const rows = filter === "Todos" ? leadItems : leadItems.filter(x => x.status === filter);
  return (
    <Page>
      <PageHeader eyebrow="AQUISIÇÃO" title="Leads" description="Velocidade, qualificação e próximos passos em tempo real." action={<div className="flex gap-2"><button onClick={onPipeline} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300">Kanban pipeline →</button><button onClick={createLead} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700">+ Novo lead</button></div>} />
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <Metric label="NOVOS ESTA SEMANA" value="24" detail="+6 vs. semana anterior" trend="33%" />
        <Metric label="TAXA DE QUALIFICAÇÃO" value="68%" detail="16 leads com potencial" trend="4,2%" />
        <Metric label="1ª RESPOSTA MÉDIA" value="42 min" detail="meta: abaixo de 1 hora" trend="18%" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {["Todos", "Novo", "Qualificado", "Em contato"].map(x => (
              <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === x ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{x}</button>
            ))}
          </div>
          <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300">⌘ Filtros</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="border-b border-slate-100"><tr>{["Lead", "Origem", "Status", "Score", "1ª resposta", ""].map(h => <th key={h} className="px-5 py-3 font-mono text-[10px] font-medium tracking-wider text-slate-400">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(x => (
                <tr key={`${x.name}-${x.company}`} onClick={() => editLead(x)} className="cursor-pointer border-b border-slate-50 last:border-0 transition hover:bg-slate-50/80">
                  <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-800">{x.name}</p><p className="text-[11px] text-slate-400">{x.company}</p></td>
                  <td className="px-5 text-xs text-slate-500">{x.source}</td>
                  <td className="px-5"><span className="rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-[10px] text-indigo-700">{x.status}</span></td>
                  <td className="px-5">
                    <div className="flex items-center gap-2"><span className="font-mono text-xs text-slate-700">{x.score}</span><div className="h-1.5 w-16 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${x.score}%` }} /></div></div>
                  </td>
                  <td className="px-5 font-mono text-xs text-slate-500">{x.time}</td>
                  <td className="px-5 text-right text-slate-300">›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

// ── Clients ────────────────────────────────────────────────────────────────────

function Clients({ clients, openClient, createClient }: { clients: Client[]; openClient: (c: Client) => void; createClient: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const filtered = useMemo(() => {
    let list = clients.filter(c => (filter === "all" || c.status === filter) && `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === "revenue") list = [...list].sort((a,b) => b.revenue - a.revenue);
    if (sort === "health") list = [...list].sort((a,b) => healthScore(b) - healthScore(a));
    if (sort === "recent") list = [...list].sort((a,b) => b.lastContact.localeCompare(a.lastContact));
    return list;
  }, [clients, query, filter, sort]);
  return (
    <Page>
      <PageHeader eyebrow="BASE DE RELACIONAMENTO" title="Clientes" description={`${clients.length} empresas em carteira`} action={<button onClick={createClient} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700">+ Novo cliente</button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
          <span className="text-slate-400">⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)} className="w-full py-2.5 text-sm outline-none placeholder:text-slate-400" placeholder="Buscar clientes, empresas…" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none shadow-sm">
          <option value="all">Todos os status</option><option value="active">Ativos</option><option value="prospect">Prospects</option><option value="inactive">Inativos</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none shadow-sm">
          <option value="recent">Por contato recente</option><option value="revenue">Por receita</option><option value="health">Por health score</option>
        </select>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="border-b border-slate-100"><tr>{["Cliente", "Status", "Projeto atual", "Receita total", "Health", "Último contato", ""].map(h => <th key={h} className="px-5 py-3 font-mono text-[10px] font-medium tracking-wider text-slate-400">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(c => {
                const project = projects.find(p => p.client === c.company);
                const hs = healthScore(c);
                return (
                  <tr key={c.id} onClick={() => openClient(c)} className="cursor-pointer border-b border-slate-50 transition hover:bg-indigo-50/30 last:border-0">
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar initials={c.avatar} size="sm" /><div><p className="text-sm font-semibold text-slate-800">{c.name}</p><p className="text-[11px] text-slate-400">{c.company}</p></div></div></td>
                    <td className="px-5"><span className={`rounded-full px-2.5 py-1 font-mono text-[10px] ring-1 ${statusConfig[c.status].cls}`}>{statusConfig[c.status].label}</span></td>
                    <td className="px-5 text-xs text-slate-500">{project ? <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: project.color }} />{project.stage}</span> : "—"}</td>
                    <td className="px-5 font-mono text-xs text-slate-700">{c.revenue ? money(c.revenue) : "—"}</td>
                    <td className="px-5"><HealthBar score={hs} /></td>
                    <td className="px-5 font-mono text-xs text-slate-400">{dateShort(c.lastContact)}</td>
                    <td className="px-5 text-right text-slate-300">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────

function Projects() {
  const stages = ["Briefing", "Design", "Desenvolvimento", "Publicado"];
  return (
    <Page>
      <PageHeader eyebrow="ENTREGA" title="Projetos" description="Do briefing à publicação, sem perder o fio." action={<button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">+ Novo projeto</button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stages.map((stage, i) => {
          const ps = projects.filter(p => p.stage === stage);
          const colors = ["#0ea5e9","#a855f7","#6366f1","#10b981"];
          return (
            <Card key={stage} className="p-5">
              <div className="flex items-center gap-2 mb-4"><span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} /><span className="font-mono text-[10px] text-slate-400">{stage.toUpperCase()}</span></div>
              {ps.length === 0 ? <p className="text-xs text-slate-300">Sem projetos</p> : ps.map(p => (
                <div key={p.name} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{p.client} · {p.type}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }} /></div>
                    <span className="font-mono text-[10px] text-slate-400">{p.progress}%</span>
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] text-slate-400">Prazo: {p.due}</p>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h2 className="text-sm font-semibold">Todos os projetos</h2><p className="mt-0.5 text-xs text-slate-400">{projects.length} projetos ativos</p></div></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="border-b border-slate-100"><tr>{["Projeto", "Cliente", "Tipo", "Etapa", "Prazo", "Progresso"].map(h => <th key={h} className="px-5 py-3 font-mono text-[10px] font-medium tracking-wider text-slate-400">{h}</th>)}</tr></thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.name} className="border-b border-slate-50 last:border-0 transition hover:bg-slate-50/60">
                  <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} /><span className="text-sm font-semibold text-slate-800">{p.name}</span></div></td>
                  <td className="px-5 text-xs text-slate-500">{p.client}</td>
                  <td className="px-5 text-xs text-slate-500">{p.type}</td>
                  <td className="px-5"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-500">{p.stage}</span></td>
                  <td className="px-5 font-mono text-xs text-slate-400">{p.due}</td>
                  <td className="px-5"><div className="flex items-center gap-3"><div className="h-1.5 w-24 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }} /></div><span className="font-mono text-[10px] text-slate-500">{p.progress}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────

function Messages() {
  const [selected, setSelected] = useState("Nexus Digital");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState<Record<string, string[]>>({});
  const send = () => { const text = msg.trim(); if (!text) return; setSent(current => ({ ...current, [selected]: [...(current[selected] || []), text] })); setMsg(""); };
  const convos = [
    { name: "Nexus Digital",       preview: "Sim, retorno até quinta com a decisão.", unread: true  },
    { name: "Construtech BH",      preview: "Podemos ajustar o escopo?",              unread: false },
    { name: "Farmácias Bem Estar", preview: "Quando podemos agendar a demo?",         unread: true  },
    { name: "Studio Arco",         preview: "Adorei o resultado! Obrigada.",          unread: false },
  ];
  return (
    <Page>
      <PageHeader eyebrow="WHATSAPP BUSINESS" title="Mensagens" description="Conversas, lembretes e automações." action={<button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">⚙ Automações</button>} />
      <Card className="grid h-[580px] overflow-hidden md:grid-cols-[260px_1fr]">
        <div className="border-r border-slate-100">
          <div className="border-b border-slate-100 p-4"><input className="w-full rounded-xl bg-slate-100 px-3 py-2 text-xs outline-none placeholder:text-slate-400" placeholder="Buscar conversa…" /></div>
          {convos.map(c => (
            <button key={c.name} onClick={() => setSelected(c.name)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${selected === c.name ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-semibold text-white">{c.name.slice(0,2)}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{c.name}</p><p className="truncate text-[11px] text-slate-400">{c.preview}</p></div>
              {c.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
            </button>
          ))}
          <div className="border-t border-slate-100 p-4">
            <p className="mb-2 font-mono text-[10px] text-slate-400">AUTOMAÇÕES ATIVAS</p>
            {["Follow-up 24h", "Boas-vindas novo lead"].map(a => (
              <div key={a} className="flex items-center gap-2 py-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-[11px] text-slate-600">{a}</span></div>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div><p className="text-sm font-semibold">{selected}</p><p className="text-[11px] text-emerald-600">● WhatsApp conectado</p></div>
            <button className="text-slate-400">•••</button>
          </div>
          <div className="flex-1 space-y-4 bg-[#fafbfc] p-5">
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-sm">Olá! Conseguiu revisar a proposta atualizada?</div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 p-3 text-xs leading-relaxed text-white">Sim, alinhamos internamente. Retorno até quinta com a decisão.</div>
            {(sent[selected] || []).map((text, index) => <div key={`${text}-${index}`} className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 p-3 text-xs leading-relaxed text-white">{text}</div>)}
            <p className="text-center font-mono text-[9px] text-slate-400">HOJE, 09:41</p>
          </div>
          <div className="border-t border-slate-100 p-3">
            <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1">
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} className="flex-1 px-3 py-2 text-sm outline-none" placeholder="Escreva uma mensagem…" />
              <button onClick={send} className="rounded-lg bg-indigo-600 px-4 text-xs font-medium text-white transition hover:bg-indigo-700">Enviar</button>
            </div>
          </div>
        </div>
      </Card>
    </Page>
  );
}

// ── Financial ─────────────────────────────────────────────────────────────────

function Financial() {
  const [range, setRange] = useState<Range>("6M");
  const data = financialData[range];
  const periodRevenue = data.reduce((s,d) => s+d.revenue, 0);
  const lastMrr = data[data.length-1]?.mrr ?? 0;
  const maxClientRevenue = Math.max(...initialClients.map(c => c.revenue));

  const invoiceStatus = { pago: "bg-emerald-50 text-emerald-700", pendente: "bg-slate-100 text-slate-600", vencendo: "bg-amber-50 text-amber-700", atrasado: "bg-rose-50 text-rose-700" };

  return (
    <Page>
      <PageHeader eyebrow="FINANCEIRO" title="Receitas & Cobranças" description="Performance financeira, MRR e previsibilidade da operação." action={<button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">+ Novo lançamento</button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-5">
        <Metric label="RECEITA NO PERÍODO" value={money(periodRevenue)} detail="período selecionado" trend="14,2%" />
        <Metric label="MRR ATUAL" value={money(lastMrr)} detail="recorrência mensal" trend="8,1%" />
        <Metric label="FATURAS PENDENTES" value="R$ 45.800" detail="4 cobranças em aberto" />
        <Metric label="INADIMPLÊNCIA" value="R$ 4.800" detail="1 fatura em atraso" />
      </div>

      {/* Main chart */}
      <Card className="p-6 mb-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-sm font-semibold">Evolução de receita</h2><p className="mt-0.5 text-xs text-slate-400">Receita bruta e MRR recorrente</p></div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {(["1D","7D","14D","1M","3M","6M","1A"] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-3 py-1.5 font-mono text-[10px] transition ${range === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{r}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="fRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
              <linearGradient id="fMrr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.12} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${Math.round(v/1000)}k`} tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={42} />
            <Tooltip content={<ChartTip />} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#fRev)" dot={false} activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={1.5} fill="url(#fMrr)" dot={false} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex gap-6">
          <div className="flex items-center gap-2"><div className="h-0.5 w-8 rounded bg-indigo-500" /><span className="font-mono text-[10px] text-slate-400">Receita bruta</span></div>
          <div className="flex items-center gap-2"><div className="h-0.5 w-8" style={{ borderTop: "2px dashed #10b981" }} /><span className="font-mono text-[10px] text-slate-400">MRR</span></div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.25fr]">
        {/* Revenue by client */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-5">Receita por cliente</h2>
          <div className="space-y-3.5">
            {initialClients.filter(c => c.revenue > 0).sort((a,b) => b.revenue-a.revenue).map(c => (
              <div key={c.id}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <div className="flex items-center gap-2"><Avatar initials={c.avatar} size="xs" /><span className="text-slate-600">{c.company}</span></div>
                  <span className="font-mono text-slate-500">{money(c.revenue)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(c.revenue/maxClientRevenue)*100}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Invoices */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div><h2 className="text-sm font-semibold">Faturas</h2><p className="mt-0.5 text-xs text-slate-400">Cobranças ativas e historico</p></div>
            <button className="font-mono text-[10px] text-indigo-600">VER TODAS →</button>
          </div>
          {invoices.map((inv, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-5 py-3.5 last:border-0">
              <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-700">{inv.client}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">{inv.id} · vence {inv.due}</p></div>
              <p className="font-mono text-xs font-semibold text-slate-800">{money(inv.amount)}</p>
              <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] ${invoiceStatus[inv.status]}`}>{inv.status.toUpperCase()}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 bg-slate-50/60 p-5">
            <div className="grid grid-cols-2 gap-4">
              {[["PREVISTO SETEMBRO", "R$ 62.800"], ["RECEITA ANUAL PROJ.", "R$ 520k"]].map(([l,v]) => (
                <div key={l}><Label>{l}</Label><p className="mt-1.5 text-base font-semibold tracking-tight">{v}</p></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────

function Analytics() {
  return (
    <Page>
      <PageHeader eyebrow="INTELIGÊNCIA" title="Analytics" description="Aquisição, conversão e retenção numa visão estratégica." />
      <div className="grid gap-3 sm:grid-cols-4 mb-5">
        <Metric label="TAXA DE CONVERSÃO" value="14%" detail="lead → cliente fechado" />
        <Metric label="CAC MÉDIO" value="R$ 2.840" detail="custo por aquisição" />
        <Metric label="LTV MÉDIO" value="R$ 112k" detail="valor vitalício estimado" />
        <Metric label="NPS GERAL" value="54" detail="promotores − detratores" trend="8 pts" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.9fr] mb-5">
        <Card className="p-6">
          <h2 className="text-sm font-semibold">Funil de conversão</h2>
          <p className="mt-0.5 mb-6 text-xs text-slate-400">Jan – Ago 2026 · todos os canais</p>
          <div className="space-y-4">
            {conversionFunnel.map((s, i) => (
              <div key={s.stage}>
                <div className="mb-2 flex justify-between">
                  <span className="text-xs text-slate-600">{s.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-slate-400">{s.count.toLocaleString("pt-BR")}</span>
                    {i > 0 && <span className="font-mono text-[10px] font-medium text-indigo-500">{s.pct}%</span>}
                  </div>
                </div>
                <div className="h-6 overflow-hidden rounded-xl bg-slate-100">
                  <div className="h-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all" style={{ width: `${s.pct}%`, opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-sm font-semibold">Canais de aquisição</h2>
          <p className="mt-0.5 mb-5 text-xs text-slate-400">% de leads por origem</p>
          <div className="space-y-3">
            {acquisitionChannels.map(ch => (
              <div key={ch.channel} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ch.color }} />
                <span className="flex-1 text-xs text-slate-600">{ch.channel}</span>
                <span className="font-mono text-[10px] text-slate-400">{ch.value}%</span>
                <div className="w-20 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${ch.value}%`, background: ch.color }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100/60 p-4">
            <Label>WIN RATE</Label>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-indigo-900">27,3%</p>
            <p className="mt-0.5 text-[11px] text-indigo-500/70">proposta → contrato fechado</p>
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <h2 className="text-sm font-semibold mb-5">Receita por segmento</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[{ name: "Tecnologia", value: 284000 }, { name: "Logística", value: 196000 }, { name: "Construção", value: 112000 }, { name: "Agro", value: 48000 }, { name: "Design", value: 29000 }]} layout="vertical" margin={{ left: 16, right: 40, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={82} />
            <Tooltip formatter={(v: number) => [money(v), "Receita"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Page>
  );
}

// ── Goals ─────────────────────────────────────────────────────────────────────

function Goals() {
  return (
    <Page>
      <PageHeader eyebrow="ESTRATÉGIA" title="Metas & OKRs" description="Objetivos e resultados-chave que guiam sua operação." action={<button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">+ Novo objetivo</button>} />
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <Metric label="OBJETIVOS" value="3" detail="no trimestre atual" />
        <Metric label="KRS NO PRAZO" value="4 / 8" detail="50% dos resultados-chave" />
        <Metric label="PROGRESSO MÉDIO" value="74%" detail="consolidado dos OKRs" trend="6 pts" />
      </div>
      <div className="space-y-4">
        {goals.map(goal => {
          const cfg = goalStatusCfg[goal.status];
          const avg = Math.round(goal.keyResults.reduce((s,kr) => s+kr.progress, 0) / goal.keyResults.length);
          return (
            <Card key={goal.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cfg.dot }} />
                  <div><p className="text-sm font-semibold text-slate-900">{goal.objective}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">Prazo: {goal.due}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2"><div className="h-1.5 w-24 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${avg}%`, background: cfg.dot }} /></div><span className="font-mono text-[10px] text-slate-500">{avg}%</span></div>
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] ${cfg.bg}`}>{cfg.label.toUpperCase()}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-50 px-5">
                {goal.keyResults.map((kr, i) => {
                  const color = kr.progress >= 80 ? "#10b981" : kr.progress >= 50 ? "#f59e0b" : "#f43f5e";
                  return (
                    <div key={i} className="py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-slate-300">KR{i+1}</span><p className="text-xs font-medium text-slate-700">{kr.label}</p></div>
                        <div className="flex items-center gap-3"><span className="font-mono text-[10px] text-slate-400">{kr.current} / {kr.target}</span><span className="font-mono text-[10px] font-semibold" style={{ color }}>{kr.progress}%</span></div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${kr.progress}%`, background: color }} /></div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

function Tasks({ items, setItems, createTask }: { items: typeof tasksData; setItems: (next: typeof tasksData) => void; createTask: () => void }) {
  const [filter, setFilter] = useState("all");
  const priorityCfg = {
    alta:  { bg: "bg-rose-50 text-rose-600",   dot: "#f43f5e" },
    média: { bg: "bg-amber-50 text-amber-600",  dot: "#f59e0b" },
    baixa: { bg: "bg-slate-100 text-slate-500", dot: "#94a3b8" },
  };
  const filtered = filter === "all" ? items : filter === "open" ? items.filter(t=>!t.done) : items.filter(t=>t.done);
  const open = items.filter(t=>!t.done);
  return (
    <Page>
      <PageHeader eyebrow="GESTÃO" title="Tarefas" description="O que move sua operação hoje." action={<button onClick={createTask} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">+ Nova tarefa</button>} />
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <Metric label="EM ABERTO" value={`${open.length}`} detail="aguardando ação" />
        <Metric label="ALTA PRIORIDADE" value={`${open.filter(t=>t.priority==="alta").length}`} detail="urgente ou crítico" />
        <Metric label="CONCLUÍDAS" value={`${items.filter(t=>t.done).length}`} detail="neste ciclo" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {[["all","Todas"],["open","Abertas"],["done","Concluídas"]].map(([k,l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter===k?"bg-white text-slate-900 shadow-sm":"text-slate-500"}`}>{l}</button>
            ))}
          </div>
          <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-500">⌘ Filtros</button>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map(task => {
            const pc = priorityCfg[task.priority as keyof typeof priorityCfg];
            return (
              <div key={task.id} className={`flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/60 ${task.done ? "opacity-50" : ""}`}>
                <button onClick={() => setItems(items.map(t => t.id===task.id?{...t,done:!t.done}:t))} className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] transition ${task.done?"border-indigo-600 bg-indigo-600 text-white":"border-slate-300 text-transparent hover:border-indigo-400"}`}>✓</button>
                <button onClick={createTask} className="min-w-0 flex-1 text-left">
                  <p className={`text-sm ${task.done?"line-through text-slate-400":"text-slate-700 font-medium"}`}>{task.text}</p>
                  <div className="mt-0.5 flex items-center gap-2"><span className="font-mono text-[10px] text-slate-400">{task.category}</span><span className="text-slate-200">·</span><span className="font-mono text-[10px] text-slate-400">{task.due}</span></div>
                </button>
                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] ${pc.bg}`}>{task.priority.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </Page>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────

function CalendarView({ events, createEvent }: { events: typeof calendarEvents; createEvent: () => void }) {
  const [selectedDay, setSelectedDay] = useState<number>(26);
  const firstDayOfWeek = 5; // Aug 1 2026 = Saturday (Mon-based index 5)
  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const todayEvents = events.filter(e => e.day === selectedDay);
  return (
    <Page>
      <PageHeader eyebrow="AGOSTO 2026" title="Calendário" description="Agenda de relações, entregas e comprometimentos." action={<button onClick={createEvent} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">+ Novo evento</button>} />
      <div className="grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Agosto 2026</h2>
            <div className="flex gap-1"><button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-slate-300">‹</button><button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-slate-300">›</button></div>
          </div>
          <div className="grid grid-cols-7 gap-px">
            {weekdays.map(d => <div key={d} className="pb-2 text-center font-mono text-[9px] text-slate-400">{d}</div>)}
            {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e${i}`} className="h-11" />)}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const evs = events.filter(e => e.day === day);
              const isToday = day === 26;
              const isSelected = day === selectedDay;
              return (
                <button key={day} onClick={() => setSelectedDay(day)} className={`flex h-11 flex-col items-center justify-start gap-1 rounded-xl pt-2 text-xs transition ${isSelected?"bg-indigo-600 text-white":isToday?"bg-indigo-50 text-indigo-700 font-semibold":"text-slate-600 hover:bg-slate-50"}`}>
                  <span>{day}</span>
                  {evs.length > 0 && <div className="flex gap-0.5">{evs.slice(0,3).map((e,ei) => <span key={ei} className="h-1 w-1 rounded-full" style={{ background: isSelected?"rgba(255,255,255,.7)":e.color }} />)}</div>}
                </button>
              );
            })}
          </div>
        </Card>
        <div className="space-y-3">
          <Card className="p-5">
            <Label>DIA SELECIONADO</Label>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{selectedDay} de Agosto</p>
            <p className="mt-0.5 text-xs text-slate-400">{todayEvents.length > 0 ? `${todayEvents.length} evento${todayEvents.length > 1 ? "s" : ""}` : "Sem eventos agendados"}</p>
          </Card>
          {todayEvents.length > 0 ? (
            <Card className="overflow-hidden">
              {todayEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-slate-50 px-5 py-3.5 last:border-0">
                  <div className="h-8 w-0.5 shrink-0 rounded-full" style={{ background: ev.color }} />
                  <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-800">{ev.title}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">{ev.time}</p></div>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="p-5 text-center"><p className="text-xs text-slate-400">Nenhum evento neste dia.</p><button onClick={createEvent} className="mt-2 text-xs font-medium text-indigo-600">+ Adicionar evento</button></Card>
          )}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-3">Próximos eventos</h2>
            {events.filter(e => e.day >= 26).slice(0,4).map((ev, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ev.color }} />
                <span className="flex-1 text-xs text-slate-600">{ev.title}</span>
                <span className="font-mono text-[10px] text-slate-400">ago/{ev.day}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Page>
  );
}

// ── Domains ────────────────────────────────────────────────────────────────────

function Domains() {
  const expiryCfg = (d: number) => d <= 30 ? { cls: "bg-rose-50 text-rose-700", label: "Crítico" } : d <= 90 ? { cls: "bg-amber-50 text-amber-700", label: "Atenção" } : { cls: "bg-slate-100 text-slate-500", label: "Ok" };
  return (
    <Page>
      <PageHeader eyebrow="ATIVOS DIGITAIS" title="Domínios" description="Registros, renovações e certificados SSL dos seus clientes." action={<button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white">+ Adicionar</button>} />
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <Metric label="ATIVOS MONITORADOS" value="6" detail="domínios em carteira" />
        <Metric label="VENCENDO EM BREVE" value="2" detail="menos de 90 dias" />
        <Metric label="SEM SSL" value="1" detail="renovação necessária" />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="border-b border-slate-100"><tr>{["Domínio", "Cliente", "Expira em", "Status", "SSL", "Registrador", ""].map(h => <th key={h} className="px-5 py-3 font-mono text-[10px] font-medium tracking-wider text-slate-400">{h}</th>)}</tr></thead>
            <tbody>
              {domainsData.map((d, i) => {
                const cfg = expiryCfg(d.expires);
                return (
                  <tr key={i} className="border-b border-slate-50 last:border-0 transition hover:bg-slate-50/80">
                    <td className="px-5 py-3.5"><p className="font-mono text-xs font-medium text-slate-800">{d.domain}</p></td>
                    <td className="px-5 text-xs text-slate-500">{d.client}</td>
                    <td className="px-5"><span className="font-mono text-xs text-slate-600">{d.expires} dias</span></td>
                    <td className="px-5"><span className={`rounded-full px-2.5 py-1 font-mono text-[9px] ${cfg.cls}`}>{cfg.label.toUpperCase()}</span></td>
                    <td className="px-5">{d.ssl ? <span className="font-mono text-[10px] text-emerald-600">✓ Ativo</span> : <span className="font-mono text-[10px] text-rose-600">✕ Inativo</span>}</td>
                    <td className="px-5 font-mono text-xs text-slate-400">{d.registrar}</td>
                    <td className="px-5 text-right"><button className="rounded-lg border border-slate-200 px-2.5 py-1 font-mono text-[10px] text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600">Renovar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

function Pipeline({ clients }: { clients: Client[] }) {
  const deals = clients.flatMap(c => c.deals.map(d => ({ ...d, client: c })));
  return (
    <Page>
      <PageHeader eyebrow="NEGOCIAÇÕES" title="Pipeline" description={`${deals.filter(d=>!["won","lost"].includes(d.stage)).length} oportunidades em andamento`} />
      <div className="flex gap-3 overflow-x-auto pb-3">
        {pipelineStages.map(stage => {
          const set = deals.filter(d => d.stage === stage.id);
          return (
            <div key={stage.id} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: stage.color }} /><span className="text-xs font-semibold text-slate-700">{stage.label}</span></div>
                <span className="font-mono text-[10px] text-slate-400">{set.length}</span>
              </div>
              <div className="space-y-2">
                {set.map(d => (
                  <Card key={d.id} className="p-4">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{d.title}</p>
                    <p className="mt-1 font-mono text-[10px] text-slate-400">{money(d.value)}</p>
                    <div className="mt-3 flex items-center gap-2.5">
                      <Avatar initials={d.client.avatar} size="xs" />
                      <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium text-slate-700">{d.client.company}</p></div>
                    </div>
                    {!["won","lost"].includes(d.stage) && <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${d.probability}%`, background: stage.color }} /></div>}
                  </Card>
                ))}
                {!set.length && <div className="rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center"><p className="font-mono text-[10px] text-slate-400">SEM NEGÓCIOS</p></div>}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

// ── Client Modal ──────────────────────────────────────────────────────────────

function ClientModal({ client, close, save, edit }: { client: Client; close: () => void; save: (next: Client) => void; edit: () => void }) {
  const [tab, setTab] = useState("Visão geral");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(client.notes);
  const project = projects.find(p => p.client === client.company);
  const clientInvs = invoices.filter(inv => client.company.includes(inv.client.split(" ")[0]) || inv.client === client.company);
  const hs = healthScore(client);
  const tabs = ["Visão geral", "Projetos", "Financeiro", "Atividades", "Notas"];
  const actIcons: Record<string, string> = { call: "☎", email: "✉", meeting: "◎", note: "✎" };
  const invoiceSt = { pago: "bg-emerald-50 text-emerald-700", pendente: "bg-slate-100 text-slate-600", vencendo: "bg-amber-50 text-amber-700", atrasado: "bg-rose-50 text-rose-700" };
  const contactFields = [
    ["E-mail", client.email], ["WhatsApp", client.phone],
    ["Instagram", "@" + client.company.toLowerCase().replaceAll(" ","").replace("&","")],
    ["CNPJ", "48.291.673/0001-52"], ["Endereço", `${client.address}, ${client.city}`],
    ["Cadastro", dateShort(client.joinedDate)],
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[4px]" onMouseDown={close}>
      <div onMouseDown={e => e.stopPropagation()} className="flex max-h-[92vh] w-full max-w-[1060px] flex-col overflow-hidden rounded-[26px] border border-white/60 bg-[#fafafa] shadow-2xl shadow-slate-950/30">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-[#fafafa]/94 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Avatar initials={client.avatar} size="md" />
            <div><p className="text-sm font-semibold text-slate-900">{client.name}</p><p className="text-xs text-slate-400">{client.company} · {client.industry}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={edit} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700">Editar</button>
            <button onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700">⌁ WhatsApp</button>
            <button onClick={() => { const description = window.prompt("Descreva a atividade:"); if (description?.trim()) save({ ...client, activities: [{ id: `a${Date.now()}`, type: "note", description: description.trim(), date: new Date().toISOString().slice(0, 10), user: "Você" }, ...client.activities] }); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300">+ Atividade</button>
            <button onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-slate-200/80 text-slate-500 transition hover:bg-slate-300">×</button>
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Tags + title */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] ring-1 ${statusConfig[client.status].cls}`}>{statusConfig[client.status].label.toUpperCase()}</span>
                  {client.tags.map(t => <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-500">{t}</span>)}
                </div>
                <h1 className="mt-3 text-[21px] font-semibold tracking-[-.045em] text-slate-950">{client.company}</h1>
                <p className="mt-0.5 text-sm text-slate-500">Cliente há {yearsWith(client.joinedDate)} {yearsWith(client.joinedDate) === 1 ? "ano" : "anos"} · {client.employees} colaboradores · {client.source}</p>
              </div>
              <div className="text-right">
                <Label>HEALTH SCORE</Label>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${hs}%`, background: healthColor(hs) }} /></div>
                  <span className="font-mono text-sm font-bold" style={{ color: healthColor(hs) }}>{hs}</span>
                </div>
              </div>
            </div>
            {/* KPI row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[["RECEITA TOTAL", client.revenue ? money(client.revenue) : "—"], ["MRR", client.status==="active"?"R$ 4.800":"—"], ["STATUS FINANCEIRO", client.status==="active"?"Em dia":"Inativo"], ["PROJETOS", project?"1 ativo":"Sem projeto"]].map(([l,v]) => (
                <div key={l} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)]">
                  <Label>{l}</Label>
                  <p className={`mt-2 text-lg font-semibold tracking-tight ${v==="Em dia"?"text-emerald-600":v==="Inativo"?"text-slate-400":"text-slate-900"}`}>{v}</p>
                </div>
              ))}
            </div>
            {/* Tabs */}
            <div className="mt-6 flex overflow-x-auto border-b border-slate-200">
              {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-medium transition ${tab===t?"border-indigo-600 text-indigo-600":"border-transparent text-slate-400 hover:text-slate-700"}`}>{t}</button>)}
            </div>
            {/* Tab content */}
            <div className="mt-6">
              {tab === "Visão geral" && (
                <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
                  <div className="space-y-5">
                    <Card className="p-5">
                      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Projeto atual</h2>{project && <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-[9px] text-indigo-600">{project.stage.toUpperCase()}</span>}</div>
                      {project ? (<>
                        <p className="mt-4 text-base font-semibold">{project.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{project.type} · prazo {project.due}</p>
                        <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width:`${project.progress}%`, background: project.color }} /></div><span className="font-mono text-[10px] text-slate-500">{project.progress}%</span></div>
                      </>) : <p className="mt-4 text-sm text-slate-400">Nenhum projeto ativo.</p>}
                    </Card>
                    <Card className="p-5">
                      <h2 className="text-sm font-semibold mb-4">Últimas interações</h2>
                      <div className="space-y-3">
                        {client.activities.slice(0,3).map(act => (
                          <div key={act.id} className="flex gap-3">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs text-slate-500">{actIcons[act.type]}</span>
                            <div className="min-w-0"><p className="text-xs leading-relaxed text-slate-700">{act.description}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{dateShort(act.date)} · {act.user}</p></div>
                          </div>
                        ))}
                        {client.activities.length === 0 && <p className="text-sm text-slate-400">Nenhuma atividade ainda.</p>}
                      </div>
                    </Card>
                  </div>
                  <Card className="p-5">
                    <h2 className="text-sm font-semibold mb-5">Contato & cadastro</h2>
                    <div className="space-y-4">
                      {contactFields.map(([label, value]) => (
                        <div key={label}><Label>{label}</Label><p className="mt-1 text-xs font-medium text-slate-700">{value}</p></div>
                      ))}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <button onClick={() => client.website && window.open(`https://${client.website.replace(/^https?:\/\//, "")}`, "_blank", "noopener,noreferrer")} disabled={!client.website} className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-xs font-medium text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40">Site ↗</button>
                      <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${client.address}, ${client.city}`)}`, "_blank", "noopener,noreferrer")} className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-xs font-medium text-slate-600 transition hover:border-slate-300">Maps ↗</button>
                    </div>
                  </Card>
                </div>
              )}
              {tab === "Projetos" && (
                <div className="space-y-3">
                  {projects.filter(p => p.client === client.company).length > 0
                    ? projects.filter(p => p.client === client.company).map(p => (
                      <Card key={p.name} className="overflow-hidden">
                        <div className="h-1" style={{ background: p.color }} />
                        <div className="p-5">
                          <div className="flex items-start justify-between">
                            <div><span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] text-slate-500">{p.stage.toUpperCase()}</span><h3 className="mt-3 text-base font-semibold">{p.name}</h3><p className="mt-0.5 text-xs text-slate-400">{p.type}</p></div>
                            <span className="font-mono text-[10px] text-slate-400">{p.due}</span>
                          </div>
                          <div className="mt-5 flex items-center gap-3"><div className="h-1.5 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width:`${p.progress}%`, background: p.color }} /></div><span className="font-mono text-[10px] text-slate-500">{p.progress}%</span></div>
                        </div>
                      </Card>
                    ))
                    : <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center"><p className="text-sm text-slate-400">Nenhum projeto para {client.company}.</p><button className="mt-3 text-xs font-medium text-indigo-600">+ Criar projeto</button></div>
                  }
                </div>
              )}
              {tab === "Financeiro" && (
                <div className="space-y-5">
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold">Receita acumulada</h3><span className="font-mono text-[10px] text-slate-400">Últimos 6 meses</span></div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={[{m:"Mar",v:Math.round(client.revenue*.12)},{m:"Abr",v:Math.round(client.revenue*.18)},{m:"Mai",v:Math.round(client.revenue*.24)},{m:"Jun",v:Math.round(client.revenue*.32)},{m:"Jul",v:Math.round(client.revenue*.41)},{m:"Ago",v:Math.round(client.revenue*.5)}]} margin={{ top:5,right:5,bottom:0,left:0 }}>
                        <defs><linearGradient id="cRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.14} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                        <XAxis dataKey="m" tick={{ fontSize:10,fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v:number) => money(v)} contentStyle={{ borderRadius:10,border:"1px solid #e2e8f0",fontSize:11 }} />
                        <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#cRev)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[["RECEITA TOTAL", money(client.revenue)], ["LTV ESTIMADO", money(client.revenue*1.8)], ["MRR", client.status==="active"?"R$ 4.800":"—"]].map(([l,v]) => (
                      <div key={l} className="rounded-xl border border-slate-200/80 bg-white p-4"><Label>{l}</Label><p className={`mt-2 text-lg font-semibold ${v==="—"?"text-slate-400":"text-slate-900"}`}>{v}</p></div>
                    ))}
                  </div>
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 p-5"><h3 className="text-sm font-semibold">Histórico de faturas</h3></div>
                    {clientInvs.length > 0
                      ? clientInvs.map((inv,i) => (
                        <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-5 py-3.5 last:border-0">
                          <div className="min-w-0 flex-1"><p className="font-mono text-xs text-slate-700">{inv.id}</p><p className="mt-0.5 text-[11px] text-slate-400">Vence {inv.due}</p></div>
                          <p className="font-mono text-xs font-medium">{money(inv.amount)}</p>
                          <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] ${invoiceSt[inv.status]}`}>{inv.status.toUpperCase()}</span>
                        </div>
                      ))
                      : <p className="px-5 py-6 text-sm text-slate-400">Nenhuma fatura encontrada.</p>
                    }
                  </Card>
                </div>
              )}
              {tab === "Atividades" && (
                <div className="space-y-3">
                  {client.activities.map(act => (
                    <div key={act.id} className="flex gap-4">
                      <div className="flex flex-col items-center"><span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-sm text-indigo-600">{actIcons[act.type]}</span><div className="mt-1 flex-1 w-px bg-slate-200" /></div>
                      <Card className="mb-3 flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] text-slate-500 capitalize">{act.type}</span><span className="font-mono text-[10px] text-slate-400">{act.user}</span></div><p className="mt-2 text-sm leading-relaxed text-slate-700">{act.description}</p></div>
                          <span className="ml-4 shrink-0 font-mono text-[10px] text-slate-400">{dateShort(act.date)}</span>
                        </div>
                      </Card>
                    </div>
                  ))}
                  {client.activities.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Nenhuma atividade registrada.</p>}
                </div>
              )}
              {tab === "Notas" && (
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    <div className="p-4"><textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Adicione uma nota sobre este cliente…" className="min-h-[88px] w-full resize-none text-sm text-slate-700 outline-none placeholder:text-slate-300" /></div>
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
                      <span className="font-mono text-[10px] text-slate-400">OBSERVAÇÕES PRIVADAS</span>
                      <button onClick={() => { if (noteText.trim()) { const nextNotes = [{id:`n${Date.now()}`,content:noteText,date:new Date().toISOString().slice(0,10),user:"Você"},...notes]; setNotes(nextNotes); save({ ...client, notes: nextNotes }); setNoteText(""); } }} className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700">Salvar</button>
                    </div>
                  </Card>
                  <div className="space-y-3">
                    {notes.map(note => (
                      <Card key={note.id} className="p-4">
                        <div className="flex items-start justify-between"><p className="flex-1 text-sm leading-relaxed text-slate-700">{note.content}</p><button onClick={() => { const nextNotes = notes.filter(n=>n.id!==note.id); setNotes(nextNotes); save({ ...client, notes: nextNotes }); }} className="ml-4 shrink-0 text-slate-300 transition hover:text-slate-500">×</button></div>
                        <p className="mt-2 font-mono text-[10px] text-slate-400">{dateShort(note.date)} · {note.user}</p>
                      </Card>
                    ))}
                    {notes.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Nenhuma nota. Adicione contexto sobre o cliente.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

function ClientEditor({ close, create }: { close: () => void; create: (client: Client) => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !company.trim()) return;
    create({
      id: `c${Date.now()}`, name: name.trim(), company: company.trim(), email: email.trim(), phone: phone.trim(),
      website: "", address: "", city: "", country: "Brasil", status: "prospect", tags: [],
      avatar: name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(), revenue: 0,
      joinedDate: new Date().toISOString().slice(0, 10), lastContact: new Date().toISOString().slice(0, 10),
      deals: [], activities: [], notes: [], industry: "Não informado", employees: "Não informado", source: "Cadastro manual",
    });
    close();
  };
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={close}>
    <form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="w-full max-w-lg rounded-[22px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30">
      <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] tracking-wider text-indigo-600">BASE DE RELACIONAMENTO</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Novo cliente</h2></div><button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">×</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">Nome<input required value={name} onChange={event => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="Contato principal" /></label>
        <label className="text-xs font-medium text-slate-600">Empresa<input required value={company} onChange={event => setCompany(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="Nome da empresa" /></label>
        <label className="text-xs font-medium text-slate-600">E-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="contato@empresa.com" /></label>
        <label className="text-xs font-medium text-slate-600">WhatsApp<input value={phone} onChange={event => setPhone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="(00) 00000-0000" /></label>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Cancelar</button><button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">Salvar cliente</button></div>
    </form>
  </div>;
}

function LeadEditor({ close, create }: { close: () => void; create: (lead: (typeof leadRows)[number]) => void }) {
  const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [source, setSource] = useState("Indicação"); const [status, setStatus] = useState<(typeof leadRows)[number]["status"]>("Novo");
  const [score, setScore] = useState(50);
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !company.trim()) return; create({ name: name.trim(), company: company.trim(), source, status, score, time: "agora" }); close(); };
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={close}>
    <form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="w-full max-w-lg rounded-[22px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30">
      <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] tracking-wider text-indigo-600">AQUISIÇÃO</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Novo lead</h2></div><button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">×</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600">Nome<input required value={name} onChange={event => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Empresa<input required value={company} onChange={event => setCompany(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Origem<select value={source} onChange={event => setSource(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option>Indicação</option><option>Instagram</option><option>Site</option><option>Google</option><option>LinkedIn</option><option>Evento</option></select></label><label className="text-xs font-medium text-slate-600">Estágio<select value={status} onChange={event => setStatus(event.target.value as typeof status)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option>Novo</option><option>Qualificado</option><option>Em contato</option></select></label><label className="text-xs font-medium text-slate-600 sm:col-span-2">Score<input type="number" min="0" max="100" value={score} onChange={event => setScore(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label></div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Cancelar</button><button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">Salvar lead</button></div>
    </form>
  </div>;
}

function ClientEditEditor({ client, close, save }: { client: Client; close: () => void; save: (client: Client) => void }) {
  const [form, setForm] = useState({ name: client.name, company: client.company, email: client.email, phone: client.phone, website: client.website, city: client.city, industry: client.industry, status: client.status });
  const set = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!form.name.trim() || !form.company.trim()) return; save({ ...client, ...form, name: form.name.trim(), company: form.company.trim(), email: form.email.trim(), phone: form.phone.trim(), website: form.website.trim(), city: form.city.trim(), industry: form.industry.trim(), status: form.status as Client["status"] }); close(); };
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={close}>
    <form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30">
      <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] tracking-wider text-indigo-600">FICHA DO CLIENTE</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Editar informações</h2></div><button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">×</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600">Nome<input required value={form.name} onChange={event => set("name", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Empresa<input required value={form.company} onChange={event => set("company", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">E-mail<input type="email" value={form.email} onChange={event => set("email", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">WhatsApp<input value={form.phone} onChange={event => set("phone", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Site<input value={form.website} onChange={event => set("website", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Cidade<input value={form.city} onChange={event => set("city", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Segmento<input value={form.industry} onChange={event => set("industry", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Status<select value={form.status} onChange={event => set("status", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option value="active">Ativo</option><option value="prospect">Prospect</option><option value="inactive">Inativo</option></select></label></div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Cancelar</button><button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">Salvar alterações</button></div>
    </form>
  </div>;
}

function TaskEditor({ close, create }: { close: () => void; create: (task: (typeof tasksData)[number]) => void }) {
  const [text, setText] = useState(""); const [category, setCategory] = useState("Operação"); const [priority, setPriority] = useState<(typeof tasksData)[number]["priority"]>("média"); const [due, setDue] = useState("Hoje");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!text.trim()) return; create({ id: Date.now(), text: text.trim(), category, priority, due, done: false }); close(); };
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={close}><form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="w-full max-w-lg rounded-[22px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] tracking-wider text-indigo-600">GESTÃO</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Nova tarefa</h2></div><button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600 sm:col-span-2">O que precisa ser feito?<input required autoFocus value={text} onChange={event => setText(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Categoria<select value={category} onChange={event => setCategory(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option>Operação</option><option>Clientes</option><option>Leads</option><option>Projetos</option><option>Financeiro</option></select></label><label className="text-xs font-medium text-slate-600">Prioridade<select value={priority} onChange={event => setPriority(event.target.value as typeof priority)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option value="alta">Alta</option><option value="média">Média</option><option value="baixa">Baixa</option></select></label><label className="text-xs font-medium text-slate-600 sm:col-span-2">Prazo<input value={due} onChange={event => setDue(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="Ex.: 30 ago" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Cancelar</button><button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">Salvar tarefa</button></div></form></div>;
}

function LeadEditEditor({ lead, close, save, remove }: { lead: (typeof leadRows)[number]; close: () => void; save: (lead: (typeof leadRows)[number]) => void; remove: () => void }) {
  const [form, setForm] = useState({ ...lead }); const set = (field: keyof typeof form, value: string | number) => setForm(current => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!form.name.trim() || !form.company.trim()) return; save({ ...form, name: form.name.trim(), company: form.company.trim(), score: Number(form.score) }); close(); };
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={close}><form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="w-full max-w-lg rounded-[22px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] tracking-wider text-indigo-600">AQUISIÇÃO</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Editar lead</h2></div><button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600">Nome<input required value={form.name} onChange={event => set("name", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Empresa<input required value={form.company} onChange={event => set("company", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Origem<input value={form.source} onChange={event => set("source", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Estágio<select value={form.status} onChange={event => set("status", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"><option>Novo</option><option>Qualificado</option><option>Em contato</option></select></label><label className="text-xs font-medium text-slate-600 sm:col-span-2">Score<input type="number" min="0" max="100" value={form.score} onChange={event => set("score", Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label></div><div className="mt-6 flex items-center justify-between gap-2"><button type="button" onClick={() => { if (window.confirm(`Excluir ${lead.name}?`)) { remove(); close(); } }} className="rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600">Excluir</button><div className="flex gap-2"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Cancelar</button><button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">Salvar</button></div></div></form></div>;
}

function CalendarEventEditor({ close, create }: { close: () => void; create: (event: (typeof calendarEvents)[number]) => void }) {
  const [title, setTitle] = useState(""); const [day, setDay] = useState(26); const [time, setTime] = useState("10:00"); const [color, setColor] = useState("#6366f1");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!title.trim()) return; create({ title: title.trim(), day, time, color }); close(); };
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={close}><form onSubmit={submit} onMouseDown={event => event.stopPropagation()} className="w-full max-w-lg rounded-[22px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] tracking-wider text-indigo-600">AGENDA</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Novo evento</h2></div><button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-600 sm:col-span-2">Título<input required autoFocus value={title} onChange={event => setTitle(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Dia de agosto<input type="number" min="1" max="31" value={day} onChange={event => setDay(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label><label className="text-xs font-medium text-slate-600">Horário<input type="time" value={time} onChange={event => setTime(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">Cancelar</button><button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">Salvar evento</button></div></form></div>;
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [client, setClient] = useState<Client | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingLead, setEditingLead] = useState<(typeof leadRows)[number] | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("crm-theme") === "dark");
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem("crm-clients");
      return saved ? JSON.parse(saved) : initialClients;
    } catch {
      return initialClients;
    }
  });
  const [inboxNotes, setInboxNotes] = useState<typeof quickNotes>(() => {
    try { return JSON.parse(localStorage.getItem("crm-inbox") || "null") || quickNotes; } catch { return quickNotes; }
  });
  const [tasks, setTasks] = useState<typeof tasksData>(() => {
    try { return JSON.parse(localStorage.getItem("crm-tasks") || "null") || tasksData; } catch { return tasksData; }
  });
  const [leads, setLeads] = useState<typeof leadRows>(() => {
    try { return JSON.parse(localStorage.getItem("crm-leads") || "null") || leadRows; } catch { return leadRows; }
  });
  const [events, setEvents] = useState<typeof calendarEvents>(() => {
    try { return JSON.parse(localStorage.getItem("crm-calendar-events") || "null") || calendarEvents; } catch { return calendarEvents; }
  });
  const updateClients = (next: Client[]) => {
    setClients(next);
    localStorage.setItem("crm-clients", JSON.stringify(next));
  };
  useEffect(() => { localStorage.setItem("crm-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => { localStorage.setItem("crm-inbox", JSON.stringify(inboxNotes)); }, [inboxNotes]);
  useEffect(() => { localStorage.setItem("crm-tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("crm-leads", JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem("crm-calendar-events", JSON.stringify(events)); }, [events]);
  const saveClient = (next: Client) => {
    updateClients(clients.map(current => current.id === next.id ? next : current));
    setClient(next);
  };
  const backup = () => {
    const data = { version: 1, exportedAt: new Date().toISOString(), clients, inboxNotes, tasks, leads, events, theme: dark ? "dark" : "light" };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `crm-figma-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
  };
  const restore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data.clients)) throw new Error("Arquivo inválido");
        updateClients(data.clients);
        if (Array.isArray(data.inboxNotes)) setInboxNotes(data.inboxNotes);
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        if (Array.isArray(data.leads)) setLeads(data.leads);
        if (Array.isArray(data.events)) setEvents(data.events);
        if (data.theme === "dark" || data.theme === "light") setDark(data.theme === "dark");
        setClient(null);
      } catch { window.alert("Não foi possível restaurar este backup."); }
    };
    reader.readAsText(file);
  };
  const props = { clients, openClient: setClient };
  const render = () => {
    switch (view) {
      case "dashboard": return <Dashboard {...props} onView={setView} createClient={() => setCreatingClient(true)} />;
      case "inbox":     return <Inbox notes={inboxNotes} setNotes={setInboxNotes} onView={setView} createTask={() => setCreatingTask(true)} />;
      case "leads":     return <Leads onPipeline={() => setView("pipeline")} rows={leads} createLead={() => setCreatingLead(true)} editLead={setEditingLead} />;
      case "clients":   return <Clients {...props} createClient={() => setCreatingClient(true)} />;
      case "projects":  return <Projects />;
      case "messages":  return <Messages />;
      case "financial": return <Financial />;
      case "analytics": return <Analytics />;
      case "goals":     return <Goals />;
      case "tasks":     return <Tasks items={tasks} setItems={setTasks} createTask={() => setCreatingTask(true)} />;
      case "calendar":  return <CalendarView events={events} createEvent={() => setCreatingEvent(true)} />;
      case "domains":   return <Domains />;
      case "pipeline":  return <Pipeline clients={clients} />;
      default:          return null;
    }
  };
  return (
    <div className={`app-root flex h-full bg-[#f5f6f8] text-slate-900 ${dark ? "crm-dark" : ""}`}>
      <Sidebar view={view} onView={setView} dark={dark} toggleDark={() => setDark(current => !current)} backup={backup} restore={restore} />
      <div className="flex min-w-0 flex-1 flex-col">{render()}</div>
      {client && <ClientModal client={client} close={() => setClient(null)} save={saveClient} edit={() => setEditingClient(client)} />}
      {creatingClient && <ClientEditor close={() => setCreatingClient(false)} create={next => updateClients([...clients, next])} />}
      {creatingLead && <LeadEditor close={() => setCreatingLead(false)} create={next => setLeads(current => [next, ...current])} />}
      {editingClient && <ClientEditEditor client={editingClient} close={() => setEditingClient(null)} save={saveClient} />}
      {creatingTask && <TaskEditor close={() => setCreatingTask(false)} create={next => setTasks(current => [next, ...current])} />}
      {editingLead && <LeadEditEditor lead={editingLead} close={() => setEditingLead(null)} save={next => setLeads(current => current.map(item => item === editingLead ? next : item))} remove={() => setLeads(current => current.filter(item => item !== editingLead))} />}
      {creatingEvent && <CalendarEventEditor close={() => setCreatingEvent(false)} create={next => setEvents(current => [...current, next])} />}
    </div>
  );
}
