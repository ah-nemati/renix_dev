/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core palette
        void: '#050810',
        surface: '#0c1120',
        panel: '#111827',
        border: '#1e2d45',
        // Accent - Renix electric blue-violet
        accent: {
          DEFAULT: '#4f7cff',
          light: '#7fa0ff',
          glow: 'rgba(79,124,255,0.25)',
        },
        signal: {
          DEFAULT: '#00e5ff',
          dim: 'rgba(0,229,255,0.12)',
        },
        ember: '#a855f7',
        // Text
        ink: {
          DEFAULT: '#e8edf7',
          muted: '#6b7a99',
          faint: '#2e3d56',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'section': ['clamp(1.75rem, 3.5vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(79,124,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,124,255,0.04) 1px, transparent 1px)
        `,
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,124,255,0.18) 0%, transparent 70%)',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, #4f7cff22 0deg, #a855f722 120deg, #00e5ff22 240deg, #4f7cff22 360deg)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      boxShadow: {
        'glow-accent': '0 0 32px rgba(79,124,255,0.3), 0 0 80px rgba(79,124,255,0.12)',
        'glow-signal': '0 0 24px rgba(0,229,255,0.35)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(79,124,255,0.1)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,124,255,0.3), 0 0 48px rgba(79,124,255,0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'fade-in': 'fadeIn 0.6s ease both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
