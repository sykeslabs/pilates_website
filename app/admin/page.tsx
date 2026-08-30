import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24">
      <h1 className="text-2xl font-semibold text-charcoal">Studio login</h1>
      <p className="mt-2 text-center text-sm text-charcoal/60">
        Manage your courses, availability and bookings.
      </p>
      <div className="mt-8 w-full">
        <AdminLoginForm />
      </div>
    </div>
  );
}
