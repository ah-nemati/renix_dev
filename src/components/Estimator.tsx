import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  Layers, 
  Smartphone, 
  Brain, 
  Globe, 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  Activity, 
  Database, 
  ArrowRight,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProjectType {
  id: string;
  name: string;
  icon: any;
  baseCost: number;
  baseWeeks: number;
  desc: string;
}

const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'saas',
    name: 'Full-Stack Web App / SaaS',
    icon: Globe,
    baseCost: 7000,
    baseWeeks: 3,
    desc: 'Modern web application with Next.js/Astro, Postgres, and high-performance serverless APIs.'
  },
  {
    id: 'ai',
    name: 'AI Agent & RAG Pipeline',
    icon: Brain,
    baseCost: 8500,
    baseWeeks: 4,
    desc: 'Custom LLM agents, vector embeddings with pgvector, document ingestion, and AI copilots.'
  },
  {
    id: 'mobile',
    name: 'Mobile App (iOS & Android)',
    icon: Smartphone,
    baseCost: 8000,
    baseWeeks: 4,
    desc: 'Native-feel React Native / Expo application with offline sync and push notifications.'
  },
  {
    id: 'enterprise',
    name: 'Full Enterprise Ecosystem',
    icon: Layers,
    baseCost: 16000,
    baseWeeks: 6,
    desc: 'Unified Web, Mobile, and AI-powered backend built for scale, compliance, and multi-tenancy.'
  }
];

interface FeatureOption {
  id: string;
  name: string;
  cost: number;
  weeks: number;
  icon: any;
  category: string;
}

const FEATURE_OPTIONS: FeatureOption[] = [
  { id: 'auth', name: 'Auth & RBAC Roles', cost: 1000, weeks: 0.5, icon: ShieldCheck, category: 'Core' },
  { id: 'stripe', name: 'Stripe Subscriptions & Invoicing', cost: 1500, weeks: 1, icon: CreditCard, category: 'Billing' },
  { id: 'ai_copilot', name: 'AI Copilot & Vector Search', cost: 3200, weeks: 1.5, icon: Sparkles, category: 'AI' },
  { id: 'realtime', name: 'Real-time WebSockets & Alerts', cost: 1800, weeks: 1, icon: Activity, category: 'Features' },
  { id: 'admin', name: 'Admin Analytics & CMS Dashboard', cost: 2200, weeks: 1, icon: Database, category: 'Core' },
  { id: 'multitenant', name: 'Multi-Tenant Architecture', cost: 2800, weeks: 1.5, icon: Layers, category: 'Infra' },
];

export default function Estimator() {
  const [selectedType, setSelectedType] = useState<string>('saas');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['auth', 'stripe', 'admin']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateSaved, setEstimateSaved] = useState(false);

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const calculation = useMemo(() => {
    const project = PROJECT_TYPES.find(p => p.id === selectedType) || PROJECT_TYPES[0];
    const featuresCost = selectedFeatures.reduce((acc, featId) => {
      const feat = FEATURE_OPTIONS.find(f => f.id === featId);
      return acc + (feat ? feat.cost : 0);
    }, 0);
    const featuresWeeks = selectedFeatures.reduce((acc, featId) => {
      const feat = FEATURE_OPTIONS.find(f => f.id === featId);
      return acc + (feat ? feat.weeks : 0);
    }, 0);

    const minCost = project.baseCost + featuresCost;
    const maxCost = Math.round(minCost * 1.35);
    const totalWeeks = Math.ceil(project.baseWeeks + featuresWeeks);

    return {
      minCost,
      maxCost,
      weeks: totalWeeks,
      projectName: project.name,
    };
  }, [selectedType, selectedFeatures]);

  const handleTransferToBooking = async () => {
    setIsSubmitting(true);

    const selectedFeatureNames = selectedFeatures
      .map(id => FEATURE_OPTIONS.find(f => f.id === id)?.name)
      .filter(Boolean);

    const scopeSummary = `Project Type: ${calculation.projectName}\nEstimated Budget: $${calculation.minCost.toLocaleString()} - $${calculation.maxCost.toLocaleString()}\nEstimated Timeline: ${calculation.weeks} Weeks\nSelected Features:\n- ${selectedFeatureNames.join('\n- ')}`;

    try {
      // Save estimate to backend
      await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: calculation.projectName,
          platforms: [selectedType],
          features: selectedFeatureNames,
          timeline_weeks: calculation.weeks,
          min_cost: calculation.minCost,
          max_cost: calculation.maxCost,
        }),
      });
    } catch (e) {
      console.warn('Estimate save offline:', e);
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    // Pre-populate booking textarea
    const briefInput = document.getElementById('booking-brief') as HTMLTextAreaElement | null;
    if (briefInput) {
      briefInput.value = `I used the scope estimator and I'm looking to build:\n${scopeSummary}\n\nAdditional requirements: `;
      briefInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Pre-select budget if input exists
    const budgetPill = document.querySelector(`[data-budget="$${Math.round(calculation.minCost / 1000)}k+"]`) as HTMLElement | null;
    if (budgetPill) budgetPill.click();

    setEstimateSaved(true);
    setIsSubmitting(false);

    // Smooth scroll to booking section
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 cols: Selectors */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Project Type */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00e5ff] uppercase tracking-wider mb-4">
              <span className="w-5 h-5 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[10px]">1</span>
              <span>Choose Project Scope</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-[#4f7cff] bg-[#0f172a] shadow-[0_0_20px_rgba(79,124,255,0.25)]'
                        : 'border-[#1e2d45] bg-[#0c1120]/70 hover:border-[#4f7cff]/40 hover:bg-[#111827]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-[#4f7cff]">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-[#4f7cff]/20 text-[#7fa0ff]' : 'bg-[#1e2d45]/50 text-[#6b7a99]'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="font-display font-semibold text-sm text-[#e8edf7] mb-1">{type.name}</div>
                    <div className="text-xs text-[#6b7a99] leading-relaxed line-clamp-2">{type.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Key Features */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#a855f7] uppercase tracking-wider mb-4">
              <span className="w-5 h-5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[10px]">2</span>
              <span>Select Architecture Modules & Features</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURE_OPTIONS.map(feat => {
                const Icon = feat.icon;
                const isSelected = selectedFeatures.includes(feat.id);
                return (
                  <button
                    type="button"
                    key={feat.id}
                    onClick={() => toggleFeature(feat.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#a855f7]/80 bg-[#171026] shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'border-[#1e2d45] bg-[#0c1120]/70 hover:border-[#a855f7]/30 hover:bg-[#111827]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#a855f7]/20 text-[#d8b4fe]' : 'bg-[#1e2d45]/50 text-[#6b7a99]'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="font-display font-medium text-xs text-[#e8edf7]">{feat.name}</div>
                        <div className="text-[11px] font-mono text-[#6b7a99]">
                          +${feat.cost.toLocaleString()} · +{feat.weeks}w
                        </div>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#a855f7] border-[#a855f7] text-white' : 'border-[#1e2d45]'
                    }`}>
                      {isSelected && <CheckCircle2 size={12} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 5 cols: Live Calculation Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 p-6 sm:p-8 rounded-2xl border border-[#4f7cff]/30 bg-[#0d1322]/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(79,124,255,0.12)]">
            
            <div className="flex items-center justify-between pb-6 border-b border-[#1e2d45]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4f7cff]/15 border border-[#4f7cff]/30 flex items-center justify-center text-[#7fa0ff]">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#e8edf7]">Live Scope Estimate</h3>
                  <p className="text-xs text-[#6b7a99]">Realistic delivery breakdown</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
                Fixed-Scope Guarantee
              </span>
            </div>

            {/* Metrics */}
            <div className="py-6 space-y-5">
              <div>
                <span className="text-xs font-mono text-[#6b7a99] uppercase tracking-wider block mb-1">
                  Estimated Investment
                </span>
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#4f7cff] via-[#00e5ff] to-[#a855f7]">
                  ${calculation.minCost.toLocaleString()} <span className="text-lg font-normal text-[#6b7a99]">-</span> ${calculation.maxCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#6b7a99] mt-1">Includes architecture, full source code, and 30 days post-launch warranty.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                  <div className="text-[10px] font-mono text-[#6b7a99] uppercase">Estimated Timeline</div>
                  <div className="font-display font-bold text-xl text-[#00e5ff] mt-0.5">
                    {calculation.weeks} Weeks
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                  <div className="text-[10px] font-mono text-[#6b7a99] uppercase">Architecture Stack</div>
                  <div className="font-display font-bold text-xs text-[#e8edf7] mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]"></span>
                    Next.js + Neon DB
                  </div>
                </div>
              </div>

              {/* What's included */}
              <div className="pt-2">
                <div className="text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2.5">Included in Deliverable:</div>
                <div className="space-y-1.5 text-xs text-[#94a3b8]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#4ade80] flex-shrink-0" />
                    <span>Clean modular TypeScript codebase & full IP ownership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#4ade80] flex-shrink-0" />
                    <span>Neon Serverless Postgres schema & indexing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#4ade80] flex-shrink-0" />
                    <span>Staging environment access with weekly sprint demos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-4 border-t border-[#1e2d45]">
              <button
                type="button"
                onClick={handleTransferToBooking}
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl font-display font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_24px_rgba(79,124,255,0.35)] hover:shadow-[0_0_36px_rgba(79,124,255,0.5)] hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #4f7cff 0%, #a855f7 100%)',
                  border: '1px solid rgba(79,124,255,0.5)'
                }}
              >
                <Send size={15} />
                <span>Transfer Scope to Free Consultation</span>
                <ArrowRight size={15} />
              </button>

              {estimateSaved && (
                <p className="text-xs text-center text-[#4ade80] mt-2.5 font-medium animate-fade-in">
                  ✓ Scope transferred to booking form below!
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
