"use client";

import { useEffect, useState } from "react";
import { floatingCta } from "@/src/content";

// Visible between the end of the hero and the order section.
export default function FloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      setShow(![...seen.values()].some(Boolean));
    });
    document.querySelectorAll("[data-hero], #commande").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="#commande"
      inert={!show}
      className={`fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-40 flex h-12 -translate-x-1/2 items-center bg-[#C9AE78] px-9 font-sans text-[11px] font-medium tracking-[.3em] text-[#0B0B0C] uppercase shadow-[0_10px_30px_rgba(0,0,0,.25)] motion-safe:transition-[opacity,translate] motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] ${
        show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {floatingCta}
    </a>
  );
}
