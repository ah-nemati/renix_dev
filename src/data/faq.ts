/**
 * Shared FAQ data — used by FAQ.astro (render) and
 * injected into FAQPage JSON-LD schema in index.astro.
 */
export const FAQ_ITEMS = [
  {
    q: 'How much does a typical project cost?',
    a: "Project scope and complexity vary widely, but here's our honest range: MVPs typically fall between $12K–$40K. Larger platforms with AI features or mobile apps can run $50K–$120K+. After a free discovery call, we give you a detailed estimate — no vague 'it depends' answers.",
  },
  {
    q: 'How long does it take to build my product?',
    a: 'A focused MVP web app takes 6–10 weeks from discovery to launch. Complex platforms with AI integrations or mobile can take 12–20 weeks. Every project starts with a 3–5 day discovery phase that produces a precise timeline before a single line of code is written.',
  },
  {
    q: 'Do you work with non-technical founders?',
    a: "Most of our clients are. We handle all technical decisions and explain the tradeoffs in plain language. You'll always know what's being built and why — without needing to know how. Our process is designed around your business goals, not our tech stack preferences.",
  },
  {
    q: 'Who owns the code and IP after the project?',
    a: "You do. 100%. Every engagement includes a contract that transfers full IP and source code ownership to you upon final payment. No vendor lock-in, no licence fees, no 'our platform only' nonsense. We can also help you onboard an in-house team at the end.",
  },
  {
    q: 'Can you take over an existing codebase?',
    a: "Yes, and we're honest about what we find. We do a thorough code audit before committing. If the codebase is salvageable we'll refactor; if a rebuild is the better call, we'll say so with the numbers to back it up. The audit is free on projects we take on.",
  },
  {
    q: 'What happens after launch?',
    a: 'All projects include 30 days of post-launch support for bugs and minor tweaks. After that, we offer monthly retainer packages for ongoing development, feature work, and monitoring — or we hand off cleanly to your in-house team with full documentation.',
  },
  {
    q: 'Do you sign NDAs?',
    a: 'Yes, before any detailed discovery conversation. We take confidentiality seriously — your idea and business information are protected from day one. Mutual NDAs are standard practice for us.',
  },
] as const;
