import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/admin/dashboard");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24">
      <h1 className="text-2xl font-semibold text-charcoal">{dict.adminLogin.heading}</h1>
      <p className="mt-2 text-center text-sm text-charcoal/60">{dict.adminLogin.subheading}</p>
      <div className="mt-8 w-full">
        <AdminLoginForm dict={dict.adminLogin} />
      </div>
    </div>
  );
}
