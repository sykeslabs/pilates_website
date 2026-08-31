import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Zurich",
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function emailFrom() {
  return process.env.BOOKING_EMAIL_FROM || "Studio Pilates <onboarding@resend.dev>";
}

// Best-effort: a failed email must never undo an already-confirmed booking,
// so every failure here is swallowed rather than thrown.
export async function sendBookingEmails(params: {
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  participantRemark: string | null;
  courseName: string;
  startTime: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const from = emailFrom();
    const when = dateTimeFormatter.format(new Date(params.startTime));
    const name = escapeHtml(params.participantName);
    const course = escapeHtml(params.courseName);

    await Promise.allSettled([
      resend.emails.send({
        from,
        to: params.participantEmail,
        subject: `Booking confirmed: ${params.courseName}`,
        html: `<p>Hi ${name},</p><p>Your spot for <strong>${course}</strong> on <strong>${when}</strong> is confirmed. See you there!</p>`,
      }),
      process.env.STUDIO_OWNER_EMAIL
        ? resend.emails.send({
            from,
            to: process.env.STUDIO_OWNER_EMAIL,
            subject: `New booking: ${params.courseName}`,
            html: `<p>New booking for <strong>${course}</strong> on <strong>${when}</strong>.</p><p>${name} &mdash; ${escapeHtml(
              params.participantEmail,
            )}${params.participantPhone ? ` &mdash; ${escapeHtml(params.participantPhone)}` : ""}</p>${
              params.participantRemark
                ? `<p><strong>Comment:</strong> ${escapeHtml(params.participantRemark)}</p>`
                : ""
            }`,
          })
        : Promise.resolve(),
    ]);
  } catch {
    // Email is a nice-to-have on top of an already-confirmed booking.
  }
}

// Best-effort, same as above: the booking is already cancelled in the
// database regardless of whether this email goes out.
export async function sendCancellationEmail(params: {
  participantName: string;
  participantEmail: string;
  courseName: string;
  startTime: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const when = dateTimeFormatter.format(new Date(params.startTime));
    const name = escapeHtml(params.participantName);
    const course = escapeHtml(params.courseName);

    await resend.emails.send({
      from: emailFrom(),
      to: params.participantEmail,
      subject: `Booking cancelled: ${params.courseName}`,
      html: `<p>Hi ${name},</p><p>Your booking for <strong>${course}</strong> on <strong>${when}</strong> has been cancelled by the studio. If this is unexpected, please get in touch.</p>`,
    });
  } catch {
    // Email is a nice-to-have on top of an already-cancelled booking.
  }
}

// Best-effort: the waitlist entry is already saved regardless of whether
// this email goes out.
export async function sendWaitlistEmails(params: {
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  courseName: string;
  startTime: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const from = emailFrom();
    const when = dateTimeFormatter.format(new Date(params.startTime));
    const name = escapeHtml(params.participantName);
    const course = escapeHtml(params.courseName);

    await Promise.allSettled([
      resend.emails.send({
        from,
        to: params.participantEmail,
        subject: `You're on the waitlist: ${params.courseName}`,
        html: `<p>Hi ${name},</p><p>That session for <strong>${course}</strong> on <strong>${when}</strong> is full, but we've added you to the waitlist. We'll be in touch if a spot opens up.</p>`,
      }),
      process.env.STUDIO_OWNER_EMAIL
        ? resend.emails.send({
            from,
            to: process.env.STUDIO_OWNER_EMAIL,
            subject: `New waitlist entry: ${params.courseName}`,
            html: `<p>New waitlist entry for <strong>${course}</strong> on <strong>${when}</strong>.</p><p>${name} &mdash; ${escapeHtml(
              params.participantEmail,
            )}${params.participantPhone ? ` &mdash; ${escapeHtml(params.participantPhone)}` : ""}</p>`,
          })
        : Promise.resolve(),
    ]);
  } catch {
    // Email is a nice-to-have on top of the already-saved waitlist entry.
  }
}

// Best-effort: the message is already persisted in contact_messages
// regardless of whether this notification email goes out.
export async function sendContactMessageEmail(params: {
  name: string;
  email: string;
  message: string;
}) {
  const resend = getResendClient();
  if (!resend || !process.env.STUDIO_OWNER_EMAIL) return;

  try {
    await resend.emails.send({
      from: emailFrom(),
      to: process.env.STUDIO_OWNER_EMAIL,
      replyTo: params.email,
      subject: `New contact message from ${params.name}`,
      html: `<p><strong>${escapeHtml(params.name)}</strong> (${escapeHtml(params.email)}) wrote:</p><p>${escapeHtml(
        params.message,
      ).replace(/\n/g, "<br>")}</p>`,
    });
  } catch {
    // Email is a nice-to-have on top of the already-saved message.
  }
}
