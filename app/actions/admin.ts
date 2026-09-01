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

// Shared by every "numbered photo slots" form (Hero, Contact info,
// Instructor gallery, course-page icons): each slot either keeps its
// existing value (nothing in the returned object), gets replaced (a new
// `<prefix>_N_url` was already uploaded client-side), or is explicitly
// cleared (`remove_<prefix>_N`).
function photoSlotValues(
  formData: FormData,
  count: number,
  prefix = "photo",
): Record<string, string | null> {
  const values: Record<string, string | null> = {};
  for (let i = 1; i <= count; i++) {
    const key = `${prefix}_${i}_url`;
    const newUrl = formData.get(key)?.toString().trim();
    const remove = formData.get(`remove_${prefix}_${i}`) === "on";
    if (remove) {
      values[key] = null;
    } else if (newUrl) {
      values[key] = newUrl;
    }
  }
  return values;
}

export async function upsertCourseType(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString().trim() ?? "";
  const name_de = formData.get("name_de")?.toString().trim() ?? "";
  const name_fr = formData.get("name_fr")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const description_de = formData.get("description_de")?.toString().trim() ?? "";
  const description_fr = formData.get("description_fr")?.toString().trim() ?? "";
  const brief_description = formData.get("brief_description")?.toString().trim() ?? "";
  const brief_description_de = formData.get("brief_description_de")?.toString().trim() ?? "";
  const brief_description_fr = formData.get("brief_description_fr")?.toString().trim() ?? "";
  const badge_label = formData.get("badge_label")?.toString().trim() || null;
  const badge_label_de = formData.get("badge_label_de")?.toString().trim() || null;
  const badge_label_fr = formData.get("badge_label_fr")?.toString().trim() || null;
  const duration_minutes = Number(formData.get("duration_minutes"));
  const capacity_default = Number(formData.get("capacity_default"));
  const priceRaw = formData.get("price_chf")?.toString().trim();
  const price_chf = priceRaw ? Number(priceRaw) : null;
  const class_type = formData.get("class_type")?.toString() ?? "group";

  if (!name) throw new Error("Course name (English) is required.");
  if (!["group", "private", "semi_private"].includes(class_type)) {
    throw new Error("Invalid class type.");
  }

  const removePhoto = formData.get("remove_photo") === "on";
  const newPhotoUrl = formData.get("photo_url")?.toString().trim() || null;

  if (id) {
    const { error } = await supabase
      .from("course_types")
      .update({
        name,
        name_de,
        name_fr,
        description,
        description_de,
        description_fr,
        brief_description,
        brief_description_de,
        brief_description_fr,
        badge_label,
        badge_label_de,
        badge_label_fr,
        duration_minutes,
        capacity_default,
        price_chf,
        class_type,
        ...(removePhoto ? { photo_url: null } : newPhotoUrl ? { photo_url: newPhotoUrl } : {}),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("course_types").insert({
      slug: slugify(name),
      name,
      name_de,
      name_fr,
      description,
      description_de,
      description_fr,
      brief_description,
      brief_description_de,
      brief_description_fr,
      badge_label,
      badge_label_de,
      badge_label_fr,
      duration_minutes,
      capacity_default,
      price_chf,
      class_type,
      photo_url: newPhotoUrl,
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
  const title = formData.get("title")?.toString().trim() ?? "";
  const title_de = formData.get("title_de")?.toString().trim() ?? "";
  const title_fr = formData.get("title_fr")?.toString().trim() ?? "";
  const quote = formData.get("quote")?.toString().trim() ?? "";
  const quote_de = formData.get("quote_de")?.toString().trim() ?? "";
  const quote_fr = formData.get("quote_fr")?.toString().trim() ?? "";
  const course_type_id = formData.get("course_type_id")?.toString() || null;
  const instagram_url = formData.get("instagram_url")?.toString().trim() || null;

  if (!name || !title || !quote) {
    throw new Error("Name, title, and quote (English) are required.");
  }

  const removePhoto = formData.get("remove_photo") === "on";
  const newPhotoUrl = formData.get("photo_url")?.toString().trim() || null;

  if (id) {
    const { error } = await supabase
      .from("success_stories")
      .update({
        name,
        title,
        title_de,
        title_fr,
        quote,
        quote_de,
        quote_fr,
        course_type_id,
        instagram_url,
        ...(removePhoto ? { photo_url: null } : newPhotoUrl ? { photo_url: newPhotoUrl } : {}),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("success_stories").insert({
      name,
      title,
      title_de,
      title_fr,
      quote,
      quote_de,
      quote_fr,
      course_type_id,
      instagram_url,
      photo_url: newPhotoUrl,
    });
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

export async function upsertInstructor(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString().trim() ?? "";
  const credentials = formData.get("credentials")?.toString().trim() ?? "";
  const credentials_de = formData.get("credentials_de")?.toString().trim() ?? "";
  const credentials_fr = formData.get("credentials_fr")?.toString().trim() ?? "";
  const bio = formData.get("bio")?.toString().trim() ?? "";
  const bio_de = formData.get("bio_de")?.toString().trim() ?? "";
  const bio_fr = formData.get("bio_fr")?.toString().trim() ?? "";

  if (!name) throw new Error("Name is required.");

  const removePhoto = formData.get("remove_photo") === "on";
  const newPhotoUrl = formData.get("photo_url")?.toString().trim() || null;
  const galleryValues = photoSlotValues(formData, 7);

  const baseValues = { name, credentials, credentials_de, credentials_fr, bio, bio_de, bio_fr };

  if (id) {
    const { error } = await supabase
      .from("instructor")
      .update({
        ...baseValues,
        ...galleryValues,
        ...(removePhoto ? { photo_url: null } : newPhotoUrl ? { photo_url: newPhotoUrl } : {}),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("instructor")
      .insert({ ...baseValues, ...galleryValues, photo_url: newPhotoUrl });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/about");
}

export async function upsertHeroSection(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const layout = formData.get("layout")?.toString() ?? "illustration";

  if (!["illustration", "single_photo", "collage"].includes(layout)) {
    throw new Error("Invalid layout.");
  }

  const values: Record<string, string | null> = { layout, ...photoSlotValues(formData, 4) };

  if (id) {
    const { error } = await supabase.from("hero_section").update(values).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("hero_section").insert(values);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function upsertFaq(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const question = formData.get("question")?.toString().trim() ?? "";
  const question_de = formData.get("question_de")?.toString().trim() ?? "";
  const question_fr = formData.get("question_fr")?.toString().trim() ?? "";
  const answer = formData.get("answer")?.toString().trim() ?? "";
  const answer_de = formData.get("answer_de")?.toString().trim() ?? "";
  const answer_fr = formData.get("answer_fr")?.toString().trim() ?? "";
  const display_order = Number(formData.get("display_order")) || 0;

  if (!question || !answer) throw new Error("Question and answer (English) are required.");

  const values = {
    question,
    question_de,
    question_fr,
    answer,
    answer_de,
    answer_fr,
    display_order,
  };

  if (id) {
    const { error } = await supabase.from("faqs").update(values).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("faqs").insert(values);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/faq");
}

export async function deleteFaq(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/faq");
}

export async function upsertStudioInfo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const phone = formData.get("phone")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const address = formData.get("address")?.toString().trim() ?? "";

  const values: Record<string, string | null> = {
    phone,
    email,
    address,
    ...photoSlotValues(formData, 7),
  };

  if (id) {
    const { error } = await supabase.from("studio_info").update(values).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("studio_info").insert(values);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/contact");
  revalidatePath("/faq");
}

export async function upsertCoursePageSettings(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const values = {
    ...photoSlotValues(formData, 3, "value_icon"),
    ...photoSlotValues(formData, 3, "hero_photo"),
  };

  if (id) {
    const { error } = await supabase.from("course_page_settings").update(values).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("course_page_settings").insert(values);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/courses");
}

export async function upsertHomeBenefitsSettings(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString() || null;
  const values = photoSlotValues(formData, 4, "icon");

  if (id) {
    const { error } = await supabase.from("home_benefits_settings").update(values).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("home_benefits_settings").insert(values);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function deleteContactMessage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
}

export async function deleteWaitlistEntry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("waitlist_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
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
