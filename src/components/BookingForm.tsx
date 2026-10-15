import React, { useMemo, useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Send, 
  Sparkles, 
  Globe, 
  Briefcase, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Download
} from "lucide-react";
import confetti from "canvas-confetti";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const SERVICES = [
  "Web SaaS Platform",
  "AI & RAG Pipeline",
  "React Native Mobile App",
  "Enterprise Suite",
  "Code Audit / Consulting"
];

const BUDGETS = [
  "< $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000+",
  "Flexible"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type FormData = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  brief: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  brief?: string;
  date?: string;
  time?: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function BookingForm() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    // Default to 2 business days from now
    const d = new Date();
    d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    return d;
  });
  const [selectedTime, setSelectedTime] = useState<string>("02:00 PM");
  const [timezone, setTimezone] = useState<string>("UTC");

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {}
  }, []);

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    service: "Web SaaS Platform",
    budget: "$10,000 - $25,000",
    brief: "",
  });

  const BRIEF_MAX = 750;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>("");
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | number>("");

  const calendarDays = useMemo<(number | null)[]>(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [currentMonth, currentYear]);

  const isDateDisabled = (day: number | null): boolean => {
    if (!day) return true;
    const date = new Date(currentYear, currentMonth, day);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isPast || isWeekend;
  };

  const isDateSelected = (day: number | null): boolean => {
    if (!day || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const prevMonth = (): void => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const nextMonth = (): void => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };

  const canGoPrev = (): boolean => {
    return !(currentMonth === today.getMonth() && currentYear === today.getFullYear());
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.email.trim()) {
      e.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email";
    }
    if (!form.brief.trim() || form.brief.trim().length < 10) {
      e.brief = "Please describe your project in at least 10 characters";
    }
    if (!selectedDate) e.date = "Please pick a consultation date";
    if (!selectedTime) e.time = "Please pick a time slot";
    return e;
  };

  const handleSubmit = async (): Promise<void> => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setStatus("loading");

    const payload = {
      name: form.name,
      email: form.email,
      company: form.company,
      service: form.service,
      budget: form.budget,
      brief: form.brief,
      date: selectedDate ? selectedDate.toISOString().split("T")[0] : undefined,
      time: selectedTime,
      timezone: timezone,
    };

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Booking failed");
      }

      setConfirmedBookingId(data.booking?.id || "RNX-" + Math.floor(1000 + Math.random() * 9000));
      setStatus("success");

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#4f7cff', '#a855f7', '#00e5ff', '#4ade80']
        });
      } catch {}
    } catch (err: unknown) {
      console.error("Booking error:", err);
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const downloadCalendarFile = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0].replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Renix.dev//Consultation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Renix.dev Technical Strategy Call with ${form.name}`,
      `DESCRIPTION:Discovery and architecture consultation session for ${form.service}. Project brief: ${form.brief.slice(0, 100)}...`,
      `DTSTART:${dateStr}T140000Z`,
      `DTEND:${dateStr}T144500Z`,
      'LOCATION:Google Meet / Zoom (link sent via email)',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `renix-consultation-${confirmedBookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputClass = (field: keyof FormErrors): string =>
    `w-full px-4 py-3 rounded-xl text-sm text-[#e8edf7] border outline-none transition-all duration-200 placeholder-[#6b7a99] font-body ${
      errors[field]
        ? "border-red-500/70 bg-[#1a0a0a] focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
        : "border-[#1e2d45] bg-[#070b14]/80 focus:border-[#4f7cff] focus:shadow-[0_0_0_3px_rgba(79,124,255,0.15)]"
    }`;

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "rgba(79,124,255,0.12)",
            border: "1px solid rgba(79,124,255,0.4)",
            boxShadow: "0 0 50px rgba(79,124,255,0.3)",
          }}
        >
          <CheckCircle size={36} className="text-[#4ade80]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 text-xs font-mono mb-4">
          <span>Booking Reference: #{confirmedBookingId}</span>
        </div>

        <h3 className="font-display font-extrabold text-3xl text-white mb-3">
          Your Call is Confirmed!
        </h3>

        <p className="text-[#94a3b8] max-w-md leading-relaxed mb-6">
          We&apos;ve reserved your session on{" "}
          <strong className="text-white">{selectedDate?.toDateString()}</strong> at{" "}
          <strong className="text-[#00e5ff]">{selectedTime} ({timezone})</strong>.
          Calendar invitation and video meeting link have been sent to{" "}
          <strong className="text-white">{form.email}</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={downloadCalendarFile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold text-xs text-white bg-[#1e2d45] hover:bg-[#283b5a] transition-all border border-[#4f7cff]/30"
          >
            <Download size={14} />
            <span>Add to Calendar (.ics)</span>
          </button>

          <button
            onClick={() => {
              setStatus("idle");
              setForm({ name: "", email: "", company: "", service: SERVICES[0], budget: BUDGETS[1], brief: "" });
            }}
            className="px-5 py-2.5 rounded-xl font-display text-xs text-[#6b7a99] hover:text-white transition-colors"
          >
            Book Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      
      {/* Left Column: Form Details (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Service Type Pills */}
        <div>
          <label className="block text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2.5">
            What do you want to build?
          </label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button
                type="button"
                key={s}
                onClick={() => setForm(f => ({ ...f, service: s }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  form.service === s
                    ? 'bg-[#4f7cff] text-white font-medium shadow-[0_0_12px_rgba(79,124,255,0.35)]'
                    : 'bg-[#070b14] text-[#6b7a99] border border-[#1e2d45] hover:text-[#e8edf7]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Name & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="booking-name" className="block text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2">
              Your Name *
            </label>
            <input
              id="booking-name"
              type="text"
              placeholder="e.g. Alex Vance"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className={inputClass("name")}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="booking-email" className="block text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2">
              Work Email *
            </label>
            <input
              id="booking-email"
              type="email"
              placeholder="alex@company.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className={inputClass("email")}
            />
            {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
          </div>
        </div>

        {/* Company & Budget Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="booking-company" className="block text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2">
              Company / Organization (Optional)
            </label>
            <input
              id="booking-company"
              type="text"
              placeholder="e.g. NovaPay Inc."
              value={form.company}
              onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
              className={inputClass("name")}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#6b7a99] uppercase tracking-wider mb-2">
              Approximate Budget
            </label>
            <select
              value={form.budget}
              onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm text-[#e8edf7] border border-[#1e2d45] bg-[#070b14]/80 outline-none focus:border-[#4f7cff] font-body"
            >
              {BUDGETS.map(b => (
                <option key={b} value={b} className="bg-[#0b101e] text-[#e8edf7]">{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Brief */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="booking-brief" className="block text-xs font-mono text-[#6b7a99] uppercase tracking-wider">
              Project Overview & Goals *
            </label>
            <span className="text-xs font-mono text-[#6b7a99]">
              {form.brief.length}/{BRIEF_MAX}
            </span>
          </div>
          <textarea
            id="booking-brief"
            placeholder="Tell us about the product you want to build, timeline, and key requirements..."
            value={form.brief}
            onChange={(e) => {
              if (e.target.value.length <= BRIEF_MAX) {
                setForm(f => ({ ...f, brief: e.target.value }));
              }
            }}
            rows={4}
            className={`${inputClass("brief")} resize-none`}
            maxLength={BRIEF_MAX}
          />
          {errors.brief && <p className="text-xs text-red-400 mt-1.5">{errors.brief}</p>}
        </div>

      </div>

      {/* Right Column: Interactive Calendar & Slot Picker (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Calendar Picker Box */}
        <div className="rounded-2xl border border-[#1e2d45] bg-[#070b14]/90 p-4 sm:p-5">
          
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e2d45]/60">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev()}
              className="p-1.5 rounded-lg text-[#6b7a99] hover:text-[#e8edf7] hover:bg-[#1e2d45]/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <h4 className="font-display font-semibold text-sm text-[#e8edf7]">
              {MONTHS[currentMonth]} {currentYear}
            </h4>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-[#6b7a99] hover:text-[#e8edf7] hover:bg-[#1e2d45]/60 transition-all"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center mb-1">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-[10px] font-mono text-[#6b7a99] uppercase py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const todayHighlight = isToday(day);

              return (
                <div key={idx} className="flex items-center justify-center">
                  {day ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!disabled) {
                          setSelectedDate(new Date(currentYear, currentMonth, day));
                          setErrors(e => ({ ...e, date: undefined }));
                        }
                      }}
                      disabled={disabled}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? "bg-[#4f7cff] text-white font-bold shadow-[0_0_12px_rgba(79,124,255,0.5)]"
                          : disabled
                          ? "text-[#1e2d45] cursor-not-allowed"
                          : todayHighlight
                          ? "text-[#00e5ff] border border-[#00e5ff]/40 bg-[#00e5ff]/5"
                          : "text-[#94a3b8] hover:text-white hover:bg-[#1e2d45]/60"
                      }`}
                    >
                      {day}
                    </button>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>
              );
            })}
          </div>

          {errors.date && <p className="text-xs text-red-400 mt-2">{errors.date}</p>}
        </div>

        {/* Time Slot Picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-[#6b7a99] uppercase tracking-wider">
              Preferred Time Slot
            </label>
            <span className="text-[11px] font-mono text-[#7fa0ff]">
              Zone: {timezone}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map(slot => (
              <button
                type="button"
                key={slot}
                onClick={() => {
                  setSelectedTime(slot);
                  setErrors(e => ({ ...e, time: undefined }));
                }}
                className={`py-2 px-2 rounded-xl text-xs font-mono transition-all text-center ${
                  selectedTime === slot
                    ? "bg-gradient-to-r from-[#4f7cff] to-[#a855f7] text-white font-bold shadow-[0_0_12px_rgba(79,124,255,0.4)] border border-transparent"
                    : "bg-[#070b14] text-[#6b7a99] border border-[#1e2d45] hover:text-white hover:border-[#4f7cff]/40"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.time && <p className="text-xs text-red-400 mt-1.5">{errors.time}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full py-4 px-6 rounded-xl font-display font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:shadow-[0_0_45px_rgba(79,124,255,0.6)] hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4f7cff 0%, #a855f7 100%)' }}
        >
          {status === "loading" ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              <span>Securing your slot in Neon DB...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Confirm Free 45-Min Strategy Call</span>
            </>
          )}
        </button>

        {status === "error" && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{apiError || "Failed to book. Please try again."}</span>
          </div>
        )}

      </div>

    </div>
  );
}
