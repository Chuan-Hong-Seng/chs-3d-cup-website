"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { CUP, CupModel } from "./cup-model";
import { Steam } from "./steam";

/*
 * Preset camera angles. The wrap texture is mapped so texture position u sits at
 * azimuth (u − 0.54) × 2π: product name u≈0.54 (front), season character u≈0.29,
 * ingredients label u≈0.925.
 */
export type CupView = "front" | "side" | "label" | "inside";
const VIEWS: Record<CupView, { theta: number; phi: number }> = {
  front: { theta: 0, phi: 1.38 },
  side: { theta: (0.29 - 0.54) * Math.PI * 2, phi: 1.38 },
  label: { theta: (0.925 - 0.54) * Math.PI * 2, phi: 1.38 },
  inside: { theta: 0, phi: 0.3 },
};

const scratch = new THREE.Spherical();

const FOV = 35;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

/*
 * The canvas fills the whole screen, so the cup can never be clipped by a box edge.
 * On desktop the cup is shifted to the right half; on mobile to the upper half.
 * Camera distance is picked so the cup fits, and zoom is limited around that.
 */
function Rig({ view, viewKey }: { view: CupView | null; viewKey: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const flying = useRef(false);
  const { width, height } = useThree((s) => s.size);
  const desktop = width >= 1024;
  const aspect = width / height;

  // Cup ~50% of screen height on desktop; ~55% of screen width on mobile.
  const fitHeight = CUP.height / (0.5 * 2 * TAN);
  const fitWidth = (CUP.topRadius * 2) / (0.55 * 2 * TAN * aspect);
  const distance = desktop ? fitHeight : Math.max(fitHeight * 0.85, fitWidth);

  useEffect(() => {
    if (desktop) camera.setViewOffset(width, height, -width * 0.2, 0, width, height);
    else camera.setViewOffset(width, height, 0, height * 0.13, width, height);
    camera.updateProjectionMatrix();
    camera.position.setLength(distance);
  }, [camera, width, height, desktop, distance]);

  // Start a camera flight whenever a view button is pressed (viewKey bumps on every press).
  useEffect(() => {
    if (view) flying.current = true;
  }, [view, viewKey]);

  // Any manual drag cancels the flight.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const stop = () => (flying.current = false);
    c.addEventListener("start", stop);
    return () => c.removeEventListener("start", stop);
  }, []);

  useFrame((_, delta) => {
    if (!flying.current || !view || !controls.current) return;
    const target = VIEWS[view];
    const current = scratch.setFromVector3(camera.position);
    const k = 1 - Math.exp(-delta * 4.5);
    // Shortest way round for the azimuth.
    let dTheta = target.theta - current.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    current.theta += dTheta * k;
    current.phi += (target.phi - current.phi) * k;
    current.radius += (distance - current.radius) * k;
    camera.position.setFromSpherical(current);
    controls.current.update();
    if (Math.abs(dTheta) < 0.002 && Math.abs(target.phi - current.phi) < 0.002) flying.current = false;
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      zoomSpeed={0.3}
      dampingFactor={0.06}
      autoRotate={!view}
      autoRotateSpeed={1}
      minDistance={distance * 0.7}
      maxDistance={distance * 1.4}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 1.8}
    />
  );
}

// Soft round shadow under the cup (the cup is round, so a static blob reads correctly).
function BlobShadow({ y }: { y: number }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.45, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh position-y={y} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[2.6, 2.6]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={0.6} />
    </mesh>
  );
}

// Cup leans gently toward the pointer.
function ParallaxTilt({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    const k = 1 - Math.exp(-delta * 4);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.1, k);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -pointer.x * 0.06, k);
  });
  return <group ref={group}>{children}</group>;
}

export function CupScene({
  index,
  accent,
  view,
  viewKey,
}: {
  index: number;
  accent: string;
  view: CupView | null;
  viewKey: number;
}) {
  const floor = -CUP.height / 2 - CUP.baseHeight;

  return (
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ position: [0, 1.1, 7], fov: FOV }}
      gl={{ antialias: true, alpha: true }}
    >
      <Rig view={view} viewKey={viewKey} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <directionalLight position={[-4, 2, 3]} intensity={0.5} />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 3]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer form="ring" intensity={0.8} position={[0, 2, -5]} scale={3} />
      </Environment>

      <Suspense fallback={null}>
        <ParallaxTilt>
          <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.25}>
            <CupModel index={index} />
            <Steam y={CUP.height / 2 + 1.05} />
          </Float>
        </ParallaxTilt>
      </Suspense>

      <Sparkles
        key={accent}
        count={40}
        scale={[4.5, 3.2, 3]}
        size={3.5}
        speed={0.35}
        opacity={0.8}
        color={accent}
      />

      <BlobShadow y={floor - 0.06} />
    </Canvas>
  );
}
