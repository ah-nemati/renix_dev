import type { APIRoute } from "astro";
import { getBookings, updateBookingStatus, deleteBooking } from "../../../lib/db";

export const prerender = false;

// GET /api/admin/bookings?status=all&search=alex
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";

    const bookings = await getBookings({ status, search });

    return new Response(JSON.stringify({ success: true, bookings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to fetch bookings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// PATCH /api/admin/bookings
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id || !status) {
      return new Response(JSON.stringify({ error: "id and status are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updated = await updateBookingStatus(id, status, admin_notes);
    if (!updated) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, booking: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to update booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// DELETE /api/admin/bookings
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "id query parameter is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deleted = await deleteBooking(id);
    return new Response(JSON.stringify({ success: true, deleted }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to delete booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
