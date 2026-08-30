"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendCancellationEmail } from "@/lib/email";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadPhotoIfProvided(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photo: FormDataEntryValue | null,
  pathPrefix: string,
): Promise<string | null> {
  if (!(photo instanceof File) || photo.size === 0) return null;

  const ext = photo.name.split(".").pop() || "jpg";
  const path = `${pathPrefix}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("course-photos").upload(path, photo, {
    contentType: photo.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from("course-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function upsertCourseType(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const duration_minutes = Number(formData.get("duration_minutes"));
  const capacity_default = Number(formData.get("capacity_default"));
  const priceRaw = formData.get("price_chf")?.toString().trim();
  const price_chf = priceRaw ? Number(priceRaw) : null;

  if (!name) throw new Error("Course name is required.");

  const photo_url = await uploadPhotoIfProvided(
    supabase,
    formData.get("photo"),
    `courses/${slugify(name)}`,
  );

  if (id) {
    const { error } = await supabase
      .from("course_types")
      .update({
        name,
        description,
        duration_minutes,
        capacity_default,
        price_chf,
        ...(photo_url ? { photo_url } : {}),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("course_types").insert({
      slug: slugify(name),
      name,
      description,
      duration_minutes,
      capacity_default,
      price_chf,
      photo_url,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/book");
}

export async function setCourseTypeActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("course_types")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/book");
}

export async function upsertSuccessStory(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString().trim() ?? "";
  const quote = formData.get("quote")?.toString().trim() ?? "";
  const course_type_id = formData.get("course_type_id")?.toString() || null;

  if (!name || !quote) throw new Error("Name and quote are required.");

  const photo_url = await uploadPhotoIfProvided(
    supabase,
    formData.get("photo"),
    `stories/${slugify(name)}`,
  );

  if (id) {
    const { error } = await supabase
      .from("success_stories")
      .update({ name, quote, course_type_id, ...(photo_url ? { photo_url } : {}) })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("success_stories")
      .insert({ name, quote, course_type_id, photo_url });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function deleteSuccessStory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("success_stories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

// `starts` are ISO instants computed in the browser (see AvailabilityTab),
// not parsed from date/time strings here — the server process's timezone
// need not match the studio's, so any date math has to happen client-side.
export async function createAvailabilitySlots({
  course_type_id,
  starts,
  duration_minutes,
  capacity,
}: {
  course_type_id: string;
  starts: string[];
  duration_minutes: number;
  capacity: number;
}) {
  const supabase = await createClient();

  if (!course_type_id || starts.length === 0 || !duration_minutes || !capacity) {
    throw new Error("All fields are required.");
  }

  const rows = starts.map((start) => ({
    course_type_id,
    start_time: start,
    end_time: new Date(new Date(start).getTime() + duration_minutes * 60_000).toISOString(),
    capacity,
  }));

  const { error } = await supabase.from("availability_slots").insert(rows);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/book");
}

export async function deactivateAvailabilitySlot(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability_slots")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/book");
}

export async function deleteAvailabilitySlot(id: string) {
  const supabase = await createClient();

  const { data: slot } = await supabase
    .from("availability_slots")
    .select("booked_count")
    .eq("id", id)
    .single();

  if (slot && slot.booked_count > 0) {
    throw new Error("This slot has bookings — deactivate it instead of deleting.");
  }

  const { error } = await supabase.from("availability_slots").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/book");
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: booking, error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });
  if (error) throw new Error(error.message);

  const { data: slot } = await supabase
    .from("availability_slots")
    .select("start_time, course_types(name)")
    .eq("id", booking.slot_id)
    .single();
  const courseName = slot?.course_types?.[0]?.name;

  if (courseName && slot) {
    await sendCancellationEmail({
      participantName: booking.participant_name,
      participantEmail: booking.email,
      courseName,
      startTime: slot.start_time,
    });
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/book");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}
