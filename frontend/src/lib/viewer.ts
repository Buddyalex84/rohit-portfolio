export type ViewerConfig = {
  preset: string;
  color: string;
  fit: string;
  collar: string;
  cuff: string;
  lapel: string;
  src?: string;
  supported: Record<string, boolean>;
};

export function configForSelections(input: {
  preset?: string;
  colorHex?: string;
  selections: Record<string, { variant?: string }>;
  supported?: Record<string, boolean>;
  src?: string;
}): ViewerConfig {
  const supported = input.supported || {};
  return {
    preset: input.preset || "shirt",
    color: input.colorHex || "#8FB4D4",
    fit: supported.fit ? input.selections.fit?.variant || "regular" : "regular",
    collar: supported.collar ? input.selections.collar?.variant || "spread" : "spread",
    cuff: supported.cuff ? input.selections.cuff?.variant || "single" : "single",
    lapel: supported.lapel ? input.selections.lapel?.variant || "notch" : "notch",
    src: input.src,
    supported,
  };
}

export function unsupportedNote(group: string, supported: Record<string, boolean>) {
  if (supported[group]) return null;
  return `The 3D preview does not yet vary ${group}. Your selection is saved in the request.`;
}
