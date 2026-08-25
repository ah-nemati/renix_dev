import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, Code2, Cpu, Sparkles } from 'lucide-react';

export default function InteractiveTerminal() {
  const [activeTab, setActiveTab] = useState<'code' | 'arch' | 'output'>('code');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '❯ Initialized Renix Engine v4.2.0',
    '✓ Neon Serverless Postgres pool connected [latency: 14ms]',
    '✓ Vector embeddings model: text-embedding-3-small primed',
    '✓ Fast SSR edge runtime ready on Vercel',
    '❯ Ready for project initialization...'
  ]);

  const runPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab('output');
    setLogs(['❯ Starting project deployment sequence...']);

    const steps = [
      '⚡ Step 1/4: Analyzing project scope & architecture graph...',
      '🗄️ Step 2/4: Provisioning Neon Serverless DB schema & vector indexes...',
      '🧠 Step 3/4: Connecting LLM agent workflow & RAG knowledge bases...',
      '🚀 Step 4/4: Deploying full-stack Next.js/React Native endpoints...',
      '🎉 All systems live! Production URL: https://client-app.renix.dev',
      '✓ Average TTFB: 24ms | Lighthouse Score: 99/100 | Uptime: 99.99%'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsRunning(false);
        }
      }, (idx + 1) * 450);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`import { renix } from '@renix/core';
import { neon } from '@neondatabase/serverless';

const app = await renix.createApp({
  database: neon(process.env.DATABASE_URL),
  stack: ['Next.js', 'PostgreSQL', 'AI-RAG', 'React Native'],
  target: 'Production',
});

await app.deploy();`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[420px] xl:max-w-[460px] rounded-2xl border border-[#1e2d45]/90 bg-[#0b101e]/90 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(79,124,255,0.15)] overflow-hidden transition-all duration-300 hover:border-[#4f7cff]/40 hover:shadow-[0_20px_60px_rgba(79,124,255,0.15)]">
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d45]/70 bg-[#060913]/90">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
          </div>
          <span className="text-[11px] font-mono text-[#6b7a99] ml-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
            renix.architecture.ts
          </span>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1 bg-[#10172a] p-1 rounded-lg border border-[#1e2d45]/60">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
              activeTab === 'code'
                ? 'bg-[#4f7cff] text-white font-medium shadow-[0_0_8px_rgba(79,124,255,0.4)]'
                : 'text-[#6b7a99] hover:text-[#e8edf7]'
            }`}
          >
            <Code2 size={11} /> Code
          </button>
          <button
            onClick={() => setActiveTab('arch')}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
              activeTab === 'arch'
                ? 'bg-[#4f7cff] text-white font-medium shadow-[0_0_8px_rgba(79,124,255,0.4)]'
                : 'text-[#6b7a99] hover:text-[#e8edf7]'
            }`}
          >
            <Cpu size={11} /> Arch
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
              activeTab === 'output'
                ? 'bg-[#4f7cff] text-white font-medium shadow-[0_0_8px_rgba(79,124,255,0.4)]'
                : 'text-[#6b7a99] hover:text-[#e8edf7]'
            }`}
          >
            <Terminal size={11} /> Console
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 font-mono text-xs leading-relaxed min-h-[260px] flex flex-col justify-between">
        {activeTab === 'code' && (
          <div className="space-y-1 text-[#e8edf7]">
            <div>
              <span className="text-[#a855f7]">import</span>
              <span className="text-[#7fa0ff]"> &#123; renix &#125; </span>
              <span className="text-[#a855f7]">from</span>
              <span className="text-[#00e5ff]"> &apos;@renix/core&apos;</span>;
            </div>
            <div>
              <span className="text-[#a855f7]">import</span>
              <span className="text-[#7fa0ff]"> &#123; neon &#125; </span>
              <span className="text-[#a855f7]">from</span>
              <span className="text-[#00e5ff]"> &apos;@neondatabase/serverless&apos;</span>;
            </div>
            <div className="h-1"></div>
            <div>
              <span className="text-[#a855f7]">const</span>
              <span className="text-[#00e5ff]"> project</span> = <span className="text-[#a855f7]">await</span> renix.build(&#123;
            </div>
            <div className="pl-4 text-[#6b7a99]">
              database: <span className="text-[#4ade80]">neon(env.DATABASE_URL)</span>,
            </div>
            <div className="pl-4 text-[#6b7a99]">
              stack: [<span className="text-[#facc15]">&apos;Next.js&apos;</span>, <span className="text-[#facc15]">&apos;AI Agents&apos;</span>, <span className="text-[#facc15]">&apos;React Native&apos;</span>],
            </div>
            <div className="pl-4 text-[#6b7a99]">
              quality: <span className="text-[#4ade80]">&apos;Production-Grade&apos;</span>,
            </div>
            <div className="pl-4 text-[#6b7a99]">
              speed: <span className="text-[#00e5ff]">&apos;2-4 weeks to MVP&apos;</span>,
            </div>
            <div>&#125;);</div>
            <div className="h-1"></div>
            <div>
              <span className="text-[#a855f7]">await</span> project.<span className="text-[#7fa0ff]">shipToProduction</span>();
            </div>
            <div className="text-[#4ade80] pt-1 text-[11px] flex items-center gap-1.5">
              <Check size={12} className="text-[#4ade80]" />
              <span>Zero boilerplate · Full IP ownership · Scalable</span>
            </div>
          </div>
        )}

        {activeTab === 'arch' && (
          <div className="space-y-2 text-[#e8edf7]">
            <div className="text-[11px] text-[#6b7a99] uppercase tracking-wider mb-2">System Blueprint</div>
            <div className="p-2 rounded-lg bg-[#0e1628] border border-[#1e2d45] flex items-center justify-between text-[11px]">
              <span className="text-[#7fa0ff] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4f7cff]"></span> Frontend
              </span>
              <span className="text-[#e8edf7]">Next.js 15 · Astro · React Native</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0e1628] border border-[#1e2d45] flex items-center justify-between text-[11px]">
              <span className="text-[#a855f7] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span> AI & Data
              </span>
              <span className="text-[#e8edf7]">LangChain · pgvector · OpenAI / Claude</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0e1628] border border-[#1e2d45] flex items-center justify-between text-[11px]">
              <span className="text-[#00e5ff] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff]"></span> Database
              </span>
              <span className="text-[#e8edf7]">Neon Postgres (Branching & Autoscaling)</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0e1628] border border-[#1e2d45] flex items-center justify-between text-[11px]">
              <span className="text-[#4ade80] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4ade80]"></span> Infra & Auth
              </span>
              <span className="text-[#e8edf7]">Edge Serverless · Stripe · Clerk / NextAuth</span>
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="space-y-1.5 text-[11px]">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`transition-opacity duration-300 ${
                  log.includes('✓') || log.includes('🎉')
                    ? 'text-[#4ade80]'
                    : log.includes('⚡') || log.includes('🗄️') || log.includes('🧠') || log.includes('🚀')
                    ? 'text-[#00e5ff]'
                    : 'text-[#6b7a99]'
                }`}
              >
                {log}
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-[#4f7cff] animate-pulse">
                <span>❯ Processing pipeline</span>
                <span className="inline-block w-1.5 h-3 bg-[#4f7cff]"></span>
              </div>
            )}
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="mt-4 pt-3 border-t border-[#1e2d45]/60 flex items-center justify-between">
          <button
            onClick={runPipeline}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#4f7cff] to-[#a855f7] hover:opacity-90 transition-all shadow-[0_0_12px_rgba(79,124,255,0.35)] disabled:opacity-50"
          >
            <Play size={12} fill="white" />
            <span>{isRunning ? 'Running Pipeline...' : 'Run Pipeline'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-[#6b7a99] hover:text-[#e8edf7] hover:bg-[#1e2d45]/50 transition-all"
            title="Copy snippet"
          >
            {copied ? (
              <>
                <Check size={12} className="text-[#4ade80]" />
                <span className="text-[#4ade80]">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
