"use client";

import { Children, useState } from "react";

export function Carousel({
  children,
  previousLabel,
  nextLabel,
}: {
  children: React.ReactNode;
  previousLabel: string;
  nextLabel: string;
}) {
  const items = Children.toArray(children);
  const count = items.length;
  const [index, setIndex] = useState(0);

  if (count === 0) return null;

  function goTo(i: number) {
    setIndex(((i % count) + count) % count);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2 sm:gap-4">
        {count > 1 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={previousLabel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sage-100 bg-white text-lg text-charcoal shadow-sm transition hover:border-sage-300 hover:shadow"
          >
            ‹
          </button>
        )}

        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {items.map((item, i) => (
              <div key={i} className="w-full shrink-0 px-1">
                {item}
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={nextLabel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sage-100 bg-white text-lg text-charcoal shadow-sm transition hover:border-sage-300 hover:shadow"
          >
            ›
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${i + 1} / ${count}`}
              aria-current={i === index}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? "bg-sage-700" : "bg-sage-100 hover:bg-sage-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
