import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Layers, 
  Calculator, 
  Calendar, 
  Code2, 
  Cpu, 
  HelpCircle, 
  ShieldAlert, 
  Mail, 
  Check, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  action: () => void;
  shortcut?: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('hello@renix.dev');
    setCopiedEmail(true);
    setTimeout(() => {
      setCopiedEmail(false);
      setIsOpen(false);
    }, 1200);
  };

  const items: CommandItem[] = [
    {
      id: 'book',
      title: 'Book a Strategy Call (Free 45-min)',
      category: 'Primary Actions',
      icon: Calendar,
      action: () => scrollTo('booking'),
      shortcut: 'B',
    },
    {
      id: 'estimator',
      title: 'Calculate Project Scope & Pricing',
      category: 'Primary Actions',
      icon: Calculator,
      action: () => scrollTo('estimator'),
      shortcut: 'E',
    },
    {
      id: 'work',
      title: 'Explore Client Case Studies & Demos',
      category: 'Portfolio',
      icon: Layers,
      action: () => scrollTo('work'),
      shortcut: 'W',
    },
    {
      id: 'services',
      title: 'Our Engineering Services',
      category: 'Overview',
      icon: Cpu,
      action: () => scrollTo('services'),
    },
    {
      id: 'tech-stack',
      title: 'Battle-Tested Tech Stack (Neon, Next.js, AI)',
      category: 'Engineering',
      icon: Code2,
      action: () => scrollTo('tech-stack'),
    },
    {
      id: 'process',
      title: '4-Phase Development Process',
      category: 'Overview',
      icon: Sparkles,
      action: () => scrollTo('process'),
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      category: 'Support',
      icon: HelpCircle,
      action: () => scrollTo('faq'),
    },
    {
      id: 'admin',
      title: 'Admin Management & Neon DB Dashboard',
      category: 'Management',
      icon: ShieldAlert,
      action: () => {
        window.location.href = '/admin';
      },
    },
    {
      id: 'email',
      title: copiedEmail ? 'Copied hello@renix.dev!' : 'Copy Direct Contact Email (hello@renix.dev)',
      category: 'Contact',
      icon: copiedEmail ? Check : Mail,
      action: copyEmail,
    },
  ];

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleItemSelect = (item: CommandItem) => {
    item.action();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleItemSelect(filteredItems[selectedIndex]);
    }
  };

  return (
    <>
      {/* Trigger Button (Visible in Navbar or Floating) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e2d45] bg-[#070b14]/80 text-xs font-mono text-[#6b7a99] hover:text-[#e8edf7] hover:border-[#4f7cff]/40 transition-all"
        title="Open Command Palette"
      >
        <Search size={13} />
        <span>Search / Commands</span>
        <kbd className="px-1.5 py-0.5 rounded bg-[#111827] text-[10px] text-[#7fa0ff] border border-[#1e2d45]">
          ⌘K
        </kbd>
      </button>

      {/* Modal Backdrop & Palette */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[#4f7cff]/30 bg-[#0b101e] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(79,124,255,0.15)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e2d45] bg-[#070b14]">
              <Search size={16} className="text-[#4f7cff] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a command or jump to section..."
                className="w-full bg-transparent text-sm text-[#e8edf7] outline-none placeholder-[#6b7a99] font-body"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#6b7a99] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#1e2d45]/40">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6b7a99] font-mono">
                  No matching commands found.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#141e33] text-white border border-[#4f7cff]/30 shadow-[0_0_12px_rgba(79,124,255,0.15)]' 
                          : 'text-[#94a3b8] hover:bg-[#0c1120]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#4f7cff]/20 text-[#7fa0ff]' : 'bg-[#1e2d45]/50 text-[#6b7a99]'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#e8edf7]">{item.title}</div>
                          <div className="text-[10px] font-mono text-[#6b7a99]">{item.category}</div>
                        </div>
                      </div>

                      {item.shortcut && (
                        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111827] text-[#6b7a99] border border-[#1e2d45]">
                          {item.shortcut}
                        </kbd>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1e2d45] bg-[#070b14] text-[11px] font-mono text-[#6b7a99]">
              <div className="flex items-center gap-2">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-[#4f7cff]">Renix.dev Command Line</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
