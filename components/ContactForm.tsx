"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyContactMessage } from "@/app/actions/contact";
import type { Dictionary } from "@/messages/en";

export function ContactForm({ dict }: { dict: Pick<Dictionary, "contactPage"> }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;

    setSubmitting(true);
    setStatus("idle");

    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({ name, email, message });

    setSubmitting(false);

    if (error) {
      setStatus("error");
      return;
    }

    notifyContactMessage({ name, email, message }).catch(() => {});
    setStatus("success");
    setName("");
    setEmail("");
    setMessage("");
  }

  if (status === "success") {
    return (
      <p className="rounded-xl bg-sage-50 p-4 text-sm text-sage-700">
        {dict.contactPage.formSuccess}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-charcoal">
          {dict.contactPage.formNameLabel}
        </label>
        <input
          id="contact-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-charcoal">
          {dict.contactPage.formEmailLabel}
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-charcoal">
          {dict.contactPage.formMessageLabel}
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{dict.contactPage.formError}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-sage-700 px-4 py-3 font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
      >
        {submitting ? dict.contactPage.formSubmitting : dict.contactPage.formSubmit}
      </button>
    </form>
  );
}
