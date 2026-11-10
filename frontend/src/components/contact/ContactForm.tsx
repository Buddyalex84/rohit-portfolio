"use client";

import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/Button";

const schema = z.object({
  full_name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(8, "Please enter a mobile number"),
  email: z.string().email().optional().or(z.literal("")),
  subject: z.string().min(3, "Please add a subject"),
  message: z.string().min(12, "Please include a short message"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setStatus(null);
    try {
      const result = await api.contact(values);
      setStatus(result.message);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The inquiry could not be saved.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border border-charcoal/10 bg-white p-8">
      <Field label="Full name" error={form.formState.errors.full_name?.message}>
        <input className="field" {...form.register("full_name")} />
      </Field>
      <Field label="Mobile number" error={form.formState.errors.phone?.message}>
        <input className="field" {...form.register("phone")} />
      </Field>
      <Field label="Email address" error={form.formState.errors.email?.message}>
        <input className="field" type="email" {...form.register("email")} />
      </Field>
      <Field label="Subject" error={form.formState.errors.subject?.message}>
        <input className="field" {...form.register("subject")} />
      </Field>
      <Field label="Message" error={form.formState.errors.message?.message}>
        <textarea className="field min-h-32" {...form.register("message")} />
      </Field>
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      {status ? <p className="text-sm text-navy">{status}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Submit Inquiry"}
      </Button>
      <style jsx global>{`
        .field {
          width: 100%;
          border: 1px solid rgba(28, 25, 23, 0.15);
          background: #f6f1e8;
          padding: 0.75rem 0.9rem;
          outline: none;
        }
        .field:focus {
          border-color: #b08d57;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block tracking-[0.12em] text-muted uppercase">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-red-800">{error}</span> : null}
    </label>
  );
}
