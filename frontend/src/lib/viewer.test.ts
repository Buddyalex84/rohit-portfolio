import assert from "node:assert/strict";
import test from "node:test";
import { configForSelections, unsupportedNote } from "./viewer";

test("viewer only applies supported variants", () => {
  const config = configForSelections({
    preset: "blazer",
    colorHex: "#1B2A4A",
    supported: { color: true, lapel: true, collar: false },
    selections: {
      lapel: { variant: "peak" },
      collar: { variant: "mandarin" },
    },
  });
  assert.equal(config.lapel, "peak");
  assert.equal(config.collar, "spread");
  assert.equal(unsupportedNote("collar", config.supported)?.includes("collar"), true);
});
