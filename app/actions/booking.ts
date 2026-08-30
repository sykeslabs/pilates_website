"use server";

import { sendBookingEmails } from "@/lib/email";

export async function notifyBooking(params: {
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  courseName: string;
  startTime: string;
}) {
  await sendBookingEmails(params);
}
