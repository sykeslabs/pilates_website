"use server";

import { sendContactMessageEmail } from "@/lib/email";

export async function notifyContactMessage(params: {
  name: string;
  email: string;
  message: string;
}) {
  await sendContactMessageEmail(params);
}
