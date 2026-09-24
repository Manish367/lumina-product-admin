"use client";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProductForm from "@/components/ProductForm";
import { getCategories, createProduct } from "@/lib/products";
export default function NewProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl animate-enter">
        <div className="mb-7">
          <div className="eyebrow">Catalog / New</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Create a product
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Add a persistent catalog record with server-side validation and a
            Cloudinary-hosted product image.
          </p>
        </div>
        <div className="glass rounded-2xl p-5 sm:p-7">
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <ProductForm
            categories={categories}
            busy={busy}
            onCancel={() => router.back()}
            onSubmit={async (data) => {
              if (busy) return;
              setBusy(true);
              setError("");
              try {
                const p = await createProduct(data);
                router.replace(`/products/${p.id}`);
              } catch (e: any) {
                setError(e.userMessage || "Unable to create the product.");
              } finally {
                setBusy(false);
              }
            }}
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <CheckCircle2 size={14} className="text-aqua" />
          Writes are sent through the shared Axios client.
        </div>
      </div>
    </AppShell>
  );
}
