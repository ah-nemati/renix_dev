<<<<<<< HEAD
import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * POST /api/book
 * Accepts booking form submissions.
 * Replace the stub below with your actual DB/email logic.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, brief, date, time } = body;

    // --- Basic server-side validation ---
    if (!name || !email || !brief || !date || !time) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Database / CRM integration stub ---
    // Example with a hypothetical DB client:
    //
    // import { db } from '../lib/db';
    // await db.bookings.create({ name, email, brief, date, time, createdAt: new Date() });
    //
    // Example with Resend for email notification:
    //
    // import { Resend } from 'resend';
    // const resend = new Resend(import.meta.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Renix.dev <noreply@renix.dev>',
    //   to: email,
    //   subject: 'Your consultation is confirmed',
    //   html: `<p>Hi ${name}, we'll see you on ${date} at ${time} UTC.</p>`,
    // });

    console.log('New booking received:', { name, email, date, time });

    return new Response(
      JSON.stringify({ success: true, message: 'Booking confirmed.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Booking error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
=======
import type { APIRoute } from "astro";
import { createBooking } from "../../lib/db";

export const prerender = false;

/**
 * POST /api/book
 * Creates a validated booking in Neon PostgreSQL database.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, company, service, budget, brief, date, time, timezone } = body;

    // --- Server-side validation ---
    if (!name || !email || !brief || !date || !time) {
      return new Response(
        JSON.stringify({ error: "Name, email, project brief, date, and time are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (brief.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please provide a brief description (at least 10 characters)." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Save to Neon PostgreSQL / Store
    const savedBooking = await createBooking({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim(),
      service: service || 'Web & AI Development',
      budget: budget || 'Flexible',
      brief: brief.trim(),
      date,
      time,
      timezone: timezone || 'UTC',
    });

    console.log("✓ Saved booking to database:", savedBooking.id, savedBooking.name, savedBooking.email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Consultation booked successfully! Calendar invitation sent.",
        booking: savedBooking,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("Booking error in /api/book:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
>>>>>>> cbbe2405399f00d3eb52549d05431e3c6386795e
