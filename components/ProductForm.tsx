"use client";

import { FormEvent, useState } from "react";

import {
  Check,
  ImagePlus,
  LoaderCircle,
  Save,
  UploadCloud,
  X,
} from "lucide-react";

import type { Product } from "@/types/product";

import { uploadProductImage } from "@/lib/products";

const empty = {
  title: "",
  description: "",
  category: "",
  price: "",
  discountPercentage: "",
  stock: "",
  brand: "",
  sku: "",
  tags: "",
  weight: "",
  width: "",
  height: "",
  depth: "",
  warrantyInformation: "",
  shippingInformation: "",
  availabilityStatus: "",
  returnPolicy: "",
  minimumOrderQuantity: "",
  thumbnail: "",
  images: "",
};

type FormState = typeof empty;

export default function ProductForm({
  initial,
  categories,
  onSubmit,
  busy,
  onCancel,
}: {
  initial?: Product;
  categories: any[];
  onSubmit: (data: Partial<Product>) => void | Promise<void>;
  busy: boolean;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          category: initial.category,
          price: String(initial.price),
          discountPercentage: String(initial.discountPercentage ?? 0),
          stock: String(initial.stock),
          brand: initial.brand || "",
          sku: initial.sku || "",
          tags: initial.tags?.join(", ") || "",
          weight: initial.weight !== undefined ? String(initial.weight) : "",
          width:
            initial.dimensions?.width !== undefined
              ? String(initial.dimensions.width)
              : "",
          height:
            initial.dimensions?.height !== undefined
              ? String(initial.dimensions.height)
              : "",
          depth:
            initial.dimensions?.depth !== undefined
              ? String(initial.dimensions.depth)
              : "",
          warrantyInformation: initial.warrantyInformation || "",
          shippingInformation: initial.shippingInformation || "",
          availabilityStatus: initial.availabilityStatus || "",
          returnPolicy: initial.returnPolicy || "",
          minimumOrderQuantity:
            initial.minimumOrderQuantity !== undefined
              ? String(initial.minimumOrderQuantity)
              : "",
          thumbnail: initial.thumbnail || initial.images?.[0] || "",
          images: initial.images?.join("\n") || initial.thumbnail || "",
        }
      : empty,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [uploading, setUploading] = useState(false);

  const [dragging, setDragging] = useState(false);

  const set = (key: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleFile = async (file?: File) => {
    if (!file) return;

    setErrors((current) => ({
      ...current,
      thumbnail: "",
    }));

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        thumbnail: "Please choose an image file.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        thumbnail: "Image must be 5MB or smaller.",
      }));
      return;
    }

    setUploading(true);

    try {
      const result = await uploadProductImage(file);

      set("thumbnail", result.url);

      const existingImages = form.images
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const nextImages = [
        result.url,
        ...existingImages.filter((image) => image !== result.url),
      ];

      set("images", nextImages.join("\n"));
    } catch (error: any) {
      setErrors((current) => ({
        ...current,
        thumbnail: error?.userMessage || "Image upload failed.",
      }));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (busy || uploading) return;

    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!form.category) {
      nextErrors.category = "Choose a category.";
    }

    if (!form.price || Number(form.price) < 0) {
      nextErrors.price = "Enter a valid price.";
    }

    if (
      !form.stock ||
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      nextErrors.stock = "Enter a valid whole stock count.";
    }

    if (!form.thumbnail) {
      nextErrors.thumbnail = "Upload a product image.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const images = form.images
      .split(/\r?\n|,/)
      .map((image) => image.trim())
      .filter(Boolean);

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      discountPercentage: form.discountPercentage
        ? Number(form.discountPercentage)
        : 0,
      stock: Number(form.stock),

      brand: form.brand.trim() || undefined,

      sku: form.sku.trim() || undefined,

      tags,

      weight: form.weight !== "" ? Number(form.weight) : undefined,

      dimensions:
        form.width !== "" || form.height !== "" || form.depth !== ""
          ? {
              width: form.width !== "" ? Number(form.width) : undefined,

              height: form.height !== "" ? Number(form.height) : undefined,

              depth: form.depth !== "" ? Number(form.depth) : undefined,
            }
          : undefined,

      warrantyInformation: form.warrantyInformation.trim(),

      shippingInformation: form.shippingInformation.trim(),

      availabilityStatus: form.availabilityStatus.trim(),

      returnPolicy: form.returnPolicy.trim(),

      minimumOrderQuantity:
        form.minimumOrderQuantity !== ""
          ? Number(form.minimumOrderQuantity)
          : undefined,

      thumbnail: form.thumbnail,

      images: images.length > 0 ? images : [form.thumbnail],
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* BASIC INFORMATION */}
      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-ink">
            Basic information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Core information used to identify the product.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-600">
              Product title
            </label>

            <input
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              className="input mt-2"
              placeholder="e.g. Studio headphones"
            />

            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              className="input mt-2 min-h-32 resize-none"
              placeholder="Describe the product..."
            />

            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-gray-600">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) => set("category", event.target.value)}
                className="input mt-2"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option
                    key={category.slug || category}
                    value={category.slug || category}
                  >
                    {category.name || category}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="mt-1 text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600">Brand</label>

              <input
                value={form.brand}
                onChange={(event) => set("brand", event.target.value)}
                className="input mt-2"
                placeholder="Brand name"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-gray-600">SKU</label>

              <input
                value={form.sku}
                onChange={(event) => set("sku", event.target.value)}
                className="input mt-2"
                placeholder="Product SKU"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600">Tags</label>

              <input
                value={form.tags}
                onChange={(event) => set("tags", event.target.value)}
                className="input mt-2"
                placeholder="beauty, mascara"
              />

              <p className="mt-1 text-[11px] text-gray-400">
                Separate tags with commas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & INVENTORY */}
      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-ink">
            Pricing & inventory
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage pricing, discount and stock.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Price ($)"
            value={form.price}
            type="number"
            onChange={(value) => set("price", value)}
            error={errors.price}
          />

          <Field
            label="Discount (%)"
            value={form.discountPercentage}
            type="number"
            onChange={(value) => set("discountPercentage", value)}
            error={errors.discountPercentage}
          />

          <Field
            label="Stock"
            value={form.stock}
            type="number"
            onChange={(value) => set("stock", value)}
            error={errors.stock}
          />

          <Field
            label="Minimum order quantity"
            value={form.minimumOrderQuantity}
            type="number"
            onChange={(value) => set("minimumOrderQuantity", value)}
            error={errors.minimumOrderQuantity}
          />
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-ink">
            Product specifications
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Physical product information.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Weight"
            value={form.weight}
            type="number"
            onChange={(value) => set("weight", value)}
            error={errors.weight}
          />

          <Field
            label="Width"
            value={form.width}
            type="number"
            onChange={(value) => set("width", value)}
            error={errors.width}
          />

          <Field
            label="Height"
            value={form.height}
            type="number"
            onChange={(value) => set("height", value)}
            error={errors.height}
          />

          <Field
            label="Depth"
            value={form.depth}
            type="number"
            onChange={(value) => set("depth", value)}
            error={errors.depth}
          />
        </div>
      </section>

      {/* SHIPPING & POLICIES */}
      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-ink">
            Shipping & policies
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Customer-facing product policies.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Availability status"
            value={form.availabilityStatus}
            onChange={(value) => set("availabilityStatus", value)}
          />

          <TextField
            label="Warranty information"
            value={form.warrantyInformation}
            onChange={(value) => set("warrantyInformation", value)}
          />

          <TextField
            label="Shipping information"
            value={form.shippingInformation}
            onChange={(value) => set("shippingInformation", value)}
          />

          <TextField
            label="Return policy"
            value={form.returnPolicy}
            onChange={(value) => set("returnPolicy", value)}
          />
        </div>
      </section>

      {/* IMAGES */}
      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-ink">
            Product images
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload a primary image or provide image URLs.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
          <div>
            <label
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);

                void handleFile(event.dataTransfer.files?.[0]);
              }}
              className={`group relative block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition ${
                dragging
                  ? "border-violet bg-violet/5"
                  : "border-gray-200 bg-white hover:border-violet/50"
              }`}
            >
              {form.thumbnail ? (
                <img
                  src={form.thumbnail}
                  alt="Product preview"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="grid aspect-video place-items-center px-5 text-center">
                  <div>
                    <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-cloud text-violet">
                      <UploadCloud size={19} />
                    </div>

                    <p className="mt-3 text-sm font-bold text-gray-600">
                      Drop an image here
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      JPG, PNG, WEBP · max 5MB
                    </p>
                  </div>
                </div>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />

              {uploading && (
                <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold shadow-lg">
                    <LoaderCircle
                      size={15}
                      className="animate-spin text-violet"
                    />
                    Uploading...
                  </div>
                </div>
              )}
            </label>

            {form.thumbnail && (
              <button
                type="button"
                onClick={() => set("thumbnail", "")}
                className="mt-2 text-xs font-semibold text-gray-400 hover:text-red-500"
              >
                Remove primary image
              </button>
            )}

            {errors.thumbnail && (
              <p className="mt-2 text-xs text-red-500">{errors.thumbnail}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">
              Image URLs
            </label>

            <textarea
              value={form.images}
              onChange={(event) => set("images", event.target.value)}
              className="input mt-2 min-h-40 resize-none"
              placeholder={
                "https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"
              }
            />

            <p className="mt-2 text-[11px] leading-4 text-gray-400">
              One URL per line. The first image is used as the primary image
              when available.
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            <X size={15} />
            Cancel
          </button>
        )}

        <button disabled={busy || uploading} className="btn-primary">
          <Save size={15} />

          {busy ? "Saving..." : initial ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  type = "text",
  onChange,
  error,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-600">{label}</label>

      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input mt-2"
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-600">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input mt-2"
      />
    </div>
  );
}
