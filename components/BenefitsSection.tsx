import Image from "next/image";
import { StrengthIcon, PostureIcon, CalmIcon, ConfidenceIcon } from "@/components/BenefitIcons";
import type { Dictionary } from "@/messages/en";
import type { HomeBenefitsSettings } from "@/lib/types";

const FALLBACK_ICONS = [StrengthIcon, PostureIcon, CalmIcon, ConfidenceIcon];

export function BenefitsSection({
  dict,
  settings,
}: {
  dict: Pick<Dictionary, "home">;
  settings: HomeBenefitsSettings | null;
}) {
  const icons = [
    settings?.icon_1_url ?? null,
    settings?.icon_2_url ?? null,
    settings?.icon_3_url ?? null,
    settings?.icon_4_url ?? null,
  ];

  return (
    <section className="bg-sand px-6 py-20 lg:sticky lg:top-16 lg:z-50 lg:flex lg:min-h-screen lg:flex-col lg:justify-center">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
            {dict.home.benefitsEyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl italic tracking-tight text-charcoal sm:text-4xl">
            {dict.home.benefitsHeading}
          </h2>
          <p className="mt-4 text-charcoal/70">{dict.home.benefitsSubheading}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.benefits.map((benefit, i) => {
            const FallbackIcon = FALLBACK_ICONS[i];
            return (
              <div key={benefit.title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-700">
                  {icons[i] ? (
                    <span className="relative block h-14 w-14 overflow-hidden rounded-full">
                      <Image src={icons[i]!} alt="" fill className="object-cover" sizes="56px" />
                    </span>
                  ) : (
                    <FallbackIcon />
                  )}
                </div>
                <h3 className="mt-4 font-semibold text-charcoal">{benefit.title}</h3>
                <p className="mt-2 text-sm text-charcoal/70">{benefit.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
