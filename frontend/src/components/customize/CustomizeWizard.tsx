"use client";

import { api } from "@/lib/api";
import type { Category, CustomizationOption, Product, SiteSettings } from "@/lib/types";
import { configForSelections } from "@/lib/viewer";
import { Button } from "@/components/ui/Button";
import { GarmentViewer } from "@/components/viewer/GarmentViewer";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Selection = {
  optionId?: number;
  slug?: string;
  name?: string;
  variant?: string;
  preference?: boolean;
  notes?: string;
};

const STEPS = [
  { id: "garment", label: "Garment" },
  { id: "measurements", label: "Measurements" },
  { id: "design", label: "Design & Style" },
  { id: "fabric", label: "Fabric & Color" },
  { id: "submit", label: "Preview & Submit" },
];

export function CustomizeWizard({
  categories,
  products,
  site,
  initialCategory,
  initialProduct,
  initialSuit,
}: {
  categories: Category[];
  products: Product[];
  site: SiteSettings | null;
  initialCategory?: string;
  initialProduct?: string;
  initialSuit?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categorySlug, setCategorySlug] = useState(initialCategory || "");
  const [suitSlug, setSuitSlug] = useState(initialSuit || "");
  const [productSlug, setProductSlug] = useState(initialProduct || "");
  const [method, setMethod] = useState<"provide_garment" | "consultant">("provide_garment");
  const [sizeMode, setSizeMode] = useState<"standard" | "custom">("standard");
  const [sizeCode, setSizeCode] = useState("M");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [dropoff, setDropoff] = useState("");
  const [consultation, setConsultation] = useState({
    full_name: "",
    phone: "",
    preferred_date: "",
    preferred_time_slot: "11:00–13:00",
    location: "",
    instructions: "",
  });
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [fabricSlug, setFabricSlug] = useState("");
  const [colorSlug, setColorSlug] = useState("");
  const [notice, setNotice] = useState("");
  const [contact, setContact] = useState({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    preferred_contact_method: "whatsapp",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const category = categories.find((item) => item.slug === categorySlug);
  const filteredProducts = products.filter((item) => {
    if (item.category !== categorySlug) return false;
    if (suitSlug && item.suit_type && item.suit_type !== suitSlug) return false;
    return true;
  });
  const product = filteredProducts.find((item) => item.slug === productSlug) || filteredProducts[0];
  const model = category?.models_3d?.[0];
  const colorHex = product?.colors.find((c) => c.slug === colorSlug)?.hex_value || product?.colors[0]?.hex_value;

  const viewer = useMemo(
    () =>
      configForSelections({
        preset: model?.procedural_preset,
        colorHex,
        src: model?.src,
        supported: model?.supported_options,
        selections,
      }),
    [model, colorHex, selections]
  );

  function chooseCategory(slug: string) {
    const next = categories.find((item) => item.slug === slug);
    const prevGroups = new Set(category?.customization_groups || []);
    const nextGroups = new Set(next?.customization_groups || []);
    const cleared = Object.entries(selections).filter(([group]) => nextGroups.has(group));
    const removed = [...prevGroups].filter((group) => !nextGroups.has(group));
    setCategorySlug(slug);
    setSuitSlug(next?.supports_suit_types ? suitSlug : "");
    if (!next?.supports_suit_types) setSuitSlug("");
    setProductSlug("");
    setSelections(Object.fromEntries(cleared));
    setNotice(
      removed.length
        ? `Switched garment. Cleared incompatible options: ${removed.join(", ")}.`
        : "Garment updated. Compatible selections were kept."
    );
  }

  function selectOption(option: CustomizationOption) {
    setSelections((current) => ({
      ...current,
      [option.group]: {
        optionId: option.id,
        slug: option.slug,
        name: option.name,
        variant: option.viewer_variant,
        preference: option.is_preference_prompt,
        notes: current[option.group]?.notes || "",
      },
    }));
  }

  async function submit() {
    setError("");
    if (!category) {
      setError("Choose a garment first.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...contact,
        category_slug: category.slug,
        product_slug: product?.slug || "",
        suit_type_slug: suitSlug,
        measurement_method: method,
        garment_dropoff_notes: dropoff,
        size_mode: sizeMode,
        size_code: sizeMode === "standard" ? sizeCode : "",
        unit,
        fabric_slug: fabricSlug,
        color_slug: colorSlug,
        notes: contact.notes,
        address: consultation.location,
        preferred_consultation_date: consultation.preferred_date || null,
        preferred_time_slot: consultation.preferred_time_slot,
        selections: Object.entries(selections).map(([group, value]) => ({
          group,
          option_id: value.optionId,
          value_text: value.notes || "",
        })),
        measurements:
          sizeMode === "custom"
            ? (category.measurement_fields || []).map((field) => ({
                field_key: field.key,
                label: field.label,
                value: Number(measurements[field.key]),
              }))
            : [],
        consultation: method === "consultant" ? consultation : undefined,
      };
      const result = await api.submitRequest(payload);
      router.push(`/request/${result.data.reference}`);
    } catch (err) {
      const details = (err as { details?: { compatibility?: string[] } }).details;
      setError(
        details?.compatibility?.join(" ") || (err instanceof Error ? err.message : "The request was not saved.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  const groups = category?.customization_groups || [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <ol className="mb-10 flex flex-wrap gap-4 text-xs tracking-[0.16em] uppercase">
        {STEPS.map((item, index) => (
          <li key={item.id} className={index === step ? "text-gold" : "text-muted"}>
            <button type="button" onClick={() => setStep(index)}>
              {index + 1} {item.label}
            </button>
          </li>
        ))}
      </ol>
      {notice ? <p className="mb-6 border-l-2 border-gold bg-white px-4 py-3 text-sm">{notice}</p> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          {step === 0 && (
            <section>
              <h1 className="font-serif text-4xl">Choose Your Garment</h1>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {categories.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => chooseCategory(item.slug)}
                    className={`border bg-white p-3 text-left ${categorySlug === item.slug ? "border-gold" : "border-charcoal/10"}`}
                  >
                    {item.image ? <img src={item.image} alt="" className="mb-3 h-28 w-full object-cover" /> : null}
                    <p className="font-serif text-lg">{item.name}</p>
                  </button>
                ))}
              </div>
              {category?.supports_suit_types && (
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {category.suit_types.map((type) => (
                    <button
                      key={type.slug}
                      type="button"
                      onClick={() => setSuitSlug(type.slug)}
                      className={`border bg-white p-4 text-left ${suitSlug === type.slug ? "border-gold" : "border-charcoal/10"}`}
                    >
                      <p className="font-serif text-xl">{type.name}</p>
                      <p className="mt-2 text-sm text-muted">{type.description}</p>
                    </button>
                  ))}
                </div>
              )}
              {filteredProducts.length > 0 && (
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {filteredProducts.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => setProductSlug(item.slug)}
                      className={`border bg-white p-3 text-left ${product?.slug === item.slug ? "border-gold" : "border-charcoal/10"}`}
                    >
                      {item.image ? <img src={item.image} alt="" className="mb-3 h-36 w-full object-cover" /> : null}
                      <p>{item.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 1 && (
            <section className="space-y-6">
              <h1 className="font-serif text-4xl">Measurements</h1>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  className={`border p-6 text-left ${method === "provide_garment" ? "border-gold" : "border-charcoal/10"}`}
                  onClick={() => setMethod("provide_garment")}
                >
                  <h2 className="font-serif text-2xl">Provide Your Garment</h2>
                  <p className="mt-2 text-sm text-muted">
                    Bring or send a garment that already fits well. We will use it as a fitting reference.
                  </p>
                </button>
                <button
                  type="button"
                  className={`border p-6 text-left ${method === "consultant" ? "border-gold" : "border-charcoal/10"}`}
                  onClick={() => setMethod("consultant")}
                >
                  <h2 className="font-serif text-2xl">Consultant Takes Measurements</h2>
                  <p className="mt-2 text-sm text-muted">
                    Request an in-person consultation. Availability is confirmed before an appointment is accepted.
                  </p>
                </button>
              </div>
              {method === "provide_garment" && (
                <label className="block text-sm">
                  Delivery or drop-off notes
                  <textarea className="mt-2 w-full border border-charcoal/15 bg-white p-3" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
                </label>
              )}
              {method === "consultant" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {(["full_name", "phone", "preferred_date", "preferred_time_slot", "location"] as const).map((field) => (
                    <label key={field} className="text-sm">
                      {field.replaceAll("_", " ")}
                      <input
                        className="mt-2 w-full border border-charcoal/15 bg-white p-3"
                        type={field === "preferred_date" ? "date" : "text"}
                        value={consultation[field]}
                        onChange={(e) => setConsultation({ ...consultation, [field]: e.target.value })}
                      />
                    </label>
                  ))}
                  <label className="text-sm md:col-span-2">
                    Additional instructions
                    <textarea
                      className="mt-2 w-full border border-charcoal/15 bg-white p-3"
                      value={consultation.instructions}
                      onChange={(e) => setConsultation({ ...consultation, instructions: e.target.value })}
                    />
                  </label>
                </div>
              )}
              <div className="flex gap-3">
                <Button type="button" variant={sizeMode === "standard" ? "navy" : "ghost"} onClick={() => setSizeMode("standard")}>
                  Standard size
                </Button>
                <Button type="button" variant={sizeMode === "custom" ? "navy" : "ghost"} onClick={() => setSizeMode("custom")}>
                  Custom measurements
                </Button>
                <select className="border border-charcoal/15 bg-white px-3" value={unit} onChange={(e) => setUnit(e.target.value as "cm" | "in")}>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
              {sizeMode === "standard" ? (
                <div className="flex flex-wrap gap-2">
                  {(category?.sizes || []).map((size) => (
                    <button
                      type="button"
                      key={size.code}
                      onClick={() => setSizeCode(size.code)}
                      className={`h-11 w-11 border ${sizeCode === size.code ? "border-gold bg-white" : "border-charcoal/15"}`}
                    >
                      {size.code}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted">
                    Height or a ready-to-wear size is not enough to draft a garment. Enter each measurement, or request a consultation.
                  </p>
                  {(category?.measurement_fields || []).map((field) => (
                    <label key={field.key} className="block text-sm">
                      {field.label} ({unit})
                      <input
                        className="mt-1 w-full border border-charcoal/15 bg-white p-3"
                        inputMode="decimal"
                        value={measurements[field.key] || ""}
                        onChange={(e) => setMeasurements({ ...measurements, [field.key]: e.target.value })}
                      />
                      <span className="mt-1 block text-xs text-muted">{field.instruction}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="space-y-10">
              <h1 className="font-serif text-4xl">Design & Style</h1>
              {!category && <p>Choose a garment first.</p>}
              {groups.map((group) => (
                <OptionGroup
                  key={group}
                  title={groupLabel(group, categorySlug)}
                  options={(category?.options || []).filter((option) => option.group === group)}
                  selected={selections[group]}
                  onSelect={selectOption}
                  onNotes={(notes) =>
                    setSelections((current) => ({
                      ...current,
                      [group]: { ...current[group], notes },
                    }))
                  }
                />
              ))}
            </section>
          )}

          {step === 3 && (
            <section>
              <h1 className="font-serif text-4xl">Fabric & Color</h1>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {(product?.fabrics || []).map((fabric) => (
                  <button
                    key={fabric.slug}
                    type="button"
                    onClick={() => setFabricSlug(fabric.slug)}
                    className={`border p-3 text-left ${fabricSlug === fabric.slug ? "border-gold" : "border-charcoal/10"}`}
                  >
                    {fabric.image ? <img src={fabric.image} alt="" className="mb-2 h-20 w-full object-cover" /> : null}
                    <p>{fabric.name}</p>
                    <p className="text-xs text-muted">{fabric.texture_note}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {(product?.colors || []).map((color) => (
                  <button
                    key={color.slug}
                    type="button"
                    aria-label={color.name}
                    onClick={() => setColorSlug(color.slug)}
                    className={`h-9 w-9 rounded-full border ${colorSlug === color.slug ? "border-gold" : "border-charcoal/20"}`}
                    style={{ background: color.hex_value }}
                  />
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <h1 className="font-serif text-4xl">Submit Tailoring Request</h1>
              <p className="text-sm text-muted">
                This is a tailoring inquiry. Pricing and production are confirmed after the atelier reviews your details.
              </p>
              {(["full_name", "phone", "email", "city"] as const).map((field) => (
                <label key={field} className="block text-sm">
                  {field.replaceAll("_", " ")}
                  <input
                    className="mt-1 w-full border border-charcoal/15 bg-white p-3"
                    value={contact[field]}
                    onChange={(e) => setContact({ ...contact, [field]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block text-sm">
                Preferred contact method
                <select
                  className="mt-1 w-full border border-charcoal/15 bg-white p-3"
                  value={contact.preferred_contact_method}
                  onChange={(e) => setContact({ ...contact, preferred_contact_method: e.target.value })}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <label className="block text-sm">
                Order notes
                <textarea
                  className="mt-1 w-full border border-charcoal/15 bg-white p-3"
                  value={contact.notes}
                  onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                />
              </label>
              {error ? <p className="text-sm text-red-800">{error}</p> : null}
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? "Saving…" : "Submit Tailoring Request"}
              </Button>
            </section>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
            {step < STEPS.length - 1 && (
              <Button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                Next Step
              </Button>
            )}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <GarmentViewer config={viewer} notes={model?.fallback_note ? [model.fallback_note] : []} />
          <div className="border border-charcoal/10 bg-white p-5">
            <h2 className="text-xs tracking-[0.2em] text-gold uppercase">Your Selection</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Garment" value={category?.name} />
              <Row label="Suit type" value={category?.suit_types.find((t) => t.slug === suitSlug)?.name} />
              <Row label="Product" value={product?.name} />
              {Object.entries(selections).map(([group, value]) => (
                <Row key={group} label={group} value={value.name} />
              ))}
              <Row label="Fabric" value={fabricSlug} />
              <Row label="Color" value={colorSlug} />
              <Row label="Method" value={method.replace("_", " ")} />
              <Row label="Size" value={sizeMode === "standard" ? sizeCode : `Custom (${unit})`} />
              <Row label="Estimate" value={product?.price_label || "Price on consultation"} />
            </dl>
            {site?.whatsapp ? (
              <a
                className="mt-4 inline-block text-sm text-navy underline"
                href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Continue on WhatsApp
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted capitalize">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function groupLabel(group: string, slug?: string) {
  if (group === "fit" && slug === "casual-pants") return "Pants fit";
  if (group === "fit" && slug === "casual-shirt") return "Shirt fit";
  if (group === "collar") return "Shirt collar";
  if (group === "cuff") return "Shirt cuffs";
  return group.replace("-", " ");
}

function OptionGroup({
  title,
  options,
  selected,
  onSelect,
  onNotes,
}: {
  title: string;
  options: CustomizationOption[];
  selected?: Selection;
  onSelect: (option: CustomizationOption) => void;
  onNotes: (notes: string) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => (
          <button
            key={option.slug}
            type="button"
            onClick={() => onSelect(option)}
            className={`border bg-white p-3 text-left ${selected?.slug === option.slug ? "border-gold" : "border-charcoal/10"}`}
          >
            {option.image ? <img src={option.image} alt="" className="mb-3 h-28 w-full object-cover" /> : null}
            <p className="font-medium">{option.name}</p>
            <p className="mt-1 text-xs text-muted">{option.description}</p>
          </button>
        ))}
      </div>
      {selected?.preference && (
        <label className="mt-4 block text-sm">
          Preference notes
          <textarea className="mt-2 w-full border border-charcoal/15 bg-white p-3" value={selected.notes || ""} onChange={(e) => onNotes(e.target.value)} />
        </label>
      )}
    </div>
  );
}
