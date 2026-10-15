import type { APIRoute } from "astro";
import { getDbHealth } from "../../lib/db";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const health = await getDbHealth();
    return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString(), ...health }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: "error", error: err?.message || "Health check failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
