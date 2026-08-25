import type { APIRoute } from "astro";
import { saveSubscriber } from "../../lib/db";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await saveSubscriber(email.trim().toLowerCase());
    return new Response(JSON.stringify(res), {
      status: res.success ? 200 : 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Failed to process subscription" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
