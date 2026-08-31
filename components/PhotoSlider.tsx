"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function PhotoSlider({
  photos,
  intervalMs = 4000,
}: {
  photos: string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [photos.length, intervalMs]);

  if (photos.length === 0) return null;

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
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
