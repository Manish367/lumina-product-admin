"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from "lucide-react";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Image from "next/image";

import AppShell from "@/components/AppShell";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import {
  EmptyState,
  ErrorState,
} from "@/components/Status";
import { Spinner } from "@/components/Spinner";

import {
  getCategories,
  getProducts,
  deleteProduct,
} from "@/lib/products";

import type { Product } from "@/types/product";

function safeInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const n = Number(value);

  return Number.isInteger(n) &&
    n >= min &&
    n <= max
    ? n
    : fallback;
}

function ProductDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const page = safeInt(
    params.get("page"),
    1,
    1,
    9999,
  );

  const pageSize = [
    10,
    20,
    50,
  ].includes(
    Number(params.get("pageSize")),
  )
    ? Number(params.get("pageSize"))
    : 10;

  const category =
    params.get("category") || "";

  const sort =
    params.get("sort") || "";

  const order =
    params.get("order") === "desc"
      ? "desc"
      : "asc";

  const [search, setSearch] =
    useState(
      params.get("search") || "",
    );

  const [products, setProducts] =
    useState<Product[]>([]);

  const [total, setTotal] =
    useState(0);

  const [categories, setCategories] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [view, setView] =
    useState<"table" | "grid">(
      "table",
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Product | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [filterOpen, setFilterOpen] =
    useState(false);

  const requestId =
    useRef(0);

  const abortRef =
    useRef<AbortController | null>(
      null,
    );

  const updateParams =
    useCallback(
      (
        patch: Record<
          string,
          string | number | undefined
        >,
      ) => {
        const next =
          new URLSearchParams(
            params.toString(),
          );

        Object.entries(patch).forEach(
          ([key, value]) => {
            if (
              value === undefined ||
              value === ""
            ) {
              next.delete(key);
            } else {
              next.set(
                key,
                String(value),
              );
            }
          },
        );

        router.replace(
          `${pathname}?${next.toString()}`,
          {
            scroll: false,
          },
        );
      },
      [
        params,
        pathname,
        router,
      ],
    );

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current =
        params.get("search") || "";

      if (search !== current) {
        updateParams({
          search:
            search.trim() ||
            undefined,
          page: 1,
        });
      }
    }, 450);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    params,
    updateParams,
  ]);

  useEffect(() => {
    if (total > 0) {
      const maxPage = Math.max(
        1,
        Math.ceil(
          total / pageSize,
        ),
      );

      if (page > maxPage) {
        updateParams({
          page: maxPage,
        });
      }
    }
  }, [
    total,
    pageSize,
    page,
    updateParams,
  ]);

  useEffect(() => {
    const controller =
      new AbortController();

    abortRef.current?.abort();

    abortRef.current =
      controller;

    const id =
      ++requestId.current;

    setLoading(true);
    setError("");

    getProducts(
      {
        limit: pageSize,
        skip:
          (page - 1) *
          pageSize,
        search:
          params.get("search") ||
          undefined,
        category,
        sortBy:
          sort || undefined,
        order,
      },
      controller.signal,
    )
      .then((data) => {
        if (
          id !== requestId.current
        ) {
          return;
        }

        setProducts(
          data.products,
        );

        setTotal(data.total);
      })
      .catch((err) => {
        if (
          err?.code ===
            "ERR_CANCELED" ||
          err?.name ===
            "CanceledError"
        ) {
          return;
        }

        if (
          id ===
          requestId.current
        ) {
          setError(
            err?.userMessage ||
              "Unable to load products.",
          );
        }
      })
      .finally(() => {
        if (
          id ===
          requestId.current
        ) {
          setLoading(false);
        }
      });

    return () =>
      controller.abort();
  }, [
    page,
    pageSize,
    category,
    sort,
    order,
    params,
  ]);

  const shownLabel =
    useMemo(
      () =>
        params.get("search")
          ? `Search results for “${params.get(
              "search",
            )}”`
          : category
            ? `Filtered by ${category}`
            : "All products",
      [params, category],
    );

  const remove =
    async () => {
      if (
        !deleteTarget ||
        deleting
      ) {
        return;
      }

      setDeleting(true);

      try {
        await deleteProduct(
          deleteTarget.id,
        );

        setProducts(
          (current) =>
            current.filter(
              (product) =>
                product.id !==
                deleteTarget.id,
            ),
        );

        setTotal((current) =>
          Math.max(
            0,
            current - 1,
          ),
        );

        setDeleteTarget(null);
      } catch (err) {
        setError(
          (err as any)
            ?.userMessage ||
            "Delete failed.",
        );
      } finally {
        setDeleting(false);
      }
    };

  return (
    <AppShell>
      <div className="animate-enter">
        <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="eyebrow">
              Catalog /{" "}
              {category ||
                "Overview"}
            </div>

            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Product library
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Search, filter and
              shape your catalog
              without losing
              context.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs text-gray-400 sm:flex">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-gray-100">
                <Search size={12} />
              </span>

              DummyJSON + MongoDB
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-3 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-3.5 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                className="input pl-10 pr-10"
                placeholder="Search products…"
              />

              <span className="absolute right-3 top-3 rounded-md bg-gray-100 px-1.5 py-1 text-[9px] font-bold text-gray-400">
                ⌘ K
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFilterOpen(
                    !filterOpen,
                  )
                }
                className={`btn-secondary flex-1 xl:flex-none ${
                  filterOpen
                    ? "border-violet text-violet"
                    : ""
                }`}
              >
                <SlidersHorizontal
                  size={15}
                />
                Filters
              </button>

              <div className="hidden rounded-xl border border-line bg-white p-1 sm:flex">
                <button
                  type="button"
                  onClick={() =>
                    setView("table")
                  }
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    view === "table"
                      ? "bg-ink text-white"
                      : "text-gray-400"
                  }`}
                >
                  <List size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setView("grid")
                  }
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    view === "grid"
                      ? "bg-ink text-white"
                      : "text-gray-400"
                  }`}
                >
                  <Grid2X2
                    size={16}
                  />
                </button>
              </div>
            </div>
          </div>

          {filterOpen && (
            <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-semibold text-gray-500">
                Category

                <select
                  value={category}
                  onChange={(event) =>
                    updateParams({
                      category:
                        event.target
                          .value ||
                        undefined,
                      page: 1,
                    })
                  }
                  className="input mt-1.5 py-2.5"
                >
                  <option value="">
                    All categories
                  </option>

                  {categories.map(
                    (categoryItem) => (
                      <option
                        key={
                          categoryItem
                        }
                        value={
                          categoryItem
                        }
                      >
                        {
                          categoryItem
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="text-xs font-semibold text-gray-500">
                Sort by

                <select
                  value={sort}
                  onChange={(event) =>
                    updateParams({
                      sort:
                        event.target
                          .value ||
                        undefined,
                      page: 1,
                    })
                  }
                  className="input mt-1.5 py-2.5"
                >
                  <option value="">
                    Relevance
                  </option>

                  <option value="price">
                    Price
                  </option>

                  <option value="rating">
                    Rating
                  </option>

                  <option value="title">
                    Title
                  </option>
                </select>
              </label>

              <label className="text-xs font-semibold text-gray-500">
                Direction

                <select
                  value={order}
                  onChange={(event) =>
                    updateParams({
                      order:
                        event.target
                          .value,
                      page: 1,
                    })
                  }
                  className="input mt-1.5 py-2.5"
                >
                  <option value="asc">
                    Ascending
                  </option>

                  <option value="desc">
                    Descending
                  </option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="mb-4 mt-7 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">
              {shownLabel}
            </div>

            <div className="mt-1 text-xs text-gray-400">
              {total} result
              {total === 1
                ? ""
                : "s"}{" "}
              · page {page}
            </div>
          </div>

          {(params.get("search") ||
            category ||
            sort) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                router.replace(
                  "/products",
                );
              }}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-ink"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass rounded-2xl">
            <Spinner label="Loading catalog…" />
          </div>
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() =>
              updateParams({})
            }
          />
        ) : products.length ===
          0 ? (
          <EmptyState
            text={
              params.get("search")
                ? "Try a broader search or clear your filters."
                : "There are no products matching the current view."
            }
          />
        ) : view ===
          "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={
                    setDeleteTarget
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line text-left text-[10px] font-bold uppercase tracking-[.16em] text-gray-400">
                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-4 py-4">
                      Category
                    </th>

                    <th className="px-4 py-4">
                      Price
                    </th>

                    <th className="px-4 py-4">
                      Rating
                    </th>

                    <th className="px-4 py-4">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => (
                      <tr
                        key={
                          product.id
                        }
                        className="group border-b border-line/70 transition hover:bg-cloud/70"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/products/${product.id}`}
                            className="flex min-w-[260px] items-center gap-3"
                          >
                            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-cloud">
                              <Image
                                src={
                                  product.thumbnail ||
                                  product
                                    .images?.[0] ||
                                  "/placeholder.png"
                                }
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>

                            <div>
                              <div className="font-display text-sm font-bold group-hover:text-violet">
                                {
                                  product.title
                                }
                              </div>

                              <div className="mt-0.5 text-[11px] text-gray-400">
                                SKU{" "}
                                {product.sku ||
                                  `PM-${String(
                                    product.id,
                                  ).padStart(
                                    4,
                                    "0",
                                  )}`}
                              </div>
                            </div>
                          </Link>
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold capitalize text-gray-500">
                          {
                            product.category
                          }
                        </td>

                        <td className="px-4 py-4 font-display text-sm font-bold">
                          $
                          {product.price.toFixed(
                            2,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                            <Star
                              size={12}
                              className="fill-current"
                            />

                            {product.rating.toFixed(
                              1,
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-bold ${
                              product.stock <
                              10
                                ? "text-red-500"
                                : "text-gray-600"
                            }`}
                          >
                            {
                              product.stock
                            }{" "}
                            units
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {product.canDelete ? (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  product,
                                )
                              }
                              className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                              aria-label={`Delete ${product.title}`}
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              View only
                            </span>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 md:hidden">
              {products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={
                      setDeleteTarget
                    }
                  />
                ),
              )}
            </div>

            <div className="p-4">
              <Pagination
                page={page}
                total={total}
                pageSize={pageSize}
                onPage={(nextPage) =>
                  updateParams({
                    page: nextPage,
                  })
                }
                onPageSize={(size) =>
                  updateParams({
                    pageSize: size,
                    page: 1,
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Delete modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-5 backdrop-blur-sm">
            <div className="w-full max-w-sm animate-enter rounded-2xl bg-white p-6 shadow-2xl">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-500">
                <Trash2 size={19} />
              </div>

              <h3 className="mt-5 font-display text-xl font-bold">
                Delete product?
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                You’re removing{" "}
                <span className="font-semibold text-ink">
                  {
                    deleteTarget.title
                  }
                </span>{" "}
                from this workspace.

                {deleteTarget.source ===
                "local"
                  ? " This removes the shared product for everyone."
                  : " This hides the DummyJSON product only from your catalog."}
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(
                      null,
                    )
                  }
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={remove}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting
                    ? "Deleting…"
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// export default ProductDashboard;
function ProductsPageFallback() {
  return (
    <AppShell>
      <div className="glass rounded-2xl">
        <Spinner label="Loading catalog…" />
      </div>
    </AppShell>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductDashboard />
    </Suspense>
  );
}