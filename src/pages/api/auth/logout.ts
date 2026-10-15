import type { APIRoute } from "astro";
import { extractAuthToken, revokeSessionToken } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const token = extractAuthToken(request);
    if (token) {
      await revokeSessionToken(token);
    }

    // Clear session cookie
    const cookieHeader = `renix_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

    return new Response(
      JSON.stringify({ success: true, message: "Logged out successfully." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to log out" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
