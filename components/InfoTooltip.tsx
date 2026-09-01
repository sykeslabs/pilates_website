"use client";

import { useEffect, useRef, useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="More info"
        aria-expanded={open}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full border border-charcoal/40 text-[10px] font-semibold normal-case leading-none text-charcoal/60 hover:border-sage-500 hover:text-sage-700"
      >
        i
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-20 mb-2 w-56 rounded-lg border border-sage-100 bg-white p-3 text-left text-xs font-normal normal-case leading-relaxed text-charcoal shadow-lg">
          {text}
        </div>
      )}
    </span>
  );
}
