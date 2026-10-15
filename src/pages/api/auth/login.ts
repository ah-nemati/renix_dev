import type { APIRoute } from "astro";
import { authenticateAndCreateSession } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password, passcode } = body;

    const identifier = email || 'admin@renix.dev';
    const secret = password || passcode;

    if (!secret || secret.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Password or passcode is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;

    const result = await authenticateAndCreateSession(identifier, secret, {
      userAgent,
      ipAddress,
    });

    if (!result.success || !result.session) {
      return new Response(
        JSON.stringify({ error: result.error || "Authentication failed." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Set secure cookie for session
    const isProduction = process.env.NODE_ENV === "production";
    const cookieHeader = `renix_session=${encodeURIComponent(result.session.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${isProduction ? '; Secure' : ''}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Logged in successfully.",
        token: result.session.token,
        user: result.session.user,
        expiresAt: result.session.expires_at,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (err: any) {
    console.error("Login API error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
