"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

/** Full-screen brand loader that fades out once the cup textures are ready. */
export function IntroLoader({ accent }: { accent: string }) {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);
  const done = !active && progress >= 100;

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setHidden(true), 700);
    return () => clearTimeout(t);
  }, [done]);

  if (hidden) return null;

  return (
    <div
      aria-hidden={done}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#faf7f0] transition-opacity duration-700"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
    >
      <p className="text-5xl font-bold" style={{ color: accent }}>
        金兴美
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.4em] text-neutral-500">
        Chuan Heng Bee
      </p>
      <div className="mt-8 h-0.5 w-48 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${progress}%`, backgroundColor: accent }}
        />
      </div>
      <p className="mt-3 text-xs tabular-nums text-neutral-500">Brewing… {Math.round(progress)}%</p>
    </div>
  );
}
