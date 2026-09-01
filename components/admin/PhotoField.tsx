import Image from "next/image";

export function PhotoField({
  name,
  label,
  existingUrl,
  hint,
  removeName,
}: {
  name: string;
  label: string;
  existingUrl?: string | null;
  hint?: string;
  removeName?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        {existingUrl && (
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-sage-100 bg-sage-50">
            <Image src={existingUrl} alt="" fill className="object-cover" sizes="56px" />
          </span>
        )}
        <input name={name} type="file" accept="image/*" className="w-full text-sm" />
      </div>
      {hint && <p className="mt-1 text-xs text-charcoal/50">{hint}</p>}
      {existingUrl && removeName && (
        <label className="mt-2 flex items-center gap-2 text-xs text-charcoal/60">
          <input type="checkbox" name={removeName} />
          Remove current photo
        </label>
      )}
    </div>
  );
}
