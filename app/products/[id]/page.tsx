"use client";

import {
  ArrowLeft,
  Edit3,
  MessageSquare,
  RefreshCw,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import ProductForm from "@/components/ProductForm";
import { Spinner } from "@/components/Spinner";

import {
  getCategories,
  getProduct,
  getProductReviews,
  updateProduct,
} from "@/lib/products";

import {
  createProductReview,
  updateProductReview,
  deleteProductReview,
} from "@/lib/products";

import type { Product, Review } from "@/types/product";
function calculateRating(reviews: Review[]) {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0,
  );

  return Number((total / reviews.length).toFixed(2));
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [product, setProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<any[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);

  // const [baseRating, setBaseRating] = useState(0);

  const [loading, setLoading] = useState(true);

  const [notFound, setNotFound] = useState(false);

  const [error, setError] = useState("");

  const [retrying, setRetrying] = useState(false);

  const [retryKey, setRetryKey] = useState(0);

  const [editingProduct, setEditingProduct] = useState(false);

  const [savingProduct, setSavingProduct] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const [editingRating, setEditingRating] = useState(5);

  const [editingComment, setEditingComment] = useState("");

  const [savingReview, setSavingReview] = useState(false);

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProductPage() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        /*
         * Product is the primary request.
         *
         * We handle its 404 separately so that a
         * genuine missing product does not show
         * a generic server error.
         */
        const productData = await getProduct(id);

        if (cancelled) return;

        //setProduct(productData);
        setProduct(productData);

        // setBaseRating(Number(productData.rating ?? 0));

        const firstImage =
          productData.thumbnail || productData.images?.[0] || "";

        setSelectedImage(firstImage);

        /*
         * Categories and reviews are secondary.
         *
         * If one of them fails, the product page
         * itself can still be displayed.
         */
        try {
          const categoryData = await getCategories();

          if (!cancelled) {
            setCategories(categoryData);
          }
        } catch {
          if (!cancelled) {
            setCategories([]);
          }
        }

        try {
          const reviewData = await getProductReviews(id);

          if (!cancelled) {
            setReviews(reviewData);
          }
        } catch {
          if (!cancelled) {
            setReviews([]);
          }
        }
      } catch (err: any) {
        if (cancelled) return;

        const status = err?.response?.status;

        if (status === 404) {
          setProduct(null);
          setNotFound(true);
          setError("");
        } else {
          setProduct(null);
          setNotFound(false);

          setError(
            err?.userMessage || "We couldn't load this product right now.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRetrying(false);
        }
      }
    }

    void loadProductPage();

    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  const retry = () => {
    setRetrying(true);
    setRetryKey((current) => current + 1);
  };

  const handleProductUpdate = async (data: Partial<Product>) => {
    if (!product || savingProduct) {
      return;
    }

    setSavingProduct(true);
    setError("");

    try {
      const updated = await updateProduct(product.id, data);

      setProduct(updated);

      setSelectedImage(updated.thumbnail || updated.images?.[0] || "");

      setEditingProduct(false);
    } catch (err: any) {
      setError(err?.userMessage || "Unable to update the product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const submitReview = async () => {
    if (!product || !comment.trim() || submittingReview) {
      return;
    }

    setSubmittingReview(true);
    setError("");

    try {
      const created = await createProductReview(product.id, {
        rating,
        comment: comment.trim(),
      });

      setReviews((current) => {
        const updatedReviews = [...current, created];

        setProduct((currentProduct) =>
          currentProduct
            ? {
                ...currentProduct,
                rating: calculateRating(updatedReviews),
              }
            : currentProduct,
        );

        return updatedReviews;
      });

      setComment("");
      setRating(5);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 409) {
        setError(
          "You have already reviewed this product. You can edit your existing review below.",
        );
      } else if (status === 400) {
        setError(
          err?.response?.data?.error ||
            "Please check your review and try again.",
        );
      } else {
        setError("Unable to submit your review right now. Please try again.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const startReviewEdit = (review: Review) => {
    setEditingReviewId(review.id);

    setEditingRating(review.rating);

    setEditingComment(review.comment);
  };

  const cancelReviewEdit = () => {
    setEditingReviewId(null);
    setEditingRating(5);
    setEditingComment("");
  };

  const saveReviewEdit = async () => {
    if (
      !product ||
      !editingReviewId ||
      !editingComment.trim() ||
      savingReview
    ) {
      return;
    }

    setSavingReview(true);
    setError("");

    try {
      const updated = await updateProductReview(product.id, editingReviewId, {
        rating: editingRating,
        comment: editingComment.trim(),
      });

      setReviews((current) => {
        const updatedReviews = current.map((review) =>
          review.id === editingReviewId ? updated : review,
        );

        setProduct((currentProduct) =>
          currentProduct
            ? {
                ...currentProduct,
                rating: calculateRating(updatedReviews),
              }
            : currentProduct,
        );

        return updatedReviews;
      });

      cancelReviewEdit();
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        setError("You can only edit your own review.");
      } else if (status === 404) {
        setError(
          "This review could not be found. Please refresh the page and try again.",
        );
      } else if (status === 400) {
        setError(
          err?.response?.data?.error ||
            "Please check your review and try again.",
        );
      } else {
        setError("Unable to update your review right now. Please try again.");
      }
    } finally {
      setSavingReview(false);
    }
  };

  const removeReview = async (reviewId: string) => {
    if (!product || deletingReviewId) {
      return;
    }

    setDeletingReviewId(reviewId);
    setError("");

    try {
      await deleteProductReview(product.id, reviewId);

      setReviews((current) => {
        const updatedReviews = current.filter(
          (review) => review.id !== reviewId,
        );

        setProduct((currentProduct) =>
          currentProduct
            ? {
                ...currentProduct,
                rating: calculateRating(updatedReviews),
              }
            : currentProduct,
        );

        return updatedReviews;
      });

      if (editingReviewId === reviewId) {
        cancelReviewEdit();
      }
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        setError("You can only delete your own review.");
      } else if (status === 404) {
        setError(
          "This review could not be found. Please refresh the page and try again.",
        );
      } else {
        setError("Unable to delete your review right now. Please try again.");
      }
    } finally {
      setDeletingReviewId(null);
    }
  };

  /*
   * LOADING STATE
   */
  if (loading) {
    return (
      <AppShell>
        <div className="animate-enter">
          <div className="mb-6 h-4 w-32 animate-pulse rounded bg-gray-200" />

          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            <div className="aspect-square animate-pulse rounded-2xl bg-white" />

            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-20 w-full animate-pulse rounded bg-gray-200" />

              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 animate-pulse rounded-2xl bg-white" />
                <div className="h-24 animate-pulse rounded-2xl bg-white" />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-white p-6">
            <Spinner label="Loading product..." />
          </div>
        </div>
      </AppShell>
    );
  }

  /*
   * REAL 404
   */
  if (notFound) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-line bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gray-100 text-gray-500">
              <span className="text-xl font-bold">404</span>
            </div>

            <h1 className="mt-6 font-display text-2xl font-bold text-ink">
              Product not found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              We couldn't find this product. It may have been removed, deleted
              for your account, or the product ID may be invalid.
            </p>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <ArrowLeft size={15} />
              Back to products
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  /*
   * REAL SERVER / NETWORK ERROR
   */
  if (error && !product) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-red-500 shadow-sm">
              !
            </div>

            <h1 className="mt-6 font-display text-2xl font-bold text-red-700">
              Couldn't load this product
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-600">
              Something went wrong while loading the product. Please try again.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                disabled={retrying}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={retrying ? "animate-spin" : ""}
                />

                {retrying ? "Retrying..." : "Retry"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/products")}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return null;
  }

  const productImages = Array.from(
    new Set([product.thumbnail, ...(product.images || [])].filter(Boolean)),
  );

  return (
    <AppShell>
      <div className="animate-enter">
        {/* BACK */}
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-ink"
        >
          <ArrowLeft size={15} />
          Back to products
        </Link>

        {!editingProduct ? (
          <>
            {/* PRODUCT HERO */}
            <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
              {/* IMAGE GALLERY */}
              <div>
                <div className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="relative aspect-square bg-cloud">
                    <Image
                      src={
                        selectedImage ||
                        product.thumbnail ||
                        product.images?.[0] ||
                        "/placeholder.png"
                      }
                      alt={product.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 420px"
                    />
                  </div>
                </div>

                {productImages.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {productImages.slice(0, 5).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white ${
                          selectedImage === image ? "border-ink" : "border-line"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MAIN INFORMATION */}
              <div className="min-w-0">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="eyebrow">{product.category}</div>

                    <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                      {product.title}
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-500">
                      {product.description}
                    </p>
                  </div>

                  {product.canEdit && (
                    <button
                      type="button"
                      onClick={() => setEditingProduct(true)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                    >
                      <Edit3 size={15} />
                      Edit product
                    </button>
                  )}
                </div>

                {/* PRICE / STOCK / RATING */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="Price"
                    value={`$${product.price.toFixed(2)}`}
                  />

                  <StatCard label="Stock" value={String(product.stock)} />

                  <StatCard
                    label="Rating"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <Star
                          size={15}
                          className="fill-current text-amber-400"
                        />

                        {product.rating.toFixed(2)}
                      </span>
                    }
                  />
                </div>

                {/* QUICK TAGS */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-cloud px-3 py-1.5 text-xs font-semibold text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FULL PRODUCT INFORMATION */}
            <section className="mt-8 rounded-2xl border border-line bg-white p-6">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-ink">
                  Product information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Complete information available for this product.
                </p>
              </div>

              <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                <InfoRow label="Brand" value={product.brand || "—"} />

                <InfoRow label="SKU" value={product.sku || "—"} />

                <InfoRow
                  label="Discount"
                  value={`${product.discountPercentage.toFixed(2)}%`}
                />

                <InfoRow
                  label="Availability"
                  value={product.availabilityStatus || "—"}
                />

                <InfoRow
                  label="Weight"
                  value={
                    product.weight !== undefined ? `${product.weight}` : "—"
                  }
                />

                <InfoRow
                  label="Minimum order"
                  value={
                    product.minimumOrderQuantity !== undefined
                      ? String(product.minimumOrderQuantity)
                      : "—"
                  }
                />

                <InfoRow
                  label="Dimensions"
                  value={
                    product.dimensions
                      ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth}`
                      : "—"
                  }
                />

                <InfoRow
                  label="Source"
                  value={product.source === "local" ? "Lumina" : "DummyJSON"}
                />

                <InfoRow
                  label="Warranty"
                  value={product.warrantyInformation || "—"}
                />

                <InfoRow
                  label="Shipping"
                  value={product.shippingInformation || "—"}
                />

                <InfoRow
                  label="Return policy"
                  value={product.returnPolicy || "—"}
                />

                <InfoRow label="Product ID" value={String(product.id)} />
              </div>
            </section>

            {/* META */}
            {product.meta && (
              <section className="mt-6 rounded-2xl border border-line bg-white p-6">
                <div className="mb-5">
                  <h2 className="font-display text-xl font-bold text-ink">
                    Product metadata
                  </h2>
                </div>

                <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                  <InfoRow
                    label="Barcode"
                    value={product.meta.barcode || "—"}
                  />

                  <InfoRow
                    label="Created"
                    value={
                      product.meta.createdAt
                        ? formatDateTime(product.meta.createdAt)
                        : "—"
                    }
                  />

                  <InfoRow
                    label="Last updated"
                    value={
                      product.meta.updatedAt
                        ? formatDateTime(product.meta.updatedAt)
                        : "—"
                    }
                  />

                  <InfoRow
                    label="QR code"
                    value={
                      product.meta.qrCode ? (
                        <a
                          href={product.meta.qrCode}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet hover:underline"
                        >
                          View QR
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
              </section>
            )}
          </>
        ) : (
          /* EDIT MODE */
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="eyebrow">Product / Edit</div>

                <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                  Edit product
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Update the editable product information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingProduct(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-cloud hover:text-ink"
              >
                <X size={15} />
                Cancel
              </button>
            </div>

            <ProductForm
              initial={product}
              categories={categories}
              onSubmit={handleProductUpdate}
              busy={savingProduct}
              onCancel={() => setEditingProduct(false)}
            />
          </div>
        )}

        {/* GENERAL ERROR */}
        {error && product && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* REVIEWS */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Reviews
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Original product reviews and user reviews are shown together.
              </p>
            </div>

            <div className="text-sm font-medium text-gray-400">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>

          {/* WRITE REVIEW */}
          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center gap-2">
              <MessageSquare size={17} className="text-violet" />

              <h3 className="font-display text-lg font-bold text-ink">
                Write a review
              </h3>
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold text-gray-500">Rating</div>

              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`Rate ${value} out of 5`}
                    className="rounded-md p-0.5 transition hover:scale-105"
                  >
                    <Star
                      size={22}
                      className={
                        value <= rating
                          ? "fill-current text-amber-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-gray-500">
                Your review
              </label>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={4}
                className="input mt-2 min-h-28 resize-none"
                placeholder="Share your experience with this product..."
              />

              <div className="mt-1 text-right text-[11px] text-gray-400">
                {comment.length}/2000
              </div>
            </div>

            <button
              type="button"
              onClick={submitReview}
              disabled={submittingReview || !comment.trim()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageSquare size={15} />

              {submittingReview ? "Submitting..." : "Submit review"}
            </button>
          </div>

          {/* REVIEW LIST */}
          <div className="mt-5 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center">
                <div className="font-display text-lg font-bold text-ink">
                  No reviews yet
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Be the first person to review this product.
                </p>
              </div>
            ) : (
              reviews.map((review) => {
                const isEditing = editingReviewId === review.id;

                return (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-line bg-white p-6"
                  >
                    {!isEditing ? (
                      <>
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="font-display text-sm font-bold text-ink">
                              {review.reviewerName}
                            </div>

                            <div className="mt-1 text-xs text-gray-400">
                              {formatReviewDate(review.date)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                size={15}
                                className={
                                  value <= review.rating
                                    ? "fill-current text-amber-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-gray-600">
                          {review.comment}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                            {review.source === "dummyjson"
                              ? "Original product review"
                              : "User review"}
                          </span>

                          {review.canEdit && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startReviewEdit(review)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-cloud hover:text-ink"
                              >
                                <Edit3 size={13} />
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={deletingReviewId === review.id}
                                onClick={() => removeReview(review.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 size={13} />

                                {deletingReviewId === review.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-base font-bold text-ink">
                            Edit your review
                          </h3>

                          <button
                            type="button"
                            onClick={cancelReviewEdit}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-cloud hover:text-ink"
                            aria-label="Cancel review editing"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="mt-5">
                          <div className="text-xs font-semibold text-gray-500">
                            Rating
                          </div>

                          <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setEditingRating(value)}
                                className="rounded-md p-0.5"
                              >
                                <Star
                                  size={20}
                                  className={
                                    value <= editingRating
                                      ? "fill-current text-amber-400"
                                      : "text-gray-300"
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          value={editingComment}
                          onChange={(event) =>
                            setEditingComment(event.target.value)
                          }
                          maxLength={2000}
                          rows={4}
                          className="input mt-4 min-h-28 resize-none"
                        />

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={cancelReviewEdit}
                            className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-cloud"
                          >
                            <X size={15} />
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={savingReview || !editingComment.trim()}
                            onClick={saveReviewEdit}
                            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                          >
                            <Save size={15} />

                            {savingReview ? "Saving..." : "Save review"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </div>

      <div className="mt-2 font-display text-2xl font-bold text-ink">
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line/70 pb-4">
      <span className="text-sm font-medium text-gray-500">{label}</span>

      <span className="max-w-[65%] text-right text-sm font-semibold text-ink">
        {value}
      </span>
    </div>
  );
}

function formatReviewDate(date: string) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
