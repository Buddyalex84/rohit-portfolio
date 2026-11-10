"use client";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import type { ViewerConfig } from "@/lib/viewer";
import { ProceduralGarment } from "./ProceduralGarment";

function GltfModel({ src, color }: { src: string; color: string }) {
  const { scene } = useGLTF(src);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  cloned.traverse((child) => {
    const mesh = child as unknown as { isMesh?: boolean; material?: { color?: { set: (c: string) => void } } };
    if (mesh.isMesh && mesh.material?.color) {
      mesh.material.color.set(color);
    }
  });
  return <primitive object={cloned} />;
}

export function ViewerCanvas({
  config,
  autoRotate,
}: {
  config: ViewerConfig;
  autoRotate: boolean;
}) {
  return (
    <Canvas camera={{ position: [0, 0.4, 3.2], fov: 40 }} dpr={[1, 1.75]}>
      <color attach="background" args={["#f3eee4"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[2.4, 3, 2]} intensity={1.15} />
      <directionalLight position={[-2, 1, -1]} intensity={0.35} />
      <Suspense fallback={null}>
        {config.src ? <GltfModel src={config.src} color={config.color} /> : <ProceduralGarment config={config} />}
      </Suspense>
      <OrbitControls
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.4}
        minDistance={1.8}
        maxDistance={5}
        minPolarAngle={0.7}
        maxPolarAngle={1.7}
      />
    </Canvas>
  );
}
