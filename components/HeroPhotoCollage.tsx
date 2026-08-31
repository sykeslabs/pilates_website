import Image from "next/image";

const ARRANGEMENTS: Record<2 | 3 | 4, string[]> = {
  2: [
    "absolute left-0 top-6 h-44 w-44 -rotate-6 sm:h-56 sm:w-56",
    "absolute right-0 bottom-0 h-44 w-44 rotate-6 sm:h-56 sm:w-56",
  ],
  3: [
    "absolute left-0 top-4 h-40 w-40 -rotate-6 sm:h-48 sm:w-48",
    "absolute right-0 top-0 h-36 w-36 rotate-6 sm:h-44 sm:w-44",
    "absolute bottom-0 left-12 h-40 w-40 rotate-3 sm:h-48 sm:w-48",
  ],
  4: [
    "absolute left-0 top-0 h-32 w-32 -rotate-6 sm:h-40 sm:w-40",
    "absolute right-0 top-2 h-32 w-32 rotate-3 sm:h-40 sm:w-40",
    "absolute bottom-0 left-4 h-32 w-32 rotate-6 sm:h-40 sm:w-40",
    "absolute bottom-2 right-4 h-32 w-32 -rotate-3 sm:h-40 sm:w-40",
  ],
};

export function HeroPhotoCollage({ photos }: { photos: string[] }) {
  const shown = photos.slice(0, 4);
  const count = Math.min(Math.max(shown.length, 2), 4) as 2 | 3 | 4;
  const arrangement = ARRANGEMENTS[count];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      {shown.map((src, i) => (
        <div key={src} className={`${arrangement[i]} overflow-hidden rounded-2xl shadow-lg`}>
          <Image src={src} alt="" fill className="object-cover" sizes="224px" />
        </div>
      ))}
    </div>
  );
}
