"use client";

import { useState } from "react";
import type { Faq } from "@/lib/types";
import { deleteFaq, upsertFaq } from "@/app/actions/admin";

const languages = [
  { suffix: "", flag: "🇬🇧", label: "English", required: true },
  { suffix: "_de", flag: "🇩🇪", label: "German", required: false },
  { suffix: "_fr", flag: "🇫🇷", label: "French", required: false },
] as const;

function FaqForm({ faq, onDone }: { faq: Faq | null; onDone: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await upsertFaq(new FormData(e.currentTarget));
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <input type="hidden" name="display_order" value={faq?.display_order ?? 0} readOnly />
      {languages.map((lang) => (
        <div key={lang.suffix} className="space-y-3 rounded-xl bg-sage-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-700">
            {lang.flag} {lang.label}
            {!lang.required && (
              <span className="font-normal text-charcoal/40"> (optional — falls back to English)</span>
            )}
          </p>
          <div>
            <label className="block text-sm font-medium text-charcoal">Question</label>
            <input
              name={`question${lang.suffix}`}
              required={lang.required}
              defaultValue={faq?.[`question${lang.suffix}` as "question"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Answer</label>
            <textarea
              name={`answer${lang.suffix}`}
              rows={3}
              required={lang.required}
              defaultValue={faq?.[`answer${lang.suffix}` as "answer"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sage-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
        >
          {pending ? "Saving…" : faq ? "Save changes" : "Add question"}
        </button>
        {faq && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-sage-100 px-5 py-2 text-sm font-medium text-charcoal hover:border-sage-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function FaqTab({ faqs }: { faqs: Faq[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await deleteFaq(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {adding ? (
        <FaqForm faq={null} onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl bg-sage-700 py-4 text-sm font-medium text-white transition hover:bg-sage-500"
        >
          + Add a question
        </button>
      )}

      {faqs.map((faq) =>
        editingId === faq.id ? (
          <FaqForm key={faq.id} faq={faq} onDone={() => setEditingId(null)} />
        ) : (
          <div
            key={faq.id}
            className="flex items-center justify-between rounded-2xl border border-sage-100 bg-white p-5"
          >
            <div>
              <div className="font-medium text-charcoal">{faq.question}</div>
              <div className="text-sm text-charcoal/60 line-clamp-1">{faq.answer}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(faq.id)}
                className="rounded-full border border-sage-100 px-4 py-2 text-sm text-charcoal hover:border-sage-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                disabled={pendingId === faq.id}
                className="rounded-full border border-sage-100 px-4 py-2 text-sm text-red-600 hover:border-red-300 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
