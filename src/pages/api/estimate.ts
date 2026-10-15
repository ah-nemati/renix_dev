import type { APIRoute } from "astro";
import { saveEstimate } from "../../lib/db";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { project_type, platforms, features, timeline_weeks, min_cost, max_cost, contact_email } = body;

    if (!project_type || !platforms || !features) {
      return new Response(JSON.stringify({ error: "Missing required estimate parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const saved = await saveEstimate({
      project_type,
      platforms: Array.isArray(platforms) ? platforms : [platforms],
      features: Array.isArray(features) ? features : [features],
      timeline_weeks: Number(timeline_weeks) || 4,
      min_cost: Number(min_cost) || 5000,
      max_cost: Number(max_cost) || 12000,
      contact_email,
    });

    return new Response(JSON.stringify({ success: true, estimate: saved }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
