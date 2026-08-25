import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Server,
  Key,
  Plus,
  FileText,
  Mail,
  Edit3
} from 'lucide-react';
import type { BookingRecord } from '../lib/db';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | number | null>(null);
  const [adminNotesText, setAdminNotesText] = useState('');

  // Check simple session auth
  useEffect(() => {
    const saved = localStorage.getItem('renix_admin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passcodes for demonstration & ease of use: renix2026 or admin
    if (passcode.trim() === 'renix2026' || passcode.trim() === 'admin') {
      localStorage.setItem('renix_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      loadDashboardData();
    } else {
      setAuthError('Invalid passcode. Use "renix2026" or "admin".');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('renix_admin_auth');
    setIsAuthenticated(false);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, statsRes, healthRes] = await Promise.all([
        fetch(`/api/admin/bookings?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`),
        fetch('/api/admin/stats'),
        fetch('/api/health'),
      ]);

      const bData = await bookingsRes.json();
      const sData = await statsRes.json();
      const hData = await healthRes.json();

      if (bData.success) setBookings(bData.bookings || []);
      if (sData.success) setStats(sData.stats);
      setHealth(hData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [statusFilter, searchQuery, isAuthenticated]);

  const handleStatusChange = async (id: number | string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleSaveNotes = async (id: number | string) => {
    try {
      const current = bookings.find(b => b.id === id);
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: current?.status || 'pending', admin_notes: adminNotesText }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, admin_notes: adminNotesText } : b));
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  const handleDeleteBooking = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this booking record?')) return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
        if (selectedBooking?.id === id) setSelectedBooking(null);
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleCreateTestBooking = async () => {
    try {
      const testNames = ["Sarah Connor", "David Miller", "Sophia Zhang", "Tariq Al-Mansoor"];
      const testCompanies = ["Cyberdyne Systems", "Apex Analytics", "Horizon Health", "Aura AI"];
      const randomName = testNames[Math.floor(Math.random() * testNames.length)];
      const randomCompany = testCompanies[Math.floor(Math.random() * testCompanies.length)];

      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: randomName,
          email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
          company: randomCompany,
          service: 'AI & Automation',
          budget: '$25,000 - $50,000',
          brief: `Test booking generated from Admin console to verify Neon PostgreSQL live sync. Looking for high-throughput RAG agents.`,
          date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          time: '03:00 PM',
          timezone: 'UTC',
        }),
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Error creating test booking:', err);
    }
  };

  const exportToCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Company', 'Service', 'Budget', 'Date', 'Time', 'Status', 'Created At'];
    const rows = bookings.map(b => [
      b.id,
      `"${b.name}"`,
      b.email,
      `"${b.company || ''}"`,
      `"${b.service || ''}"`,
      `"${b.budget || ''}"`,
      b.booking_date,
      b.booking_time,
      b.status,
      b.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `renix-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Passcode login view
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md p-8 rounded-3xl border border-[#4f7cff]/30 bg-[#0c1120]/95 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(79,124,255,0.15)]">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#4f7cff]/15 border border-[#4f7cff]/40 flex items-center justify-center text-[#7fa0ff] shadow-[0_0_20px_rgba(79,124,255,0.3)]">
              <Key size={28} />
            </div>
          </div>

          <h2 className="font-display font-extrabold text-2xl text-white text-center mb-2">
            Renix Management Console
          </h2>
          <p className="text-xs text-[#6b7a99] text-center mb-6">
            Enter passcode to access Neon DB connection status, booking leads, and analytics.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2">
                Admin Passcode (Default: renix2026)
              </label>
              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#4f7cff] font-mono placeholder-[#6b7a99]"
              />
              {authError && <p className="text-xs text-red-400 mt-2">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl font-display font-semibold text-sm text-white bg-gradient-to-r from-[#4f7cff] to-[#a855f7] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,124,255,0.3)]"
            >
              Access Dashboard
            </button>

            <div className="text-center pt-2">
              <a href="/" className="text-xs text-[#6b7a99] hover:text-[#e8edf7] transition-colors">
                ← Return to Public Website
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#1e2d45]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
              Control Center
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#4f7cff]/15 text-[#7fa0ff] border border-[#4f7cff]/30">
              Neon PostgreSQL Backend
            </span>
          </div>
          <p className="text-xs text-[#6b7a99] mt-1">
            Real-time database status, client consultations, and pipeline metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateTestBooking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 hover:bg-[#00e5ff]/20 transition-all"
            title="Create sample test booking"
          >
            <Plus size={13} />
            <span>Seed Test Booking</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#94a3b8] bg-[#0c1120] border border-[#1e2d45] hover:text-white hover:border-[#4f7cff]/40 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#94a3b8] bg-[#0c1120] border border-[#1e2d45] hover:text-white transition-all"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Database Health & Server Indicator Widget */}
      <div className="p-5 rounded-2xl border border-[#4f7cff]/30 bg-[#0c1120]/90 backdrop-blur-xl mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              health?.connected ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'bg-red-500/15 text-red-400'
            }`}>
              <Database size={20} />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#6b7a99] uppercase">Database Connectivity</div>
              <div className="font-display font-bold text-sm text-[#e8edf7] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${health?.connected ? 'bg-[#4ade80] animate-pulse' : 'bg-red-400'}`}></span>
                {health?.connected ? 'Online & Healthy' : 'Disconnected'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/15 text-[#00e5ff] flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#6b7a99] uppercase">Database Engine & Host</div>
              <div className="font-display font-bold text-xs text-[#00e5ff] truncate max-w-[180px]">
                {health?.driver || 'Neon Serverless Postgres'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center">
              <Server size={20} />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#6b7a99] uppercase">Round-Trip Latency</div>
              <div className="font-display font-bold text-sm text-[#e8edf7]">
                {health?.latencyMs ? `${health.latencyMs} ms` : '< 15 ms'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#facc15]/15 text-[#facc15] flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#6b7a99] uppercase">Newsletter Subscribers</div>
              <div className="font-display font-bold text-sm text-[#e8edf7]">
                {health?.totalSubscribers || stats?.databaseStatus?.totalSubscribers || 1} Active
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
          <div className="text-xs font-mono text-[#6b7a99] uppercase">Total Bookings</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {stats?.totalBookings ?? bookings.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
          <div className="text-xs font-mono text-[#6b7a99] uppercase">Pending Review</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#facc15] mt-1">
            {stats?.pendingBookings ?? bookings.filter(b => b.status === 'pending').length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
          <div className="text-xs font-mono text-[#6b7a99] uppercase">Confirmed Calls</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#4ade80] mt-1">
            {stats?.confirmedBookings ?? bookings.filter(b => b.status === 'confirmed').length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
          <div className="text-xs font-mono text-[#6b7a99] uppercase">Conversion Rate</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#00e5ff] mt-1">
            {stats?.conversionRate ?? 85}%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? 'bg-[#4f7cff] text-white font-medium shadow-[0_0_12px_rgba(79,124,255,0.3)]'
                  : 'bg-[#0c1120] text-[#6b7a99] border border-[#1e2d45] hover:text-[#e8edf7]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a99]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search leads, email, company..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-[#e8edf7] border border-[#1e2d45] bg-[#0c1120] outline-none focus:border-[#4f7cff]"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-[#1e2d45] bg-[#0c1120]/90 backdrop-blur-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070b14] border-b border-[#1e2d45] text-[#6b7a99] font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Lead / Contact</th>
                <th className="px-5 py-3.5">Service & Budget</th>
                <th className="px-5 py-3.5">Scheduled Call</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d45]/60 text-[#e8edf7]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#6b7a99] font-mono">
                    No booking records found matching filter.
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#111827]/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-display font-semibold text-sm text-white">{b.name}</div>
                      <div className="text-xs text-[#7fa0ff]">{b.email}</div>
                      {b.company && <div className="text-[11px] text-[#6b7a99]">{b.company}</div>}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-xs text-[#e8edf7]">{b.service || 'Web Development'}</div>
                      <div className="text-[11px] font-mono text-[#00e5ff]">{b.budget || 'Flexible'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-mono text-xs text-white">{b.booking_date}</div>
                      <div className="text-[11px] font-mono text-[#6b7a99]">{b.booking_time} ({b.timezone || 'UTC'})</div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={b.status}
                        onChange={e => handleStatusChange(b.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border outline-none font-medium cursor-pointer ${
                          b.status === 'confirmed'
                            ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30'
                            : b.status === 'pending'
                            ? 'bg-[#facc15]/15 text-[#facc15] border-[#facc15]/30'
                            : b.status === 'completed'
                            ? 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        <option value="pending" className="bg-[#0b101e] text-[#facc15]">Pending</option>
                        <option value="confirmed" className="bg-[#0b101e] text-[#4ade80]">Confirmed</option>
                        <option value="completed" className="bg-[#0b101e] text-[#00e5ff]">Completed</option>
                        <option value="cancelled" className="bg-[#0b101e] text-red-400">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg text-[#6b7a99] hover:text-[#7fa0ff] hover:bg-[#1e2d45] transition-all"
                          title="View project brief"
                        >
                          <FileText size={15} />
                        </button>

                        <button
                          onClick={() => {
                            setEditingNotesId(b.id);
                            setAdminNotesText(b.admin_notes || '');
                          }}
                          className="p-1.5 rounded-lg text-[#6b7a99] hover:text-[#4ade80] hover:bg-[#1e2d45] transition-all"
                          title="Edit internal notes"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-1.5 rounded-lg text-[#6b7a99] hover:text-red-400 hover:bg-[#1e2d45] transition-all"
                          title="Delete booking"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Full Brief */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-[#4f7cff]/40 bg-[#0b101e] p-6 sm:p-8 text-[#e8edf7] shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1e2d45]">
              <div>
                <h3 className="font-display font-bold text-lg text-white">{selectedBooking.name}</h3>
                <div className="text-xs text-[#7fa0ff]">{selectedBooking.email} · {selectedBooking.company || 'Private Founder'}</div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-[#6b7a99] hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                <div>
                  <span className="text-[#6b7a99] font-mono uppercase text-[10px]">Service:</span>
                  <div className="font-semibold text-white mt-0.5">{selectedBooking.service}</div>
                </div>
                <div>
                  <span className="text-[#6b7a99] font-mono uppercase text-[10px]">Budget Range:</span>
                  <div className="font-semibold text-[#00e5ff] mt-0.5">{selectedBooking.budget}</div>
                </div>
                <div>
                  <span className="text-[#6b7a99] font-mono uppercase text-[10px]">Scheduled For:</span>
                  <div className="font-semibold text-white mt-0.5">{selectedBooking.booking_date} at {selectedBooking.booking_time}</div>
                </div>
                <div>
                  <span className="text-[#6b7a99] font-mono uppercase text-[10px]">Timezone:</span>
                  <div className="font-semibold text-white mt-0.5">{selectedBooking.timezone || 'UTC'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-mono text-[#6b7a99] uppercase tracking-wider mb-2">Project Brief Description:</h4>
                <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e2d45] text-sm text-[#e8edf7] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {selectedBooking.brief}
                </div>
              </div>

              {selectedBooking.admin_notes && (
                <div>
                  <h4 className="text-[11px] font-mono text-[#4ade80] uppercase tracking-wider mb-1">Internal Admin Notes:</h4>
                  <p className="text-xs text-[#94a3b8] italic">{selectedBooking.admin_notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#1e2d45] flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1e2d45] text-white hover:bg-[#283b5a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Admin Notes */}
      {editingNotesId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#4f7cff]/40 bg-[#0b101e] p-6 text-[#e8edf7]">
            <h3 className="font-display font-bold text-base text-white mb-2">Edit Internal Lead Notes</h3>
            <p className="text-xs text-[#6b7a99] mb-4">Add notes about discovery call outcomes, NDA status, or scope details.</p>

            <textarea
              value={adminNotesText}
              onChange={e => setAdminNotesText(e.target.value)}
              rows={4}
              placeholder="e.g. Sent formal scope proposal, client interested in pgvector indexing..."
              className="w-full p-3 rounded-xl text-xs text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#4f7cff] resize-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNotesId(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#6b7a99] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveNotes(editingNotesId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4f7cff] text-white hover:bg-[#6b5ce7]"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
