import { createClient } from "@/lib/supabase/client";

// Uploads straight from the browser to Supabase Storage, so the file's bytes
// never pass through a Server Action / Vercel serverless function — those
// have their own hard body-size limits (Vercel: 4.5MB) that can't be raised.
export async function uploadPhoto(file: File, pathPrefix: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${pathPrefix}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("course-photos").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from("course-photos").getPublicUrl(path);
  return data.publicUrl;
}
