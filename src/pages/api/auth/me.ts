import type { APIRoute } from "astro";
import { verifyAdminAuth } from "../../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const auth = await verifyAdminAuth(request);

    if (!auth.authorized || !auth.user) {
      return new Response(
        JSON.stringify({ authenticated: false, error: auth.error || "Not authenticated" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: auth.user,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ authenticated: false, error: err?.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
