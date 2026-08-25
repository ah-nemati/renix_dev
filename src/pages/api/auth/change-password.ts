import type { APIRoute } from "astro";
import { verifyAdminAuth, changeUserPassword } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const auth = await verifyAdminAuth(request);

    if (!auth.authorized || !auth.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Both current password and new password are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await changeUserPassword(auth.user.id, currentPassword, newPassword);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || "Failed to update password." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
