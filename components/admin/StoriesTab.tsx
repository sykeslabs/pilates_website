"use client";

import { useMemo, useState } from "react";
import type { CourseType, SuccessStory } from "@/lib/types";
import { deleteSuccessStory, upsertSuccessStory } from "@/app/actions/admin";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { PhotoField } from "@/components/admin/PhotoField";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type SortKey = "name" | "title" | "course" | "submitted";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  sortKeyValue,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  sortKeyValue: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === sortKeyValue;
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(sortKeyValue)}
        className={`flex items-center gap-1 hover:text-sage-700 ${active ? "text-sage-700" : ""}`}
      >
        {label}
        {active && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

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
      <PhotoField
        name="photo"
        label="Photo"
        existingUrl={story?.photo_url}
        removeName="remove_photo"
        hint={story?.photo_url ? "Leave empty to keep the current photo." : "Optional for now."}
      />
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

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const coursesById = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const visibleStories = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    const filtered = stories.filter((story) => {
      const submitted = new Date(story.created_at);
      if (from && submitted < from) return false;
      if (to && submitted > to) return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "title":
          return a.title.localeCompare(b.title) * dir;
        case "course":
          return (
            (coursesById.get(a.course_type_id ?? "") ?? "").localeCompare(
              coursesById.get(b.course_type_id ?? "") ?? "",
            ) * dir
          );
        case "submitted":
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });
  }, [stories, fromDate, toDate, sortKey, sortDir, coursesById]);

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
    <div className="space-y-6">
      {adding ? (
        <StoryForm story={null} courses={courses} onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl bg-sage-700 py-4 text-sm font-medium text-white transition hover:bg-sage-500"
        >
          + Add a success story
        </button>
      )}

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-sage-100 bg-white p-4 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-charcoal/60">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal/60">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-100 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {editingId &&
        (() => {
          const story = stories.find((s) => s.id === editingId);
          return story ? (
            <StoryForm story={story} courses={courses} onDone={() => setEditingId(null)} />
          ) : null;
        })()}

      <div className="overflow-x-auto rounded-2xl border border-sage-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage-50 text-charcoal/70">
            <tr>
              <SortHeader
                label="Name"
                sortKeyValue="name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Title"
                sortKeyValue="title"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Course"
                sortKeyValue="course"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th className="px-4 py-3">Instagram</th>
              <SortHeader
                label="Submitted"
                sortKeyValue="submitted"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visibleStories.map((story) => (
              <tr key={story.id} className="border-t border-sage-100">
                <td className="px-4 py-3 font-medium text-charcoal">{story.name}</td>
                <td className="px-4 py-3 max-w-[220px] truncate">{story.title}</td>
                <td className="px-4 py-3">
                  {coursesById.get(story.course_type_id ?? "") ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {story.instagram_url ? (
                    <a
                      href={story.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sage-700 hover:underline"
                    >
                      View ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">{dateFormatter.format(new Date(story.created_at))}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(story.id)}
                      className="rounded-full border border-sage-100 px-3 py-1 text-xs hover:border-sage-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      disabled={pendingId === story.id}
                      className="rounded-full border border-sage-100 px-3 py-1 text-xs text-red-600 hover:border-red-300 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleStories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-charcoal/50">
                  {stories.length === 0
                    ? "No success stories yet."
                    : "No success stories match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
