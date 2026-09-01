"use client";

import { useEffect, useRef, useState } from "react";

export function TruncatedQuote({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [children]);

  return (
    <div className="relative h-full">
      <blockquote
        ref={ref}
        className="h-full overflow-hidden text-sm leading-relaxed text-charcoal/80"
      >
        &ldquo;{children}&rdquo;
      </blockquote>
      {overflowing && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-8 items-end justify-end bg-gradient-to-t from-white via-white/90 to-transparent pr-1 text-sm text-charcoal/60"
        >
          …
        </div>
      )}
    </div>
  );
}
