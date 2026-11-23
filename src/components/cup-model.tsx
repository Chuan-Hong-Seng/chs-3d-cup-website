"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { flavors } from "@/lib/flavors";

/*
 * Dimensions come from the printed dieline: the wrap is an annular sector
 * (outer R ≈ 2598px, inner R ≈ 2116px, 29.5° after seam overlap), which rolls
 * into a truncated cone with top/bottom radius ratio 0.815 and height ≈ 2.25 × top radius.
 */
export const CUP = {
  height: 2,
  topRadius: 0.886,
  bottomRadius: 0.722,
  baseHeight: 0.12,
  rimTube: 0.03,
};

// Horizontal position (0–1) of the product name on the unwrapped texture.
const FRONT_U = 0.54;
const SWAP_DURATION = 1.1;

const textureUrls = flavors.map((f) => f.texture);
useTexture.preload([...textureUrls, "/textures/tea-filter.jpg"]);

const INTRO_DURATION = 1.6;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function CupModel({ index }: { index: number }) {
  const { height: h, topRadius: rT, bottomRadius: rB, baseHeight, rimTube } = CUP;

  const wraps = useTexture(textureUrls);
  const filter = useTexture("/textures/tea-filter.jpg");

  useMemo(() => {
    for (const t of [...wraps, filter]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
  }, [wraps, filter]);

  const group = useRef<THREE.Group>(null);
  const wrapMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const anim = useRef({ t: 1, target: index });
  const intro = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) intro.current = 1;
  }, []);

  // Flavour change: spin the cup a full turn and swap the print while it faces away.
  useEffect(() => {
    if (anim.current.target === index) return;
    anim.current.target = index;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced && wrapMaterial.current) {
      wrapMaterial.current.map = wraps[index];
      return;
    }
    anim.current.t = 0;
  }, [index, wraps]);

  useFrame((_, delta) => {
    const g = group.current;
    const a = anim.current;
    if (!g || !wrapMaterial.current) return;
    if (intro.current >= 1 && a.t >= 1) return;

    let y = 0;
    let rotY = 0;
    let scale = 1;

    // Entrance: drop in from above with a spin and a little bounce.
    if (intro.current < 1) {
      intro.current = Math.min(1, intro.current + delta / INTRO_DURATION);
      const p = intro.current;
      y += (1 - easeOutBack(p)) * 2.4;
      rotY -= (1 - easeOutCubic(p)) * Math.PI * 1.5;
      scale *= 0.7 + 0.3 * easeOutCubic(p);
    }

    // Flavour swap: full turn, print changes while the front faces away.
    if (a.t < 1) {
      a.t = Math.min(1, a.t + delta / SWAP_DURATION);
      const lift = Math.sin(Math.PI * a.t);
      rotY += easeInOutCubic(a.t) * Math.PI * 2;
      y += lift * 0.18;
      scale *= 1 - lift * 0.06;
      if (a.t >= 0.5) wrapMaterial.current.map = wraps[a.target];
    }

    g.position.y = y;
    g.rotation.y = a.t >= 1 && intro.current >= 1 ? 0 : rotY;
    g.scale.setScalar(scale);
  });

  const innerTop = rT - 0.018;
  const innerDepth = h - 0.08;
  const innerBottom = rT - ((rT - rB) * innerDepth) / h - 0.02;
  const floorY = h / 2 - innerDepth;

  return (
    <group ref={group}>
      {/* Printed paper wrap */}
      <mesh rotation-y={-FRONT_U * Math.PI * 2} castShadow>
        <cylinderGeometry args={[rT, rB, h, 160, 1, true]} />
        <meshStandardMaterial
          ref={wrapMaterial}
          map={wraps[index]}
          roughness={0.45}
          metalness={0}
        />
      </mesh>

      {/* Rolled rim (silver foil lip) */}
      <mesh position-y={h / 2} rotation-x={Math.PI / 2} castShadow>
        <torusGeometry args={[rT - 0.004, rimTube, 20, 160]} />
        <meshStandardMaterial color="#eef0f2" metalness={0.55} roughness={0.3} />
      </mesh>

      {/* Inner foil wall */}
      <mesh position-y={h / 2 - innerDepth / 2}>
        <cylinderGeometry args={[innerTop, innerBottom, innerDepth, 128, 1, true]} />
        <meshStandardMaterial
          color="#c4c9cd"
          metalness={0.6}
          roughness={0.35}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner floor */}
      <mesh position-y={floorY} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[innerBottom, 96]} />
        <meshStandardMaterial color="#b4b9bd" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Tea filter disc with leaves */}
      <mesh position-y={floorY + 0.004} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[innerBottom * 0.94, 96]} />
        <meshStandardMaterial map={filter} roughness={0.9} />
      </mesh>

      {/* White paper base below the wrap */}
      <mesh position-y={-h / 2 - baseHeight / 2} castShadow>
        <cylinderGeometry args={[rB - 0.006, rB - 0.022, baseHeight, 128, 1, true]} />
        <meshStandardMaterial color="#f7f5f0" roughness={0.6} />
      </mesh>
      <mesh position-y={-h / 2 - baseHeight} rotation-x={Math.PI / 2}>
        <circleGeometry args={[rB - 0.022, 96]} />
        <meshStandardMaterial color="#ebe8e1" roughness={0.7} />
      </mesh>
    </group>
  );
}
