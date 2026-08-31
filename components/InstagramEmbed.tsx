"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SCRIPT_ID = "instagram-embed-script";

export function InstagramEmbed({ url, maxWidth = 540 }: { url: string; maxWidth?: number }) {
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [url, maxWidth]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: "#FFF",
        border: 0,
        borderRadius: 12,
        margin: "0 auto",
        maxWidth,
        minWidth: 270,
        width: "100%",
        minHeight: 200,
      }}
    >
      <div style={{ padding: 16 }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            color: "#3897f0",
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            padding: "48px 0",
          }}
        >
          View this post on Instagram ↗
        </a>
      </div>
    </blockquote>
  );
}
