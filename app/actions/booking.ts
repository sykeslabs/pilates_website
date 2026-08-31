"use server";

import { sendBookingEmails, sendWaitlistEmails } from "@/lib/email";

export async function notifyBooking(params: {
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  participantRemark: string | null;
  courseName: string;
  startTime: string;
}) {
  await sendBookingEmails(params);
}

export async function notifyWaitlistJoin(params: {
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  courseName: string;
  startTime: string;
}) {
  await sendWaitlistEmails(params);
}
