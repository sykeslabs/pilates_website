"use client";

import { useState } from "react";
import type { CourseType, SuccessStory } from "@/lib/types";
import { deleteSuccessStory, upsertSuccessStory } from "@/app/actions/admin";

function StoryForm({
  story,
  courses,
  onDone,
}: {
  story: SuccessStory | null;
  courses: CourseType[];
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await upsertSuccessStory(new FormData(e.currentTarget));
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6">
      {story && <input type="hidden" name="id" value={story.id} />}
      <div>
        <label className="block text-sm font-medium text-charcoal">Name</label>
        <input
          name="name"
          required
          defaultValue={story?.name}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Quote</label>
        <textarea
          name="quote"
          rows={3}
          required
          defaultValue={story?.quote}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Related course (optional)</label>
        <select
          name="course_type_id"
          defaultValue={story?.course_type_id ?? ""}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2"
        >
          <option value="">—</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal">Photo</label>
        <input name="photo" type="file" accept="image/*" className="mt-1 w-full text-sm" />
        <p className="mt-1 text-xs text-charcoal/50">
          {story?.photo_url ? "Leave empty to keep the current photo." : "Optional for now."}
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sage-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-sage-500 disabled:opacity-60"
        >
          {pending ? "Saving…" : story ? "Save changes" : "Add story"}
        </button>
        {story && (
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

export function StoriesTab({
  stories,
  courses,
}: {
  stories: SuccessStory[];
  courses: CourseType[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await deleteSuccessStory(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {stories.map((story) =>
        editingId === story.id ? (
          <StoryForm
            key={story.id}
            story={story}
            courses={courses}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <div
            key={story.id}
            className="flex items-center justify-between rounded-2xl border border-sage-100 bg-white p-5"
          >
            <div>
              <div className="font-medium text-charcoal">{story.name}</div>
              <div className="text-sm text-charcoal/60 line-clamp-1">{story.quote}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(story.id)}
                className="rounded-full border border-sage-100 px-4 py-2 text-sm text-charcoal hover:border-sage-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(story.id)}
                disabled={pendingId === story.id}
                className="rounded-full border border-sage-100 px-4 py-2 text-sm text-red-600 hover:border-red-300 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ),
      )}

      {adding ? (
        <StoryForm story={null} courses={courses} onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border border-dashed border-sage-300 py-4 text-sm font-medium text-sage-700 hover:bg-sage-50"
        >
          + Add a success story
        </button>
      )}
    </div>
  );
}
