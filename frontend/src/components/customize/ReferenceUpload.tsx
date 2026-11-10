"use client";

import { api } from "@/lib/api";
import { useState } from "react";

const FIELDS = [
  { key: "pants_fit", label: "Pants fit" },
  { key: "shirt_fit", label: "Shirt fit" },
  { key: "shirt_collar", label: "Shirt collar" },
  { key: "shirt_cuffs", label: "Shirt cuffs" },
  { key: "blazer_design", label: "Blazer design" },
  { key: "suit_design", label: "Suit design" },
  { key: "other", label: "Other preference" },
];

export function ReferenceUpload({ reference }: { reference: string }) {
  const [field, setField] = useState(FIELDS[0].key);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(false);

  function onFile(next: File | null) {
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : null);
  }

  async function upload() {
    if (!file) {
      setError("Choose a JPEG, PNG, or WebP image first.");
      return;
    }
    setProgress(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("reference", reference);
      form.append("field_key", field);
      form.append("notes", notes);
      form.append("image", file);
      await api.uploadReference(form);
      setMessage("Reference image saved with this request.");
      onFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(false);
    }
  }

  return (
    <div className="border border-charcoal/10 bg-white p-6">
      <h2 className="font-serif text-2xl">Upload reference images</h2>
      <p className="mt-2 text-sm text-muted">JPEG, PNG, or WebP. Associate each image with the detail you want reproduced.</p>
      <label className="mt-4 block text-sm">
        Detail
        <select className="mt-1 w-full border border-charcoal/15 p-2" value={field} onChange={(e) => setField(e.target.value)}>
          {FIELDS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-sm">
        Image
        <input
          className="mt-1 block w-full text-sm"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>
      {preview ? (
        <div className="mt-3">
          <img src={preview} alt="Reference preview" className="h-40 object-cover" />
          <button type="button" className="mt-2 text-sm underline" onClick={() => onFile(null)}>
            Remove
          </button>
        </div>
      ) : null}
      <label className="mt-4 block text-sm">
        Notes
        <textarea className="mt-1 w-full border border-charcoal/15 p-2" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error ? <p className="mt-3 text-sm text-red-800">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-navy">{message}</p> : null}
      <button
        type="button"
        onClick={upload}
        disabled={progress}
        className="mt-4 bg-navy px-5 py-2 text-sm tracking-[0.12em] text-ivory uppercase"
      >
        {progress ? "Uploading…" : "Upload"}
      </button>
    </div>
  );
}
