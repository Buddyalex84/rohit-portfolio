"use client";

import { useMemo } from "react";
import type { ViewerConfig } from "@/lib/viewer";

function fitScale(fit: string) {
  if (fit === "slim" || fit === "skinny") return 0.88;
  if (fit === "relaxed" || fit === "wide" || fit === "oversized") return 1.14;
  if (fit === "bootcut") return 1.05;
  return 1;
}

export function ProceduralGarment({ config }: { config: ViewerConfig }) {
  const color = config.color;
  const width = fitScale(config.fit);

  if (config.preset === "pants") {
    return <Pants color={color} width={width} bootcut={config.fit === "bootcut"} wide={config.fit === "wide"} />;
  }
  if (config.preset === "blazer" || config.preset === "waistcoat") {
    return <Jacket color={color} width={width} lapel={config.lapel} vest={config.preset === "waistcoat"} />;
  }
  if (config.preset === "sherwani" || config.preset === "pathani" || config.preset === "kurta") {
    return <LongGarment color={color} width={width} long={config.preset !== "kurta"} />;
  }
  return <Shirt color={color} width={width} collar={config.collar} cuff={config.cuff} />;
}

function Shirt({
  color,
  width,
  collar,
  cuff,
}: {
  color: string;
  width: number;
  collar: string;
  cuff: string;
}) {
  const cuffDepth = cuff === "french" ? 0.28 : 0.16;
  const collarGeom = useMemo(() => collar, [collar]);
  return (
    <group>
      <mesh position={[0, 0.15, 0]} scale={[width, 1, 1]}>
        <boxGeometry args={[1.15, 1.45, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[-0.85 * width, 0.05, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.38, 1.2, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[0.85 * width, 0.05, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.38, 1.2, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[-0.95 * width, -0.55, 0]}>
        <boxGeometry args={[0.32, cuffDepth, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0.95 * width, -0.55, 0]}>
        <boxGeometry args={[0.32, cuffDepth, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {collarGeom === "mandarin" ? (
        <mesh position={[0, 0.95, 0.02]}>
          <cylinderGeometry args={[0.28, 0.3, 0.16, 20]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ) : (
        <group position={[0, 0.92, 0.12]}>
          <mesh rotation={[0.4, collarGeom === "spread" ? 0.55 : collarGeom === "button-down" ? 0.2 : 0.35, 0]} position={[-0.16, 0, 0.02]}>
            <boxGeometry args={[0.28, 0.18, 0.04]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh rotation={[0.4, collarGeom === "spread" ? -0.55 : collarGeom === "button-down" ? -0.2 : -0.35, 0]} position={[0.16, 0, 0.02]}>
            <boxGeometry args={[0.28, 0.18, 0.04]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Pants({ color, width, bootcut, wide }: { color: string; width: number; bootcut: boolean; wide: boolean }) {
  const hem = wide ? 0.42 : bootcut ? 0.34 : 0.26;
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, 0.7, 0]} scale={[width, 1, 1]}>
        <boxGeometry args={[1.05, 0.45, 0.48]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-0.28, -0.15, 0]}>
        <boxGeometry args={[0.38 * width, 1.5, hem]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.28, -0.15, 0]}>
        <boxGeometry args={[0.38 * width, 1.5, hem]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Jacket({
  color,
  width,
  lapel,
  vest,
}: {
  color: string;
  width: number;
  lapel: string;
  vest: boolean;
}) {
  return (
    <group>
      <mesh position={[0, vest ? 0.05 : 0.1, 0]} scale={[width, vest ? 0.85 : 1, 1]}>
        <boxGeometry args={[1.28, vest ? 1.1 : 1.55, 0.48]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {!vest && (
        <>
          <mesh position={[-0.95 * width, 0.1, 0]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.42, 1.25, 0.36]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          <mesh position={[0.95 * width, 0.1, 0]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.42, 1.25, 0.36]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        </>
      )}
      <mesh
        position={[-0.18, 0.55, 0.26]}
        rotation={[0.1, lapel === "peak" ? 0.7 : lapel === "shawl" ? 0.15 : 0.4, 0]}
      >
        <boxGeometry args={[0.32, lapel === "shawl" ? 0.5 : 0.35, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.05} />
      </mesh>
      <mesh
        position={[0.18, 0.55, 0.26]}
        rotation={[0.1, lapel === "peak" ? -0.7 : lapel === "shawl" ? -0.15 : -0.4, 0]}
      >
        <boxGeometry args={[0.32, lapel === "shawl" ? 0.5 : 0.35, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.05} />
      </mesh>
    </group>
  );
}

function LongGarment({ color, width, long }: { color: string; width: number; long: boolean }) {
  return (
    <group>
      <mesh position={[0, long ? -0.15 : 0.05, 0]} scale={[width, 1, 1]}>
        <boxGeometry args={[1.2, long ? 2.1 : 1.6, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.85, 0.02]}>
        <cylinderGeometry args={[0.26, 0.28, 0.18, 18]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
