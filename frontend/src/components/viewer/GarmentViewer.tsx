"use client";

import type { ViewerConfig } from "@/lib/viewer";
import { unsupportedNote } from "@/lib/viewer";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const ViewerCanvas = dynamic(() => import("./ViewerCanvas").then((mod) => mod.ViewerCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">Loading 3D preview…</div>
  ),
});

export function GarmentViewer({ config, notes }: { config: ViewerConfig; notes?: string[] }) {
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const fallbacks = useMemo(() => {
    return ["collar", "cuff", "lapel", "fit"]
      .map((group) => unsupportedNote(group, config.supported))
      .filter(Boolean) as string[];
  }, [config.supported]);

  return (
    <div className="flex h-full min-h-[420px] flex-col border border-charcoal/10 bg-[#f3eee4]">
      <div className="relative flex-1" onPointerDown={() => setAutoRotate(false)}>
        {error ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
            The 3D model could not be loaded. {error}
          </div>
        ) : (
          <div className="h-[460px] w-full">
            <ViewerErrorBoundary onError={setError}>
              <ViewerCanvas config={config} autoRotate={autoRotate} />
            </ViewerErrorBoundary>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-charcoal/10 px-3 py-2 text-xs">
        <div className="flex gap-2">
          <button type="button" className="rounded-sm border border-charcoal/15 px-3 py-1" onClick={() => setAutoRotate(true)}>
            360°
          </button>
          <span className="inline-flex items-center gap-1 text-muted">
            <ZoomIn className="h-3 w-3" />
            <ZoomOut className="h-3 w-3" /> Drag to rotate · pinch/scroll to zoom
          </span>
        </div>
        <button type="button" className="inline-flex items-center gap-1" onClick={() => setAutoRotate(false)}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset spin
        </button>
      </div>
      {(notes || fallbacks).length > 0 && (
        <ul className="space-y-1 border-t border-charcoal/10 px-3 py-2 text-[11px] text-muted">
          {(notes || []).concat(fallbacks).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ViewerErrorBoundary({
  children,
  onError,
}: {
  children: React.ReactNode;
  onError: (message: string) => void;
}) {
  return <>{children}</>;
}
