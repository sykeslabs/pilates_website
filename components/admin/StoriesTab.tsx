"use client";

import { useState } from "react";
import type { CourseType, SuccessStory } from "@/lib/types";
import { deleteSuccessStory, upsertSuccessStory } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
      const formData = new FormData(e.currentTarget);
      const photo = formData.get("photo");
      formData.delete("photo");

      if (photo instanceof File && photo.size > 0) {
        const name = formData.get("name")?.toString().trim() || "story";
        formData.set("photo_url", await uploadPhoto(photo, `stories/${slugify(name)}`));
      }

      await upsertSuccessStory(formData);
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
      {(
        [
          { suffix: "", flag: "🇬🇧", label: "English", required: true },
          { suffix: "_de", flag: "🇩🇪", label: "German", required: false },
          { suffix: "_fr", flag: "🇫🇷", label: "French", required: false },
        ] as const
      ).map((lang) => (
        <div key={lang.suffix} className="space-y-3 rounded-xl bg-sage-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sage-700">
            {lang.flag} {lang.label}
            {!lang.required && <span className="font-normal text-charcoal/40"> (optional — falls back to English)</span>}
          </p>
          <div>
            <label className="block text-sm font-medium text-charcoal">Title</label>
            <input
              name={`title${lang.suffix}`}
              required={lang.required}
              defaultValue={story?.[`title${lang.suffix}` as "title"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Quote</label>
            <textarea
              name={`quote${lang.suffix}`}
              rows={3}
              required={lang.required}
              defaultValue={story?.[`quote${lang.suffix}` as "quote"]}
              className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
            />
          </div>
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-charcoal">Instagram post/reel URL (optional)</label>
        <input
          name="instagram_url"
          type="url"
          placeholder="https://www.instagram.com/reel/..."
          defaultValue={story?.instagram_url ?? ""}
          className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 focus:border-sage-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          When set, this replaces the text quote on the card with an embedded Instagram post. The
          post must be public.
        </p>
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
        {story?.photo_url && (
          <label className="mt-2 flex items-center gap-2 text-xs text-charcoal/60">
            <input type="checkbox" name="remove_photo" />
            Remove current photo
          </label>
        )}
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
              <div className="flex items-center gap-2">
                <span className="font-medium text-charcoal">{story.name}</span>
                <span className="text-xs text-charcoal/40">
                  {new Date(story.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-charcoal/60 line-clamp-1">
                {story.instagram_url ? story.instagram_url : story.quote}
              </div>
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
