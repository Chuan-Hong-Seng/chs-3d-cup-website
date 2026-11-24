"use client";

import type { ReactNode } from "react";
import type { CupView } from "./cup-scene";

// Button size comes from --rail-btn (smaller on phones); gap between buttons is 4px.

const icon = "h-5 w-5";
const views: { id: CupView; label: string; icon: (seasonChar: string) => ReactNode }[] = [
  {
    id: "front",
    label: "Front",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={icon}>
        <path strokeLinejoin="round" d="M5 4h14l-1.6 16a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9L5 4Z" />
        <path strokeLinecap="round" d="M8.5 10h7M9 13.5h6" />
      </svg>
    ),
  },
  {
    id: "side",
    label: "Season side",
    icon: (seasonChar) => <span className="text-[17px] font-bold leading-none">{seasonChar}</span>,
  },
  {
    id: "label",
    label: "Ingredients label",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={icon}>
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <path strokeLinecap="round" d="M8.5 8h7M8.5 11.5h7M8.5 15h4" />
      </svg>
    ),
  },
  {
    id: "inside",
    label: "Inside the cup",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={icon}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" strokeDasharray="1.5 1.8" />
      </svg>
    ),
  },
];

type Props = {
  view: CupView | null;
  accent: string;
  seasonChar: string;
  onPick: (v: CupView) => void;
};

/** Slim glass rail of camera presets beside the cup. */
export function ViewRail({ view, accent, seasonChar, onPick }: Props) {
  const activeIndex = views.findIndex((v) => v.id === view);

  return (
    <nav
      aria-label="Cup views"
      className="absolute right-2.5 top-[31%] z-20 -translate-y-1/2 [--rail-btn:38px] sm:right-4 wide:right-10 wide:top-1/2 wide:[--rail-btn:44px] phoneland:right-4 phoneland:[--rail-btn:34px]"
    >
      <div className="relative flex flex-col gap-1 rounded-full bg-white/40 p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3)] ring-1 ring-white/70 backdrop-blur-2xl">
        {/* Sliding indicator */}
        <span
          aria-hidden
          className="absolute left-1 top-1 h-[var(--rail-btn)] w-[var(--rail-btn)] rounded-full bg-white shadow-md transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{
            transform: `translateY(calc(${Math.max(activeIndex, 0)} * (var(--rail-btn) + 4px)))`,
            opacity: activeIndex >= 0 ? 1 : 0,
          }}
        />
        {views.map((v) => {
          const isActive = v.id === view;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={isActive}
              aria-label={v.label}
              onClick={() => onPick(v.id)}
              className="group/v relative flex h-[var(--rail-btn)] w-[var(--rail-btn)] items-center justify-center rounded-full text-neutral-600 transition-colors duration-300 hover:text-neutral-900"
              style={isActive ? { color: accent } : undefined}
            >
              {v.icon(seasonChar)}
              <span className="pointer-events-none absolute right-full mr-3 hidden translate-x-1 whitespace-nowrap rounded-lg bg-neutral-900/85 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition duration-200 group-hover/v:translate-x-0 group-hover/v:opacity-100 lg:block">
                {isActive ? "Back to spin" : v.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
