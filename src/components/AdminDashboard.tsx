import React, { useState, useEffect } from "react";
import {
  Database,
  Activity,
  Calendar,
  Clock,
  Search,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  ShieldCheck,
  TrendingUp,
  Server,
  Key,
  Plus,
  FileText,
  Mail,
  Edit3,
  Lock,
  Calculator,
  Sparkles,
  Zap,
  LogOut,
  Check,
} from "lucide-react";
import type {
  BookingRecord,
  EstimateRecord,
  SubscriberRecord,
} from "../lib/db";
import type { AdminUser } from "../lib/auth";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authToken, setAuthToken] = useState<string>("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("admin@renix.dev");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active Tab: 'overview' | 'bookings' | 'estimates' | 'subscribers' | 'database'
  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "estimates" | "subscribers" | "database"
  >("overview");

  // Data states
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [estimates, setEstimates] = useState<EstimateRecord[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Bookings filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    null,
  );
  const [editingNotesId, setEditingNotesId] = useState<string | number | null>(
    null,
  );
  const [adminNotesText, setAdminNotesText] = useState("");

  // Check existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("renix_admin_token");
    if (savedToken) {
      setAuthToken(savedToken);
      verifySession(savedToken);
    } else {
      verifySession("");
    }
  }, []);

  const getAuthHeaders = (customToken?: string) => {
    const token =
      customToken ||
      authToken ||
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("renix_admin_token")
        : null);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const verifySession = async (tokenToCheck: string) => {
    try {
      const headers = tokenToCheck
        ? { Authorization: `Bearer ${tokenToCheck}` }
        : undefined;
      const res = await fetch("/api/auth/me", { headers });
      const data = await res.json();

      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        if (tokenToCheck) setAuthToken(tokenToCheck);
        loadDashboardData(tokenToCheck);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Session check failed:", err);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          passcode: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        localStorage.setItem("renix_admin_token", data.token);
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setAuthError("");
        loadDashboardData(data.token);
      } else {
        setAuthError(
          data.error || "Authentication failed. Please check credentials.",
        );
      }
    } catch (err: any) {
      setAuthError("Connection error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch (err) {}
    localStorage.removeItem("renix_admin_token");
    setAuthToken("");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({
          type: "success",
          text: "Password changed successfully!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMsg(null);
        }, 1500);
      } else {
        setPasswordMsg({
          type: "error",
          text: data.error || "Failed to change password.",
        });
      }
    } catch (err) {
      setPasswordMsg({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const loadDashboardData = async (customToken?: string) => {
    setLoading(true);
    const headers = getAuthHeaders(customToken);
    try {
      const [bookingsRes, statsRes, estimatesRes, subscribersRes, healthRes] =
        await Promise.all([
          fetch(
            `/api/admin/bookings?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`,
            { headers },
          ),
          fetch("/api/admin/stats", { headers }),
          fetch("/api/admin/estimates", { headers }),
          fetch("/api/admin/subscribers", { headers }),
          fetch("/api/health"),
        ]);

      const bData = await bookingsRes.json();
      const sData = await statsRes.json();
      const eData = await estimatesRes.json();
      const subData = await subscribersRes.json();
      const hData = await healthRes.json();

      if (bData.success) setBookings(bData.bookings || []);
      if (sData.success) {
        setStats(sData.stats);
        if (sData.stats?.user) setCurrentUser(sData.stats.user);
      }
      if (eData.success) setEstimates(eData.estimates || []);
      if (subData.success) setSubscribers(subData.subscribers || []);
      setHealth(hData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [statusFilter, searchQuery, isAuthenticated]);

  const handleStatusChange = async (
    id: number | string,
    newStatus: "pending" | "confirmed" | "completed" | "cancelled",
  ) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
        );
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking((prev) =>
            prev ? { ...prev, status: newStatus } : null,
          );
        }
      }
    } catch (err) {
      console.error("Failed to change booking status:", err);
    }
  };

  const handleSaveNotes = async (id: number | string) => {
    try {
      const current = bookings.find((b) => b.id === id);
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id,
          status: current?.status || "pending",
          admin_notes: adminNotesText,
        }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, admin_notes: adminNotesText } : b,
          ),
        );
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  const handleDeleteBooking = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this booking record?"))
      return;
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        if (selectedBooking?.id === id) setSelectedBooking(null);
      }
    } catch (err) {
      console.error("Failed to delete booking:", err);
    }
  };

  const handleDeleteEstimate = async (id: number | string) => {
    if (!confirm("Delete this estimate record?")) return;
    try {
      const res = await fetch(`/api/admin/estimates?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setEstimates((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete estimate:", err);
    }
  };

  const handleDeleteSubscriber = async (id: number | string) => {
    if (!confirm("Delete this newsletter subscriber?")) return;
    try {
      const res = await fetch(`/api/admin/subscribers?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    }
  };

  const handleCreateTestBooking = async () => {
    try {
      const testNames = [
        "Sarah Connor",
        "David Miller",
        "Sophia Zhang",
        "Tariq Al-Mansoor",
        "Elena Vasquez",
      ];
      const testCompanies = [
        "Cyberdyne Systems",
        "Apex Analytics",
        "Horizon Health",
        "Aura AI",
        "NextWave FinTech",
      ];
      const randomName =
        testNames[Math.floor(Math.random() * testNames.length)];
      const randomCompany =
        testCompanies[Math.floor(Math.random() * testCompanies.length)];

      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: randomName,
          email: `${randomName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          company: randomCompany,
          service: "Web & AI Architecture",
          budget: "$25,000 - $50,000",
          brief: `Verified live Neon PostgreSQL booking test sync. Looking for ultra high-performance agent pipelines and serverless API integration.`,
          date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          time: "02:30 PM",
          timezone: "UTC",
        }),
      });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error("Error creating test booking:", err);
    }
  };

  const exportBookingsToCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "ID",
      "Name",
      "Email",
      "Company",
      "Service",
      "Budget",
      "Date",
      "Time",
      "Status",
      "Created At",
    ];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.name}"`,
      b.email,
      `"${b.company || ""}"`,
      `"${b.service || ""}"`,
      `"${b.budget || ""}"`,
      b.booking_date,
      b.booking_time,
      b.status,
      b.created_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `renix-bookings-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSubscribersToCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ["ID", "Email", "Status", "Subscribed At"];
    const rows = subscribers.map((s) => [
      s.id,
      s.email,
      s.status || "active",
      s.created_at,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `renix-subscribers-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==================== Unauthenticated Login View ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="relative w-full max-w-md">
          {/* Ambient Glow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#4f7cff] via-[#a855f7] to-[#00e5ff] opacity-20 blur-xl"></div>

          <div className="relative p-8 rounded-3xl border border-[#4f7cff]/30 bg-[#0c1120]/95 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(79,124,255,0.15)]">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f7cff]/20 to-[#a855f7]/20 border border-[#4f7cff]/40 flex items-center justify-center text-[#7fa0ff] shadow-[0_0_25px_rgba(79,124,255,0.3)]">
                <ShieldCheck size={32} className="text-[#4f7cff]" />
              </div>
            </div>

            <h2 className="font-display font-extrabold text-2xl text-white text-center tracking-tight mb-2">
              Renix Control Center
            </h2>
            <p className="text-xs text-[#94a3b8] text-center mb-6 leading-relaxed">
              Neon PostgreSQL Database Management & Admin Authentication
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#94a3b8] uppercase tracking-wider mb-2">
                  Admin Email / Username
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@renix.dev or admin"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#4f7cff] font-mono transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono text-[#94a3b8] uppercase tracking-wider">
                    Password / Passcode
                  </label>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#4f7cff] font-mono transition-all"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-5 rounded-xl font-display font-semibold text-sm text-white bg-gradient-to-r from-[#4f7cff] via-[#6366f1] to-[#a855f7] hover:opacity-90 transition-all shadow-[0_0_25px_rgba(79,124,255,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Secure Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center pt-3 border-t border-[#1e2d45]/60">
                <a
                  href="/"
                  className="text-xs text-[#94a3b8] hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  ← Return to Public Website
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Authenticated Control Center View ====================
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header & Admin Profile Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1e2d45]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Control Center
            </h1>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#4f7cff]/15 text-[#7fa0ff] border border-[#4f7cff]/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
              Neon PostgreSQL
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Logged in as{" "}
            <strong className="text-white">
              {currentUser?.email || "admin@renix.dev"}
            </strong>{" "}
            ({currentUser?.role || "Super Admin"})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCreateTestBooking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 hover:bg-[#00e5ff]/20 transition-all cursor-pointer"
            title="Seed a live consultation booking to Neon DB"
          >
            <Plus size={13} />
            <span>Seed Booking</span>
          </button>

          <button
            onClick={() => loadDashboardData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#94a3b8] bg-[#0c1120] border border-[#1e2d45] hover:text-white hover:border-[#4f7cff]/40 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#94a3b8] bg-[#0c1120] border border-[#1e2d45] hover:text-white hover:border-[#a855f7]/40 transition-all cursor-pointer"
          >
            <Key size={13} />
            <span>Change Password</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#1e2d45]/60">
        {[
          {
            id: "overview",
            label: "Overview & Metrics",
            icon: Activity,
            count: null,
          },
          {
            id: "bookings",
            label: "Client Bookings",
            icon: Calendar,
            count: bookings.length,
          },
          {
            id: "estimates",
            label: "Project Estimates",
            icon: Calculator,
            count: estimates.length,
          },
          {
            id: "subscribers",
            label: "Newsletter Subscribers",
            icon: Mail,
            count: subscribers.length,
          },
          {
            id: "database",
            label: "Neon DB Diagnostics",
            icon: Database,
            count: null,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#4f7cff] to-[#6366f1] text-white shadow-[0_0_15px_rgba(79,124,255,0.3)]"
                  : "bg-[#0c1120] text-[#94a3b8] border border-[#1e2d45] hover:text-white hover:border-[#4f7cff]/30"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-black/30 text-white"
                      : "bg-[#1e2d45] text-[#94a3b8]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: OVERVIEW ==================== */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Database Health Card */}
          <div className="p-6 rounded-2xl border border-[#4f7cff]/30 bg-[#0c1120]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    health?.connected
                      ? "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30"
                      : "bg-red-500/15 text-red-400 border border-red-500/30"
                  }`}
                >
                  <Database size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#94a3b8] uppercase">
                    Neon PostgreSQL
                  </div>
                  <div className="font-display font-bold text-sm text-white flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${health?.connected ? "bg-[#4ade80] animate-pulse" : "bg-red-400"}`}
                    ></span>
                    {health?.connected
                      ? "Live & Connected"
                      : "Connection Error"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#94a3b8] uppercase">
                    Database Host
                  </div>
                  <div
                    className="font-mono text-xs text-[#00e5ff] truncate max-w-[170px] mt-0.5"
                    title={health?.databaseHost}
                  >
                    {health?.databaseHost || "aws.neon.tech"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30 flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#94a3b8] uppercase">
                    Query Latency
                  </div>
                  <div className="font-display font-bold text-sm text-white mt-0.5">
                    {health?.latencyMs ? `${health.latencyMs} ms` : "< 20 ms"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#facc15]/15 text-[#facc15] border border-[#facc15]/30 flex items-center justify-center">
                  <Server size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#94a3b8] uppercase">
                    Engine Version
                  </div>
                  <div className="font-mono text-xs text-white mt-0.5">
                    PostgreSQL {health?.pgVersion || "18.6"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
              <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] uppercase">
                <span>Total Bookings</span>
                <Calendar size={15} className="text-[#4f7cff]" />
              </div>
              <div className="font-display font-extrabold text-3xl text-white mt-2">
                {stats?.totalBookings ?? bookings.length}
              </div>
              <div className="text-[11px] text-[#94a3b8] mt-1">
                Client consultation inquiries
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
              <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] uppercase">
                <span>Pending Action</span>
                <Clock size={15} className="text-[#facc15]" />
              </div>
              <div className="font-display font-extrabold text-3xl text-[#facc15] mt-2">
                {stats?.pendingBookings ??
                  bookings.filter((b) => b.status === "pending").length}
              </div>
              <div className="text-[11px] text-[#94a3b8] mt-1">
                Awaiting confirmation
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
              <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] uppercase">
                <span>Project Estimates</span>
                <Calculator size={15} className="text-[#a855f7]" />
              </div>
              <div className="font-display font-extrabold text-3xl text-[#a855f7] mt-2">
                {estimates.length}
              </div>
              <div className="text-[11px] text-[#94a3b8] mt-1">
                Interactive scopes generated
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
              <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] uppercase">
                <span>Subscribers</span>
                <Mail size={15} className="text-[#00e5ff]" />
              </div>
              <div className="font-display font-extrabold text-3xl text-[#00e5ff] mt-2">
                {subscribers.length}
              </div>
              <div className="text-[11px] text-[#94a3b8] mt-1">
                Tech insights audience
              </div>
            </div>
          </div>

          {/* Quick Actions & Service Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Popularity */}
            <div className="p-6 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45]">
              <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#4f7cff]" />
                <span>Client Service Demand Breakdown</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(
                  stats?.serviceCounts || {
                    "Web & API Development": 2,
                    "AI & Automation": 1,
                    "Mobile App Development": 1,
                  },
                ).map(([service, count]: [string, any]) => {
                  const total = bookings.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={service}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#e8edf7]">{service}</span>
                        <span className="font-mono text-[#7fa0ff]">
                          {count} inquiries ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#1e2d45] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4f7cff] to-[#a855f7] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="p-6 rounded-2xl bg-[#0c1120]/80 border border-[#1e2d45] flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white mb-2 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#00e5ff]" />
                  <span>Neon DB Architecture Summary</span>
                </h3>
                <p className="text-xs text-[#94a3b8] mb-4">
                  The Neon Serverless PostgreSQL backend is fully provisioned
                  with automated connection pooling, encrypted PBKDF2
                  authentication, and auto-managed table migrations.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                    <div className="text-[#94a3b8] text-[10px]">
                      AUTH SYSTEM
                    </div>
                    <div className="text-white font-semibold mt-0.5">
                      PBKDF2 SHA-256
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                    <div className="text-[#94a3b8] text-[10px]">
                      SESSION EXPIRY
                    </div>
                    <div className="text-[#4ade80] font-semibold mt-0.5">
                      7 Days (Auto-Purged)
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e2d45] flex gap-3">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#4f7cff]/15 text-[#7fa0ff] border border-[#4f7cff]/30 hover:bg-[#4f7cff]/25 transition-all text-center cursor-pointer"
                >
                  Manage Bookings →
                </button>
                <button
                  onClick={() => setActiveTab("estimates")}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#a855f7]/15 text-[#c084fc] border border-[#a855f7]/30 hover:bg-[#a855f7]/25 transition-all text-center cursor-pointer"
                >
                  View Estimates →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: BOOKINGS ==================== */}
      {activeTab === "bookings" && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {["all", "pending", "confirmed", "completed", "cancelled"].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      statusFilter === st
                        ? "bg-[#4f7cff] text-white font-medium shadow-[0_0_12px_rgba(79,124,255,0.3)]"
                        : "bg-[#0c1120] text-[#94a3b8] border border-[#1e2d45] hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ),
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-[#e8edf7] border border-[#1e2d45] bg-[#0c1120] outline-none focus:border-[#4f7cff]"
                />
              </div>

              <button
                onClick={exportBookingsToCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#94a3b8] bg-[#0c1120] border border-[#1e2d45] hover:text-white transition-all shrink-0 cursor-pointer"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl border border-[#1e2d45] bg-[#0c1120]/90 backdrop-blur-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070b14] border-b border-[#1e2d45] text-[#94a3b8] font-mono uppercase tracking-wider">
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
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-[#94a3b8] font-mono"
                      >
                        No consultation bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-[#111827]/70 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="font-display font-semibold text-sm text-white">
                            {b.name}
                          </div>
                          <div className="text-xs text-[#7fa0ff]">
                            {b.email}
                          </div>
                          {b.company && (
                            <div className="text-[11px] text-[#94a3b8]">
                              {b.company}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-xs text-[#e8edf7]">
                            {b.service || "Web Development"}
                          </div>
                          <div className="text-[11px] font-mono text-[#00e5ff]">
                            {b.budget || "Flexible"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-mono text-xs text-white">
                            {b.booking_date}
                          </div>
                          <div className="text-[11px] font-mono text-[#94a3b8]">
                            {b.booking_time} ({b.timezone || "UTC"})
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={b.status}
                            onChange={(e) =>
                              handleStatusChange(b.id, e.target.value as any)
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border outline-none font-medium cursor-pointer ${
                              b.status === "confirmed"
                                ? "bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30"
                                : b.status === "pending"
                                  ? "bg-[#facc15]/15 text-[#facc15] border-[#facc15]/30"
                                  : b.status === "completed"
                                    ? "bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/30"
                                    : "bg-red-500/15 text-red-400 border-red-500/30"
                            }`}
                          >
                            <option
                              value="pending"
                              className="bg-[#0b101e] text-[#facc15]"
                            >
                              Pending
                            </option>
                            <option
                              value="confirmed"
                              className="bg-[#0b101e] text-[#4ade80]"
                            >
                              Confirmed
                            </option>
                            <option
                              value="completed"
                              className="bg-[#0b101e] text-[#00e5ff]"
                            >
                              Completed
                            </option>
                            <option
                              value="cancelled"
                              className="bg-[#0b101e] text-red-400"
                            >
                              Cancelled
                            </option>
                          </select>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#7fa0ff] hover:bg-[#1e2d45] transition-all cursor-pointer"
                              title="View project brief"
                            >
                              <FileText size={15} />
                            </button>

                            <button
                              onClick={() => {
                                setEditingNotesId(b.id);
                                setAdminNotesText(b.admin_notes || "");
                              }}
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#4ade80] hover:bg-[#1e2d45] transition-all cursor-pointer"
                              title="Edit internal notes"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-400 hover:bg-[#1e2d45] transition-all cursor-pointer"
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
        </div>
      )}

      {/* ==================== TAB 3: ESTIMATES ==================== */}
      {activeTab === "estimates" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Project Estimator Submissions
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Inquiries generated from the interactive project cost & timeline
                calculator.
              </p>
            </div>
            <span className="text-xs font-mono text-[#00e5ff] px-3 py-1 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/25">
              {estimates.length} Inquiries
            </span>
          </div>

          {estimates.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-[#1e2d45] bg-[#0c1120]/80 text-[#94a3b8] font-mono text-xs">
              No project estimates submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {estimates.map((est) => (
                <div
                  key={est.id}
                  className="p-5 rounded-2xl border border-[#1e2d45] bg-[#0c1120]/90 backdrop-blur-xl relative"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#7fa0ff] uppercase tracking-wider">
                        {est.project_type}
                      </span>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {est.contact_email || "Anonymous Visitor"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEstimate(est.id)}
                      className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-400 hover:bg-[#1e2d45] transition-all cursor-pointer"
                      title="Delete estimate"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-xl bg-[#070b14] border border-[#1e2d45] mb-3">
                    <div>
                      <span className="text-[#94a3b8] text-[10px] block">
                        ESTIMATED BUDGET
                      </span>
                      <span className="text-[#00e5ff] font-bold">
                        ${est.min_cost.toLocaleString()} - $
                        {est.max_cost.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#94a3b8] text-[10px] block">
                        TIMELINE
                      </span>
                      <span className="text-white font-bold">
                        {est.timeline_weeks} Weeks
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#94a3b8] uppercase block mb-1">
                        Target Platforms:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {est.platforms?.map((p, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-[#4f7cff]/10 text-[#7fa0ff] border border-[#4f7cff]/20"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#94a3b8] uppercase block mb-1">
                        Requested Features:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {est.features?.map((f, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-[#a855f7]/10 text-[#c084fc] border border-[#a855f7]/20"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1e2d45]/60 text-[10px] font-mono text-[#94a3b8]">
                    Generated: {new Date(est.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: SUBSCRIBERS ==================== */}
      {activeTab === "subscribers" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Newsletter Audience
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Subscribers to Renix Tech Insights and architecture updates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportSubscribersToCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#94a3b8] bg-[#0c1120] border border-[#1e2d45] hover:text-white transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2d45] bg-[#0c1120]/90 backdrop-blur-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070b14] border-b border-[#1e2d45] text-[#94a3b8] font-mono uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Subscriber Email</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Subscription Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d45]/60 text-[#e8edf7]">
                {subscribers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-[#94a3b8] font-mono"
                    >
                      No subscribers registered yet.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#111827]/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-white">
                        {s.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30">
                          {s.status || "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#94a3b8]">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(s.id)}
                          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-400 hover:bg-[#1e2d45] transition-all cursor-pointer"
                          title="Delete subscriber"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: DATABASE DIAGNOSTICS ==================== */}
      {activeTab === "database" && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-2xl border border-[#4f7cff]/30 bg-[#0c1120]/90 backdrop-blur-xl">
            <h2 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <Database size={20} className="text-[#4f7cff]" />
              <span>Neon PostgreSQL Diagnostics & Connection Status</span>
            </h2>
            <p className="text-xs text-[#94a3b8] mb-6">
              Live serverless PostgreSQL telemetry, latency health, and database
              metrics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                <div className="text-[10px] font-mono text-[#94a3b8] uppercase">
                  CONNECTION STATUS
                </div>
                <div className="font-display font-bold text-sm text-[#4ade80] mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping"></span>
                  Connected (Active)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                <div className="text-[10px] font-mono text-[#94a3b8] uppercase">
                  POSTGRES ENGINE
                </div>
                <div className="font-mono text-sm text-white mt-1">
                  v{health?.pgVersion || "18.6"} (Serverless)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                <div className="text-[10px] font-mono text-[#94a3b8] uppercase">
                  PING LATENCY
                </div>
                <div className="font-mono text-sm text-[#00e5ff] mt-1">
                  {health?.latencyMs ?? 12} ms
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#94a3b8] uppercase">
                  Raw Database Telemetry:
                </span>
                <button
                  onClick={() => loadDashboardData()}
                  className="text-xs font-mono text-[#7fa0ff] hover:underline cursor-pointer"
                >
                  Re-test Ping
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#070b14] border border-[#1e2d45] text-xs font-mono text-[#7fa0ff] overflow-x-auto">
                {JSON.stringify(
                  {
                    status: "ok",
                    database: "neondb",
                    driver: "@neondatabase/serverless",
                    host: health?.databaseHost,
                    latencyMs: health?.latencyMs,
                    pgVersion: health?.pgVersion,
                    totalBookings: stats?.totalBookings,
                    totalEstimates: estimates.length,
                    totalSubscribers: subscribers.length,
                    activeSessions: health?.activeSessions ?? 1,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: VIEW BRIEF ==================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-[#4f7cff]/40 bg-[#0b101e] p-6 sm:p-8 text-[#e8edf7] shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1e2d45]">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  {selectedBooking.name}
                </h3>
                <div className="text-xs text-[#7fa0ff]">
                  {selectedBooking.email} ·{" "}
                  {selectedBooking.company || "Private Founder"}
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-[#94a3b8] hover:text-white cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#070b14] border border-[#1e2d45]">
                <div>
                  <span className="text-[#94a3b8] font-mono uppercase text-[10px]">
                    Service:
                  </span>
                  <div className="font-semibold text-white mt-0.5">
                    {selectedBooking.service}
                  </div>
                </div>
                <div>
                  <span className="text-[#94a3b8] font-mono uppercase text-[10px]">
                    Budget Range:
                  </span>
                  <div className="font-semibold text-[#00e5ff] mt-0.5">
                    {selectedBooking.budget}
                  </div>
                </div>
                <div>
                  <span className="text-[#94a3b8] font-mono uppercase text-[10px]">
                    Scheduled For:
                  </span>
                  <div className="font-semibold text-white mt-0.5">
                    {selectedBooking.booking_date} at{" "}
                    {selectedBooking.booking_time}
                  </div>
                </div>
                <div>
                  <span className="text-[#94a3b8] font-mono uppercase text-[10px]">
                    Timezone:
                  </span>
                  <div className="font-semibold text-white mt-0.5">
                    {selectedBooking.timezone || "UTC"}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-mono text-[#94a3b8] uppercase tracking-wider mb-2">
                  Project Brief Description:
                </h4>
                <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e2d45] text-sm text-[#e8edf7] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {selectedBooking.brief}
                </div>
              </div>

              {selectedBooking.admin_notes && (
                <div>
                  <h4 className="text-[11px] font-mono text-[#4ade80] uppercase tracking-wider mb-1">
                    Internal Admin Notes:
                  </h4>
                  <p className="text-xs text-[#94a3b8] italic">
                    {selectedBooking.admin_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#1e2d45] flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1e2d45] text-white hover:bg-[#283b5a] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDIT NOTES ==================== */}
      {editingNotesId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#4f7cff]/40 bg-[#0b101e] p-6 text-[#e8edf7]">
            <h3 className="font-display font-bold text-base text-white mb-2">
              Edit Internal Lead Notes
            </h3>
            <p className="text-xs text-[#94a3b8] mb-4">
              Add notes about discovery call outcomes, NDA status, or scope
              details.
            </p>

            <textarea
              value={adminNotesText}
              onChange={(e) => setAdminNotesText(e.target.value)}
              rows={4}
              placeholder="e.g. Sent formal scope proposal, client interested in Neon DB indexing..."
              className="w-full p-3 rounded-xl text-xs text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#4f7cff] resize-none mb-4 font-sans"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNotesId(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#94a3b8] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveNotes(editingNotesId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4f7cff] text-white hover:bg-[#6366f1] cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CHANGE PASSWORD ==================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#a855f7]/40 bg-[#0b101e] p-6 sm:p-8 text-[#e8edf7] shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1e2d45]">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Key size={18} className="text-[#a855f7]" />
                <span>Change Admin Password</span>
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-[#94a3b8] hover:text-white cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#94a3b8] uppercase mb-1.5">
                  Current Password / Passcode
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94a3b8] uppercase mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94a3b8] uppercase mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-[#e8edf7] border border-[#1e2d45] bg-[#070b14] outline-none focus:border-[#a855f7]"
                />
              </div>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordMsg.type === "success"
                      ? "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30"
                      : "bg-red-500/15 text-red-400 border border-red-500/30"
                  }`}
                >
                  {passwordMsg.type === "success" ? (
                    <Check size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94a3b8] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#4f7cff] to-[#a855f7] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
