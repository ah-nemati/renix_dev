import type { APIRoute } from "astro";
import { getBookings, getDbHealth } from "../../../lib/db";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const [bookings, health] = await Promise.all([
      getBookings(),
      getDbHealth(),
    ]);

    const total = bookings.length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const confirmed = bookings.filter(b => b.status === "confirmed").length;
    const completed = bookings.filter(b => b.status === "completed").length;
    const cancelled = bookings.filter(b => b.status === "cancelled").length;

    // Service popularity breakdown
    const serviceCounts: Record<string, number> = {};
    bookings.forEach(b => {
      const s = b.service || 'Web Development';
      serviceCounts[s] = (serviceCounts[s] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalBookings: total,
          pendingBookings: pending,
          confirmedBookings: confirmed,
          completedBookings: completed,
          cancelledBookings: cancelled,
          conversionRate: total > 0 ? Math.round(((confirmed + completed) / total) * 100) : 0,
          serviceCounts,
          databaseStatus: health,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to fetch stats" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
