"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function PhotoSlider({
  photos,
  intervalMs = 4000,
  previousLabel = "Previous",
  nextLabel = "Next",
}: {
  photos: string[];
  intervalMs?: number;
  previousLabel?: string;
  nextLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [photos.length, intervalMs, resetKey]);

  if (photos.length === 0) return null;

  function goTo(i: number) {
    setIndex(((i % photos.length) + photos.length) % photos.length);
    setResetKey((k) => k + 1);
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-sage-50">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {photos.map((src) => (
          <div key={src} className="relative h-full w-full shrink-0">
            <Image src={src} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={previousLabel}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg text-charcoal shadow-sm transition hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={nextLabel}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg text-charcoal shadow-sm transition hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1} / ${photos.length}`}
                aria-current={i === index}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
