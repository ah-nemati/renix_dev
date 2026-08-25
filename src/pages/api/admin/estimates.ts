import type { APIRoute } from "astro";
import { getEstimates, deleteEstimate } from "../../../lib/db";
import { verifyAdminAuth } from "../../../lib/auth";

export const prerender = false;

// GET /api/admin/estimates
export const GET: APIRoute = async ({ request }) => {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: auth.error || "Unauthorized access." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const estimates = await getEstimates();

    return new Response(JSON.stringify({ success: true, estimates }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to fetch estimates" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// DELETE /api/admin/estimates
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: auth.error || "Unauthorized access." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "id parameter is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deleted = await deleteEstimate(id);
    return new Response(JSON.stringify({ success: true, deleted }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to delete estimate" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
