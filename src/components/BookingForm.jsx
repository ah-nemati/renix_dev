import React, { useState, useMemo } from "react";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function BookingForm() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", brief: "" });
  const BRIEF_MAX = 500;
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // Build calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentMonth, currentYear]);

  const isDateDisabled = (day) => {
    if (!day) return true;
    const date = new Date(currentYear, currentMonth, day);
    const isPast =
      date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isPast || isWeekend;
  };

  const isDateSelected = (day) => {
    if (!day || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const canGoPrev = () => {
    return !(
      currentMonth === today.getMonth() && currentYear === today.getFullYear()
    );
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.brief.trim()) e.brief = "Tell us a bit about your project";
    if (!selectedDate) e.date = "Please pick a date";
    if (!selectedTime) e.time = "Please pick a time slot";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setApiError("");
    setStatus("loading");

    const payload = {
      name: form.name,
      email: form.email,
      brief: form.brief,
      date: selectedDate?.toISOString().split("T")[0],
      time: selectedTime,
    };

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Booking failed");
      }

      setStatus("success");
    } catch (err) {
      console.error("Booking error:", err);
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl text-sm text-[#e8edf7] border outline-none transition-all duration-200 placeholder-[#6b7a99] font-body ${
      errors[field]
        ? "border-red-500/60 bg-[#1a0a0a] focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
        : "border-[#1e2d45] bg-[#0c1120]/80 focus:border-[#4f7cff]/50 focus:shadow-[0_0_0_3px_rgba(79,124,255,0.1)]"
    }`;

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "rgba(79,124,255,0.1)",
            border: "1px solid rgba(79,124,255,0.3)",
            boxShadow: "0 0 40px rgba(79,124,255,0.2)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 16l7 7 13-13"
              stroke="#4f7cff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="font-display font-bold text-2xl text-[#e8edf7] mb-3">
          You're booked.
        </h3>
        <p className="text-[#6b7a99] max-w-sm leading-relaxed mb-2">
          We'll send a calendar invite to{" "}
          <strong className="text-[#e8edf7]">{form.email}</strong> shortly.
        </p>
        <p className="text-[#6b7a99] text-sm">
          Expect a confirmation within{" "}
          <strong className="text-[#e8edf7]">2 hours</strong>.
        </p>
        <div
          className="mt-8 px-6 py-3 rounded-xl font-mono text-xs text-[#6b7a99]"
          style={{
            background: "rgba(79,124,255,0.06)",
            border: "1px solid rgba(79,124,255,0.12)",
          }}
        >
          {selectedDate?.toDateString()} at {selectedTime}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
      {/* Left — Info form */}
      <div className="space-y-5">
        <div>
          <label
            htmlFor="booking-name"
            className="block text-xs font-mono text-[#6b7a99] uppercase tracking-widest mb-2"
          >
            Your Name
          </label>
          <input
            id="booking-name"
            type="text"
            placeholder="Alex Johnson"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="booking-email"
            className="block text-xs font-mono text-[#6b7a99] uppercase tracking-widest mb-2"
          >
            Email Address
          </label>
          <input
            id="booking-email"
            type="email"
            placeholder="alex@company.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="booking-brief"
              className="block text-xs font-mono text-[#6b7a99] uppercase tracking-widest"
            >
              Project Brief
            </label>
            <span
              className={`text-xs font-mono transition-colors ${
                form.brief.length > BRIEF_MAX * 0.9
                  ? form.brief.length >= BRIEF_MAX
                    ? "text-red-400"
                    : "text-amber-400"
                  : "text-[#2e3d56]"
              }`}
            >
              {form.brief.length}/{BRIEF_MAX}
            </span>
          </div>
          <textarea
            id="booking-brief"
            placeholder="Describe your idea, what you're trying to build, and what stage you're at..."
            value={form.brief}
            onChange={(e) => {
              if (e.target.value.length <= BRIEF_MAX)
                setForm((f) => ({ ...f, brief: e.target.value }));
            }}
            rows={5}
            className={inputClass("brief") + " resize-none"}
            maxLength={BRIEF_MAX}
          />
          {errors.brief && (
            <p className="text-xs text-red-400 mt-1.5">{errors.brief}</p>
          )}
        </div>

        {/* Selected summary chip */}
        {(selectedDate || selectedTime) && (
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: "rgba(79,124,255,0.06)",
              border: "1px solid rgba(79,124,255,0.15)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="flex-shrink-0"
            >
              <rect
                x="1"
                y="2"
                width="12"
                height="11"
                rx="1.5"
                stroke="#4f7cff"
                strokeWidth="1.2"
              />
              <path
                d="M4 1v2M10 1v2M1 5h12"
                stroke="#4f7cff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs font-mono text-[#7fa0ff]">
              {selectedDate ? selectedDate.toDateString() : "—"}
              {selectedTime ? ` · ${selectedTime}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Right — Calendar + time picker */}
      <div className="space-y-5">
        {/* Calendar */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(12,17,32,0.8)",
            border: "1px solid rgba(30,45,69,0.8)",
          }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d45]/60">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev()}
              className="p-1.5 rounded-lg text-[#6b7a99] hover:text-[#e8edf7] hover:bg-[#1e2d45]/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h4 className="font-display font-semibold text-sm text-[#e8edf7]">
              {MONTHS[currentMonth]} {currentYear}
            </h4>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-[#6b7a99] hover:text-[#e8edf7] hover:bg-[#1e2d45]/60 transition-all"
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-mono text-[#2e3d56] uppercase tracking-widest py-1.5"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
            {calendarDays.map((day, idx) => {
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const todayHighlight = isToday(day);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-center py-0.5"
                >
                  {day ? (
                    <button
                      onClick={() => {
                        if (!disabled) {
                          setSelectedDate(
                            new Date(currentYear, currentMonth, day),
                          );
                          setErrors((e) => ({ ...e, date: undefined }));
                        }
                      }}
                      disabled={disabled}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-150 ${
                        selected
                          ? "text-white font-semibold"
                          : disabled
                            ? "text-[#2e3d56] cursor-not-allowed"
                            : todayHighlight
                              ? "text-[#4f7cff] border border-[#4f7cff]/30 hover:bg-[#4f7cff]/10"
                              : "text-[#6b7a99] hover:text-[#e8edf7] hover:bg-[#1e2d45]/60"
                      }`}
                      style={
                        selected
                          ? {
                              background:
                                "linear-gradient(135deg, #4f7cff, #6b5ce7)",
                              boxShadow: "0 0 16px rgba(79,124,255,0.4)",
                            }
                          : {}
                      }
                      aria-label={
                        day
                          ? `${MONTHS[currentMonth]} ${day}, ${currentYear}`
                          : undefined
                      }
                      aria-pressed={selected}
                    >
                      {day}
                    </button>
                  ) : (
                    <div className="w-9 h-9" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {errors.date && (
          <p className="text-xs text-red-400 -mt-3">{errors.date}</p>
        )}

        {/* Time slots */}
        <div>
          <label className="block text-xs font-mono text-[#6b7a99] uppercase tracking-widest mb-3">
            Preferred Time (UTC)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  setSelectedTime(slot);
                  setErrors((e) => ({ ...e, time: undefined }));
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-mono transition-all duration-150 ${
                  selectedTime === slot
                    ? "text-white font-semibold"
                    : "text-[#6b7a99] hover:text-[#e8edf7] hover:border-[#4f7cff]/30"
                }`}
                style={
                  selectedTime === slot
                    ? {
                        background: "linear-gradient(135deg, #4f7cff, #6b5ce7)",
                        border: "1px solid rgba(79,124,255,0.4)",
                        boxShadow: "0 0 12px rgba(79,124,255,0.3)",
                      }
                    : {
                        background: "rgba(12,17,32,0.6)",
                        border: "1px solid rgba(30,45,69,0.8)",
                      }
                }
                aria-pressed={selectedTime === slot}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.time && (
            <p className="text-xs text-red-400 mt-2">{errors.time}</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full relative flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-display font-semibold text-sm text-white overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #4f7cff, #6b5ce7)",
            boxShadow:
              "0 0 0 1px rgba(79,124,255,0.4), 0 4px 24px rgba(79,124,255,0.3)",
          }}
          aria-label="Book consultation"
        >
          {status === "loading" ? (
            <>
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                <path
                  d="M8 2a6 6 0 016 6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Booking your call...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="12"
                  height="11"
                  rx="1.5"
                  stroke="white"
                  strokeWidth="1.2"
                />
                <path
                  d="M5 2v2M11 2v2M2 6h12"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M5 9h6M5 11.5h3.5"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Confirm Free Consultation</span>
            </>
          )}
        </button>

        {status === "error" && (
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p className="text-xs text-red-400 mb-1 font-medium">
              {apiError || "Something went wrong."}
            </p>
            <p className="text-xs text-[#6b7a99]">
              Email us directly at{" "}
              <a
                href="mailto:hello@renix.dev"
                className="text-red-400/80 hover:text-red-400 underline underline-offset-2"
              >
                hello@renix.dev
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingForm;
