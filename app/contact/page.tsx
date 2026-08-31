import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "@/components/ContactForm";
import { PhotoSlider } from "@/components/PhotoSlider";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { StudioInfo } from "@/lib/types";

export default async function ContactPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const { data: studio } = await supabase
    .from("studio_info")
    .select("*")
    .limit(1)
    .maybeSingle<StudioInfo>();

  const mapQuery = studio?.address
    ? encodeURIComponent(studio.address.replace(/\n/g, ", "))
    : null;

  const photos = studio
    ? [
        studio.photo_1_url,
        studio.photo_2_url,
        studio.photo_3_url,
        studio.photo_4_url,
        studio.photo_5_url,
        studio.photo_6_url,
        studio.photo_7_url,
      ].filter((url): url is string => Boolean(url))
    : [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          {dict.contactPage.heading}
        </h1>
        <p className="mt-3 text-charcoal/70">{dict.contactPage.subheading}</p>
      </div>

      {photos.length > 0 && (
        <div className="mt-12">
          <PhotoSlider photos={photos} />
        </div>
      )}

      {(studio?.address || studio?.phone || studio?.email) && (
        <div className="mt-12 grid gap-6 rounded-2xl border border-sage-100 bg-white p-6 sm:grid-cols-3">
          {studio?.address && (
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-sage-700">
                {dict.contactPage.addressLabel}
              </div>
              <p className="mt-1 whitespace-pre-line text-charcoal/80">{studio.address}</p>
            </div>
          )}
          {studio?.phone && (
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-sage-700">
                {dict.contactPage.phoneLabel}
              </div>
              <a href={`tel:${studio.phone}`} className="mt-1 block text-charcoal/80 hover:text-sage-700">
                {studio.phone}
              </a>
            </div>
          )}
          {studio?.email && (
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-sage-700">
                {dict.contactPage.emailLabel}
              </div>
              <a
                href={`mailto:${studio.email}`}
                className="mt-1 block text-charcoal/80 hover:text-sage-700"
              >
                {studio.email}
              </a>
            </div>
          )}
        </div>
      )}

      {mapQuery && (
        <div className="mt-12">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-sage-100">
            <iframe
              title="Studio location"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-sage-700 hover:underline"
          >
            {dict.contactPage.openInGoogleMaps}
          </a>
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-sage-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-charcoal">{dict.contactPage.formHeading}</h2>
        <div className="mt-4">
          <ContactForm dict={dict} />
        </div>
      </div>
    </div>
  );
}
