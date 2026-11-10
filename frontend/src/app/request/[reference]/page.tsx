import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";
import { ReferenceUpload } from "@/components/customize/ReferenceUpload";
import { notFound } from "next/navigation";

async function loadRequest(reference: string) {
  const response = await fetch(`${API_URL}/api/tailoring-requests/${reference}/`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load request");
  return response.json() as Promise<{ ok: boolean; data: { reference: string; status: string; email_sent: boolean } }>;
}

export default async function RequestPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const payload = await loadRequest(reference).catch(() => null);
  if (!payload?.ok) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-center">
      <p className="text-xs tracking-[0.28em] text-gold uppercase">Inquiry received</p>
      <h1 className="mt-3 font-serif text-5xl">Request {payload.data.reference}</h1>
      <p className="mt-6 text-muted">
        Your tailoring inquiry has been saved with status “{payload.data.status.replaceAll("_", " ")}”. This is not a
        production order until the atelier confirms measurements, cloth, and a quote.
      </p>
      {!payload.data.email_sent ? (
        <p className="mt-4 text-sm text-muted">Email notifications are not configured on this server.</p>
      ) : (
        <p className="mt-4 text-sm text-muted">The atelier has been notified by email.</p>
      )}
      <div className="mt-10 text-left">
        <ReferenceUpload reference={payload.data.reference} />
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <Button href="/customize" variant="ghost">
          Start another
        </Button>
        <Button href="/contact">Contact the atelier</Button>
      </div>
    </div>
  );
}
