"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flavors } from "@/lib/flavors";
import { CupScene, type CupView } from "./cup-scene";
import { FlavorDock } from "./flavor-dock";
import { IntroLoader } from "./intro-loader";
import { ViewRail } from "./view-rail";

const highlights = ["Built-in tea filter", "Up to 5 steeps", "Just add hot water"];
const AUTOPLAY_MS = 6500;

/** Title where each letter rises in turn. */
function LetterTitle({ text }: { text: string }) {
  let i = 0;
  return (
    <h1
      aria-label={text}
      className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-6xl"
    >
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {word.split("").map((ch) => (
            <span
              key={i}
              className="animate-letter"
              style={{ animationDelay: `${80 + i++ * 28}ms` }}
            >
              {ch}
            </span>
          ))}
          {w < text.split(" ").length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}

export function CupShowcase() {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const glow = useRef<HTMLDivElement>(null);
  const active = flavors[index];
  const count = flavors.length;

  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + count) % count),
    [count],
  );

  // Picking a flavour keeps the auto slide running; its timer restarts from the new flavour.
  const choose = useCallback((next: number | ((i: number) => number)) => {
    setIndex(next);
  }, []);

  // Camera presets. Pressing the active view again goes back to free spinning.
  const [view, setView] = useState<CupView | null>(null);
  const [viewKey, setViewKey] = useState(0);
  const pickView = (v: CupView) => {
    setAutoplay(false);
    setView((cur) => (cur === v ? null : v));
    setViewKey((k) => k + 1);
  };

  // Advance when the progress ring completes; reduced-motion users never get auto-advance.
  const onRingEnd = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAutoplay(false);
    else go(1);
  }, [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") choose((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") choose((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, count]);

  // Browser tab shows the current flavour.
  useEffect(() => {
    document.title = `${active.name} · Chuan Heng Bee`;
  }, [active]);

  // Soft light that follows the cursor (no re-render).
  const onPointerMove = (e: React.PointerEvent) => {
    glow.current?.style.setProperty("--x", `${e.clientX}px`);
    glow.current?.style.setProperty("--y", `${e.clientY}px`);
  };

  return (
    <div
      onPointerMove={onPointerMove}
      className="relative flex h-dvh min-h-[600px] flex-col overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: active.background }}
    >
      <IntroLoader accent={active.accent} />

      {/* Accent glow behind the cup */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-1000 [--gx:50%] [--gy:30%] lg:[--gx:70%] lg:[--gy:47%]"
        style={{
          background: `radial-gradient(circle at var(--gx) var(--gy), ${active.accent}55 0%, ${active.accent}1a 28%, transparent 55%)`,
        }}
      />
      {/* Cursor light */}
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.45), transparent 60%)",
        }}
      />

      {/* Giant season character */}
      <span
        key={`wm-${active.id}`}
        aria-hidden
        className="animate-watermark pointer-events-none absolute left-1/2 top-[30%] select-none text-[40vh] font-black leading-none lg:left-[70%] lg:top-[47%] lg:text-[50vh]"
        style={{ color: active.accent }}
      >
        {active.seasonChar}
      </span>

      {/* Brand bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-6">
        <p className="text-sm font-semibold tracking-tight text-neutral-900">
          Chuan Heng Bee <span className="font-normal text-neutral-500">· 金兴美</span>
        </p>
        <p className="text-xs font-medium tabular-nums text-neutral-600">
          <span className="text-base font-semibold text-neutral-900">
            {String(index + 1).padStart(2, "0")}
          </span>{" "}
          / {String(count).padStart(2, "0")}
        </p>
      </header>

      {/* 3D cup — full-screen layer so the cup is never cut off */}
      <div
        onPointerDown={() => setAutoplay(false)}
        className="absolute inset-0 z-[5]"
      >
        <CupScene index={index} accent={active.accent} view={view} viewKey={viewKey} />
      </div>

      {/* Quick views beside the cup */}
      <ViewRail view={view} accent={active.accent} seasonChar={active.seasonChar} onPick={pickView} />

      <main className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-4 lg:justify-center lg:pb-0">
        {/* Copy */}
        <section key={active.id} className="min-w-0 lg:max-w-[46%]">
          <p
            className="animate-rise text-xs font-semibold uppercase tracking-[0.35em]"
            style={{ color: active.accent }}
          >
            {active.season} collection
            {active.comingSoon && (
              <span
                className="ml-3 rounded-full px-2.5 py-1 align-middle text-[10px] tracking-[0.2em] text-white"
                style={{ backgroundColor: active.accent }}
              >
                Coming soon
              </span>
            )}
          </p>
          <LetterTitle text={active.name} />
          <p
            className="animate-rise mt-2 text-2xl font-semibold text-neutral-800 sm:text-3xl"
            style={{ animationDelay: "380ms" }}
          >
            {active.chinese}
          </p>
          <p
            className="animate-rise mt-5 max-w-md font-light text-neutral-700"
            style={{ animationDelay: "460ms" }}
          >
            {active.ingredients}. Brewed hot, right in the cup.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {highlights.map((h, i) => (
              <li
                key={h}
                className="animate-rise rounded-full bg-white/55 px-3 py-1.5 text-xs font-medium text-neutral-800 ring-1 ring-black/5 backdrop-blur"
                style={{ animationDelay: `${540 + i * 70}ms` }}
              >
                {h}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <p className="pointer-events-none relative z-10 hidden text-center text-xs text-neutral-600 sm:block">
        Drag to rotate · Pinch to zoom · ← → to switch
      </p>

      {/* Flavour dock */}
      <FlavorDock
        flavors={flavors}
        index={index}
        autoplay={autoplay}
        autoplayMs={AUTOPLAY_MS}
        onSelect={(i) => choose(i)}
        onAutoplayEnd={onRingEnd}
        onToggleAutoplay={() => setAutoplay((a) => !a)}
      />
    </div>
  );
}
