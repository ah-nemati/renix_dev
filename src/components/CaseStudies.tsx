import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Layers, 
  Brain, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Zap,
  TrendingUp,
  Shield,
  Cpu
} from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  category: 'web' | 'ai' | 'mobile';
  categoryLabel: string;
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  impactMetrics: Array<{ value: string; label: string }>;
  tags: string[];
  gradient: string;
  accent: string;
  architectureHighlights: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'novapay',
    title: 'NovaPay Global',
    client: 'NovaPay Fintech Inc.',
    category: 'web',
    categoryLabel: 'Web SaaS & Fintech',
    headline: 'Real-time multi-currency settlement engine with sub-second webhook orchestration.',
    summary: 'NovaPay needed a modern banking dashboard capable of processing high-volume B2B transactions with instant ledger updates.',
    challenge: 'Existing legacy stack experienced latency spikes during market surges, causing transaction timeouts and reconciliation delays.',
    solution: 'We engineered a greenfield Next.js 15 application backed by Neon Serverless PostgreSQL with connection pooling, idempotency keys, and automated event streaming.',
    impactMetrics: [
      { value: '$4.2M+', label: 'Monthly GMV Processed' },
      { value: '14ms', label: 'Average Query Latency' },
      { value: '99.99%', label: 'Production Uptime' },
    ],
    tags: ['Next.js 15', 'Neon Postgres', 'Stripe Connect', 'Edge Runtime', 'TailwindCSS'],
    gradient: 'from-[#4f7cff] to-[#00e5ff]',
    accent: '#4f7cff',
    architectureHighlights: [
      'Serverless Postgres branching for zero-downtime database migrations',
      'Optimistic UI updates with resilient error-recovery queues',
      'SOC2 and PCI-DSS compliance-ready encryption layer',
    ],
  },
  {
    id: 'healthsync',
    title: 'HealthSync AI',
    client: 'HealthSync Medical AI',
    category: 'ai',
    categoryLabel: 'AI & Automation',
    headline: 'HIPAA-compliant medical consultation copilot and RAG knowledge retrieval.',
    summary: 'A clinical AI assistant that ingests doctor-patient dialogue, formats structured EHR records, and queries 50,000+ medical journals.',
    challenge: 'Doctors were spending 3.5 hours every day on manual documentation, taking time away from active patient care.',
    solution: 'Built an agentic RAG pipeline using pgvector embeddings on Neon, coupled with fine-tuned LLM prompts and deterministic medical terminology verification.',
    impactMetrics: [
      { value: '82%', label: 'Reduction in Note Taking' },
      { value: '45,000+', label: 'Consultations Processed' },
      { value: '0.01%', label: 'Hallucination Rate' },
    ],
    tags: ['OpenAI GPT-4o', 'pgvector', 'Neon Database', 'FastAPI', 'LangChain'],
    gradient: 'from-[#a855f7] to-[#ec4899]',
    accent: '#a855f7',
    architectureHighlights: [
      'Hybrid semantic vector search + keyword BM25 retrieval',
      'End-to-end PII de-identification before tokenization',
      'Sub-2 second doctor report generation with differential diagnoses',
    ],
  },
  {
    id: 'tradestack',
    title: 'TradeStack Mobile',
    client: 'TradeStack Securities',
    category: 'mobile',
    categoryLabel: 'Mobile App',
    headline: 'Ultra-low latency mobile trading app with real-time biometric order placement.',
    summary: 'Cross-platform iOS and Android trading application with 60 FPS charts, offline portfolio caching, and lightning order routing.',
    challenge: 'Mobile traders demanded millisecond responsiveness and smooth charting during high-volatility financial events.',
    solution: 'Engineered a React Native / Expo application with Skia-powered canvas charts, WebSocket multiplexing, and biometric FaceID execution.',
    impactMetrics: [
      { value: '180k+', label: 'Active Mobile Traders' },
      { value: '4.9★', label: 'App Store Rating' },
      { value: '60 FPS', label: 'Constant Chart Render' },
    ],
    tags: ['React Native', 'Expo', 'Skia Charts', 'WebSockets', 'Biometrics'],
    gradient: 'from-[#00e5ff] to-[#4ade80]',
    accent: '#00e5ff',
    architectureHighlights: [
      'Native Skia hardware-accelerated interactive candlesticks',
      'Local SQLite cache with background delta synchronization',
      'Encrypted key store integration for hardware wallet signatures',
    ],
  },
  {
    id: 'nexus',
    title: 'Nexus Intelligence',
    client: 'Nexus Systems',
    category: 'ai',
    categoryLabel: 'AI & Automation',
    headline: 'Multi-agent autonomous legal & compliance contract analysis platform.',
    summary: 'An enterprise agent network that cross-examines vendor contracts against dynamic compliance frameworks in seconds.',
    challenge: 'Legal teams took an average of 4 business days to review 80-page vendor Master Services Agreements.',
    solution: 'Designed multi-agent coordinator workflows using LangGraph and Neon Postgres that split, evaluate, and highlight risk clauses with citations.',
    impactMetrics: [
      { value: '10x', label: 'Faster Contract Review' },
      { value: '500k+', label: 'Pages Analyzed' },
      { value: '100%', label: 'Audit Trail Coverage' },
    ],
    tags: ['LangGraph', 'Neon Postgres', 'Python', 'Next.js', 'Docker'],
    gradient: 'from-[#6366f1] to-[#a855f7]',
    accent: '#818cf8',
    architectureHighlights: [
      'Multi-agent debate loop verifying risk clauses from multiple perspectives',
      'Immutable audit logs stored in relational Postgres database',
      'Live collaborative annotation canvas for legal counsels',
    ],
  },
];

export default function CaseStudies() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'web' | 'ai' | 'mobile'>('all');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const filteredCases = activeCategory === 'all' 
    ? CASE_STUDIES 
    : CASE_STUDIES.filter(c => c.category === activeCategory);

  return (
    <div className="w-full">
      {/* Category Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-12">
        {[
          { id: 'all', label: 'All Projects', icon: Globe },
          { id: 'web', label: 'Web SaaS & Platforms', icon: Layers },
          { id: 'ai', label: 'AI & Automation', icon: Brain },
          { id: 'mobile', label: 'Mobile Apps', icon: Smartphone },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 ${
                isActive
                  ? 'bg-[#4f7cff] text-white font-medium shadow-[0_0_16px_rgba(79,124,255,0.35)]'
                  : 'bg-[#0c1120] text-[#6b7a99] border border-[#1e2d45] hover:text-[#e8edf7] hover:border-[#4f7cff]/40'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Case Studies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {filteredCases.map(study => (
          <div
            key={study.id}
            onClick={() => setSelectedCase(study)}
            className="group relative rounded-3xl border border-[#1e2d45] bg-[#0c1120]/80 p-7 lg:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#4f7cff]/50 hover:bg-[#10172a] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(79,124,255,0.12)] cursor-pointer flex flex-col justify-between"
          >
            {/* Corner hover glow */}
            <div
              className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 pointer-events-none"
              style={{ background: study.accent }}
            ></div>

            <div>
              {/* Category pill & Client */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full border border-[#1e2d45] bg-[#070b14] text-[#7fa0ff]">
                  {study.categoryLabel}
                </span>
                <span className="text-xs font-mono text-[#6b7a99]">{study.client}</span>
              </div>

              {/* Title & Headline */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-display font-bold text-xl lg:text-2xl text-[#e8edf7] group-hover:text-white transition-colors">
                  {study.title}
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#1e2d45]/40 border border-[#1e2d45] flex items-center justify-center text-[#6b7a99] group-hover:text-[#4f7cff] group-hover:border-[#4f7cff]/50 group-hover:scale-110 transition-all flex-shrink-0">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              <p className="text-sm text-[#94a3b8] leading-relaxed mb-6">
                {study.headline}
              </p>

              {/* Impact Metrics Strip */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[#070b14]/90 border border-[#1e2d45]/80 mb-6">
                {study.impactMetrics.map((m, i) => (
                  <div key={i} className="text-center">
                    <div className="font-display font-extrabold text-sm sm:text-base text-[#e8edf7]" style={{ color: study.accent }}>
                      {m.value}
                    </div>
                    <div className="text-[10px] text-[#6b7a99] font-mono truncate">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags footer */}
            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#1e2d45]/60">
              {study.tags.map(t => (
                <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#131b2e] text-[#6b7a99] border border-[#1e2d45]/50">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Deep-Dive Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#4f7cff]/40 bg-[#0b101e] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(79,124,255,0.2)] text-[#e8edf7]"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#1e2d45]/60 text-[#6b7a99] hover:text-white hover:bg-[#1e2d45] transition-all"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="pr-10 mb-6">
              <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider block mb-2">
                {selectedCase.categoryLabel} · {selectedCase.client}
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">
                {selectedCase.title}
              </h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                {selectedCase.headline}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#070b14] border border-[#1e2d45] mb-8">
              {selectedCase.impactMetrics.map((m, idx) => (
                <div key={idx} className="text-center">
                  <div className="font-display font-extrabold text-xl text-[#00e5ff]">{m.value}</div>
                  <div className="text-[11px] font-mono text-[#6b7a99]">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Challenge & Solution */}
            <div className="space-y-6 mb-8 text-sm">
              <div className="p-4 rounded-2xl bg-[#111827]/60 border border-[#1e2d45]">
                <h4 className="font-display font-semibold text-xs text-[#f87171] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Zap size={14} /> The Challenge
                </h4>
                <p className="text-[#94a3b8] leading-relaxed">{selectedCase.challenge}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111827]/60 border border-[#1e2d45]">
                <h4 className="font-display font-semibold text-xs text-[#4ade80] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Cpu size={14} /> The Technical Solution
                </h4>
                <p className="text-[#94a3b8] leading-relaxed">{selectedCase.solution}</p>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="mb-8">
              <h4 className="text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-3">Key Architecture Highlights</h4>
              <div className="space-y-2">
                {selectedCase.architectureHighlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#e8edf7]">
                    <CheckCircle2 size={15} className="text-[#4ade80] flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div className="mb-8">
              <h4 className="text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2.5">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCase.tags.map(t => (
                  <span key={t} className="text-xs font-mono px-3 py-1 rounded-lg bg-[#141e33] text-[#7fa0ff] border border-[#4f7cff]/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-[#1e2d45] flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedCase(null);
                  const el = document.getElementById('booking');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-sm text-white bg-gradient-to-r from-[#4f7cff] to-[#a855f7] hover:opacity-90 transition-all text-center"
              >
                Build a Similar Product With Us
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
