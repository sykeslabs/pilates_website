import { createClient } from "@/lib/supabase/server";
import { faqQuestion, faqAnswer } from "@/lib/i18n/content";
import { ContactForm } from "@/components/ContactForm";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Faq, StudioInfo } from "@/lib/types";

export default async function FaqPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const [{ data: faqs }, { data: studio }] = await Promise.all([
    supabase.from("faqs").select("*").order("display_order", { ascending: true }).returns<Faq[]>(),
    supabase.from("studio_info").select("*").limit(1).maybeSingle<StudioInfo>(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
          {dict.faqPage.eyebrow}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic tracking-tight text-charcoal sm:text-5xl">
          {dict.faqPage.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-charcoal/70">{dict.faqPage.subheading}</p>
      </div>
      <div className="mt-12 space-y-3">
        {faqs?.map((faq) => (
          <details
            key={faq.id}
            className="group rounded-2xl border border-sage-100 bg-white open:shadow-sm"
          >
            <summary className="cursor-pointer list-none rounded-2xl p-5 font-medium text-charcoal marker:content-none transition hover:bg-sage-50 group-open:hover:bg-transparent">
              <span className="flex items-center justify-between gap-4">
                {faqQuestion(faq, locale)}
                <span className="shrink-0 text-sage-700 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-charcoal/70">
              {faqAnswer(faq, locale)}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-sage-700 px-8 py-12 text-cream">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl italic sm:text-4xl">
            {dict.faqPage.contactHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream/85">{dict.faqPage.contactBody}</p>
          {studio?.phone && (
            <a
              href={`tel:${studio.phone}`}
              className="mt-3 inline-block text-lg font-semibold text-cream hover:underline"
            >
              {studio.phone}
            </a>
          )}
        </div>
        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-white p-6 text-charcoal sm:p-8">
          <ContactForm dict={dict} />
        </div>
      </div>
    </div>
  );
}
