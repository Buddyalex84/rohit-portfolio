import type { Category, Paginated, Product, SiteSettings } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || data.detail || "Request failed") as Error & {
      details?: unknown;
      status?: number;
    };
    error.details = data.details || data;
    error.status = response.status;
    throw error;
  }
  return data as T;
}

export const api = {
  site: () => request<{ ok: boolean; data: SiteSettings }>("/api/site/").then((r) => r.data),
  categories: () => request<Paginated<Category>>("/api/categories/").then((r) => r.results),
  category: (slug: string) => request<Category>(`/api/categories/${slug}/`),
  products: (query = "") => request<Paginated<Product>>(`/api/products/${query}`).then((r) => r.results),
  product: (slug: string) => request<Product>(`/api/products/${slug}/`),
  submitRequest: (payload: unknown) =>
    request<{ ok: boolean; message: string; data: { reference: string; email_sent: boolean } }>(
      "/api/tailoring-requests/",
      { method: "POST", body: JSON.stringify(payload) }
    ),
  contact: (payload: unknown) =>
    request<{ ok: boolean; message: string }>("/api/contact-inquiries/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  consultation: (payload: unknown) =>
    request<{ ok: boolean; message: string }>("/api/consultation-requests/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadReference: async (form: FormData) => {
    const response = await fetch(`${API_URL}/api/reference-images/`, { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }
    return data as { ok: boolean; data: { id: number; url: string; field_key: string } };
  },
};

export { API_URL };
