"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Flavor } from "@/lib/flavors";

const MAGNIFY = 0.6; // extra scale on the icon right under the cursor
const RANGE = 140; // px — how far the magnification spreads to neighbours

type Props = {
  flavors: Flavor[];
  index: number;
  autoplay: boolean;
  autoplayMs: number;
  onSelect: (i: number) => void;
  onAutoplayEnd: () => void;
  onToggleAutoplay: () => void;
};

/** Play/pause for the auto slideshow: a ring fills and the seconds count down to the next flavour. */
function AutoplayButton({
  autoplay,
  accent,
  progress,
  secondsLeft,
  onToggle,
}: {
  autoplay: boolean;
  accent: string;
  progress: number;
  secondsLeft: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={autoplay}
      aria-label={autoplay ? `Pause auto slide, next in ${secondsLeft} seconds` : "Play auto slide"}
      className="group/play relative flex h-[calc(var(--dock-size)*0.9)] w-[calc(var(--dock-size)*0.9)] shrink-0 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md ring-1 ring-black/5 transition hover:scale-105"
    >
      <svg aria-hidden viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3.5" />
        <circle
          cx="22"
          cy="22"
          r="19"
          fill="none"
          stroke={accent}
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={autoplay ? 1 - progress : 1}
          className="transition-[stroke] duration-700"
        />
      </svg>

      {autoplay ? (
        <>
          {/* Countdown; swaps to a pause icon on hover */}
          <span
            className="text-sm font-semibold tabular-nums group-hover/play:hidden"
            style={{ color: accent }}
          >
            {secondsLeft}
          </span>
          <svg viewBox="0 0 24 24" fill="currentColor" className="hidden h-4 w-4 group-hover/play:block">
            <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" />
            <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" />
          </svg>
        </>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-4 w-4">
          <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z" />
        </svg>
      )}

      <span className="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap rounded-lg bg-neutral-900/85 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition duration-200 group-hover/play:-translate-y-1 group-hover/play:opacity-100">
        {autoplay ? `Next in ${secondsLeft}s · Pause` : "Auto slide"}
      </span>
    </button>
  );
}

/** macOS-style dock: tilted glass shelf, magnifying icons, tooltips, bounce on click. */
export function FlavorDock({
  flavors,
  index,
  autoplay,
  autoplayMs,
  onSelect,
  onAutoplayEnd,
  onToggleAutoplay,
}: Props) {
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(() => flavors.map(() => 1));
  const [bouncing, setBouncing] = useState<number | null>(null);

  // Auto slide timer: restarts whenever the flavour changes or play is pressed.
  const [progress, setProgress] = useState(0);
  const onEnd = useRef(onAutoplayEnd);
  useEffect(() => {
    onEnd.current = onAutoplayEnd;
  }, [onAutoplayEnd]);

  useEffect(() => {
    if (!autoplay) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / autoplayMs);
      setProgress(p);
      if (p >= 1) onEnd.current();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, autoplayMs, index]);

  const secondsLeft = Math.max(1, Math.ceil(((1 - progress) * autoplayMs) / 1000));

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setScales(
      items.current.map((el) => {
        if (!el) return 1;
        const r = el.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        return d > RANGE ? 1 : 1 + MAGNIFY * ((Math.cos((d / RANGE) * Math.PI) + 1) / 2);
      }),
    );
  };

  const reset = () => setScales(flavors.map(() => 1));

  return (
    <nav
      aria-label="Choose a flavour"
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className="group/dock relative z-20 mx-auto mb-4 mt-3 [--dock-size:46px] sm:[--dock-size:54px]"
    >
      {/* Tilted glass shelf */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[calc(var(--dock-size)+18px)] rounded-[22px] bg-white/45 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/70 backdrop-blur-2xl"
        style={{ transform: "perspective(600px) rotateX(40deg)", transformOrigin: "50% 100%" }}
      >
        <div className="absolute inset-x-3 top-0 h-px bg-white/90" />
      </div>

      <ul className="relative flex items-end gap-2 px-4 pb-3 sm:gap-3">
        {flavors.map((f, i) => {
          const isActive = i === index;
          const scale = scales[i] ?? 1;
          const size = `calc(var(--dock-size) * ${scale})`;
          return (
            <li
              key={f.id}
              ref={(el) => {
                items.current[i] = el;
              }}
              // Fixed height: a magnified icon grows upward out of the dock instead of
              // making the dock taller, so the rest of the page never shifts.
              className="group/item relative flex h-[calc(var(--dock-size)*1.22+2px)] flex-col items-center justify-end"
            >
              {/* Tooltip */}
              <span
                className="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap rounded-lg bg-neutral-900/85 px-3 py-1.5 text-center text-xs font-medium text-white opacity-0 shadow-lg backdrop-blur transition duration-200 group-hover/item:-translate-y-1 group-hover/item:opacity-100"
                style={{ marginBottom: `calc(${size} - var(--dock-size) + 12px)` }}
              >
                {f.name}
                <span className="ml-1.5 text-white/60">{f.chinese}</span>
                {f.comingSoon && <span className="ml-1.5 text-red-300">· Soon</span>}
              </span>

              <button
                type="button"
                onClick={() => {
                  setBouncing(i);
                  onSelect(i);
                }}
                aria-pressed={isActive}
                aria-label={f.comingSoon ? `${f.name} (coming soon)` : f.name}
                className={`relative block rounded-[24%] transition-[width,height] duration-150 ease-out ${bouncing === i ? "animate-dock-bounce" : ""}`}
                style={{ width: size, height: size }}
                onAnimationEnd={() => setBouncing(null)}
              >
                <span className="absolute inset-0 overflow-hidden rounded-[24%] shadow-[0_10px_20px_-6px_rgba(0,0,0,0.45)] ring-1 ring-black/10">
                  <Image src={f.thumb} alt="" fill sizes="90px" className="object-cover" />
                  {/* Gloss */}
                  <span className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/0 to-black/10" />
                </span>
                {f.comingSoon && (
                  <span className="absolute -right-1.5 -top-1.5 rounded-full bg-[#e5342a] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-white shadow ring-2 ring-white/80">
                    Soon
                  </span>
                )}
              </button>

              {/* Reflection on the shelf */}
              <span
                aria-hidden
                className="pointer-events-none relative mt-0.5 block overflow-hidden rounded-[24%] opacity-25 transition-[width] duration-150"
                style={{
                  width: size,
                  height: `calc(${size} * 0.22)`,
                  maskImage: "linear-gradient(to bottom, black, transparent)",
                  WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
                }}
              >
                <span
                  className="absolute inset-x-0 top-0 block -scale-y-100"
                  style={{ height: size }}
                >
                  <Image src={f.thumb} alt="" fill sizes="90px" className="object-cover object-bottom" />
                </span>
              </span>

              {/* Running indicator / autoplay progress */}
              <span className="absolute -bottom-2 flex h-1 items-center justify-center">
                {isActive && autoplay ? (
                  <span className="block h-1 w-6 overflow-hidden rounded-full bg-black/10">
                    <span
                      className="block h-full w-full origin-left rounded-full"
                      style={{ backgroundColor: f.accent, transform: `scaleX(${progress})` }}
                    />
                  </span>
                ) : (
                  <span
                    className="block h-1 w-1 rounded-full transition-opacity duration-300"
                    style={{ backgroundColor: f.accent, opacity: isActive ? 1 : 0 }}
                  />
                )}
              </span>
            </li>
          );
        })}

        {/* Divider + auto slide control, like the Downloads/Trash side of a Mac dock */}
        <li aria-hidden className="mx-0.5 mb-[calc(var(--dock-size)*0.3)] h-[calc(var(--dock-size)*0.7)] w-px self-end bg-black/15" />
        <li className="flex h-[calc(var(--dock-size)*1.22+2px)] items-start pt-[calc(var(--dock-size)*0.1)]">
          <AutoplayButton
            autoplay={autoplay}
            accent={flavors[index].accent}
            progress={progress}
            secondsLeft={secondsLeft}
            onToggle={onToggleAutoplay}
          />
        </li>
      </ul>
    </nav>
  );
}
