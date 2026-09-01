"use client";

import { useEffect } from "react";

// Deep-linking into these sticky, full-viewport course sections via a plain
// hash + native scrollIntoView proved unreliable (landed one section off).
// This actively re-aligns the target to sit just below the sticky header
// every frame for a short window, self-correcting regardless of whatever
// else is nudging scroll position during that window.
const HEADER_OFFSET = 64;
const MAX_FRAMES = 20;

export function ScrollToCourse({ slug }: { slug?: string }) {
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    let frame = 0;

    function alignOnce() {
      if (cancelled) return;
      const el = document.getElementById(slug!);
      if (el) {
        const drift = el.getBoundingClientRect().top - HEADER_OFFSET;
        if (Math.abs(drift) > 1) {
          window.scrollBy({ top: drift, behavior: "auto" });
        }
      }

      frame += 1;
      if (frame < MAX_FRAMES) {
        requestAnimationFrame(alignOnce);
      }
    }

    const raf = requestAnimationFrame(alignOnce);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [slug]);

  return null;
}
