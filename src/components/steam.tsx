"use client";

import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.35 + uSeed;
    float sway = (fbm(vec2(uv.y * 1.6 - t, uSeed)) - 0.5) * 0.7 * uv.y;
    float x = uv.x - 0.5 + sway;
    float width = mix(0.06, 0.26, uv.y);
    float column = smoothstep(width, 0.0, abs(x));
    float wisps = smoothstep(0.3, 0.85, fbm(vec2(uv.x * 2.0 + uSeed, uv.y * 2.4 - t * 1.6)));
    float fade = smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.45, uv.y);
    float alpha = column * wisps * fade * uOpacity;
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`;

function Wisp({ seed, x, scale }: { seed: number; x: number; scale: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSeed: { value: seed }, uOpacity: { value: 0.42 } }),
    [seed],
  );

  useFrame((_, delta) => {
    if (material.current) material.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh position={[x, 0, 0]} scale={scale}>
      <planeGeometry args={[0.9, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/** Soft hot-tea steam rising above the rim. */
export function Steam({ y }: { y: number }) {
  return (
    <Billboard position={[0, y, 0]} lockX lockZ>
      <Wisp seed={1.3} x={-0.2} scale={1} />
      <Wisp seed={7.9} x={0.18} scale={0.85} />
      <Wisp seed={4.2} x={0} scale={1.15} />
    </Billboard>
  );
}
