"use client";

import { useState } from "react";
import type { ContactMessage } from "@/lib/types";
import { deleteContactMessage } from "@/app/actions/admin";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function MessagesTab({ messages }: { messages: ContactMessage[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await deleteContactMessage(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {messages.length === 0 && (
        <p className="rounded-2xl border border-sage-100 bg-white p-6 text-center text-charcoal/50">
          No messages yet.
        </p>
      )}
      {messages.map((msg) => (
        <div key={msg.id} className="rounded-2xl border border-sage-100 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-charcoal">{msg.name}</div>
              <a href={`mailto:${msg.email}`} className="text-sm text-sage-700 hover:underline">
                {msg.email}
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-charcoal/50">
                {dateTimeFormatter.format(new Date(msg.created_at))}
              </span>
              <button
                onClick={() => handleDelete(msg.id)}
                disabled={pendingId === msg.id}
                className="rounded-full border border-sage-100 px-3 py-1 text-xs text-red-600 hover:border-red-300 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-charcoal/80">{msg.message}</p>
        </div>
      ))}
    </div>
  );
}
