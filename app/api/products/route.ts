import { NextResponse } from "next/server";

import { dummyApi } from "@/lib/axios";
import { connectMongo } from "@/lib/mongodb";
import { ProductModel } from "@/lib/models/Product";
import { getSessionUser } from "@/lib/auth";
import { validateProduct } from "@/lib/validation";

function normalize(
  value: any,
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  },
) {
  return {
    id: Number(
      value.id ?? value.productId,
    ),

    title: value.title ?? "",
    description: value.description ?? "",
    category: value.category ?? "",

    price: Number(value.price ?? 0),
    discountPercentage: Number(
      value.discountPercentage ?? 0,
    ),
    rating: Number(value.rating ?? 0),
    stock: Number(value.stock ?? 0),

    tags: Array.isArray(value.tags)
      ? value.tags
      : [],

    brand: value.brand ?? "",
    sku: value.sku ?? "",

    weight:
      value.weight !== undefined
        ? Number(value.weight)
        : undefined,

    dimensions: value.dimensions,

    warrantyInformation:
      value.warrantyInformation ?? "",

    shippingInformation:
      value.shippingInformation ?? "",

    availabilityStatus:
      value.availabilityStatus ?? "",

    returnPolicy:
      value.returnPolicy ?? "",

    minimumOrderQuantity:
      value.minimumOrderQuantity !==
      undefined
        ? Number(
            value.minimumOrderQuantity,
          )
        : undefined,

    meta: value.meta,

    reviews: value.reviews ?? [],

    images: Array.isArray(value.images)
      ? value.images
      : [],

    thumbnail: value.thumbnail ?? "",

    source:
      value.source === "local"
        ? "local"
        : "dummyjson",

    createdBy: value.createdBy,

    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
  };
}

export async function GET(
  request: Request,
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } =
      new URL(request.url);

    const limit = Math.min(
      Math.max(
        Number(
          searchParams.get("limit") ??
            12,
        ),
        1,
      ),
      50,
    );

    const skip = Math.max(
      Number(
        searchParams.get("skip") ?? 0,
      ),
      0,
    );

    const search =
      searchParams
        .get("search")
        ?.trim() ?? "";

    const category =
      searchParams
        .get("category")
        ?.trim() ?? "";

    const sortBy =
      searchParams.get("sortBy") ?? "id";

    const order =
      searchParams.get("order") ===
      "asc"
        ? "asc"
        : "desc";

    const { data } =
      await dummyApi.get("/products", {
        params: {
          limit: 0,
        },
      });

    const baseProducts =
      Array.isArray(data?.products)
        ? data.products
        : [];

    await connectMongo();

    const localRecords: any[] =
      await ProductModel.find({
        source: "local",
        deleted: false,
      }).lean();

    const userDummyRecords: any[] =
      await ProductModel.find({
        source: "dummyjson",
        createdBy: user.id,
      }).lean();

    const overrides = new Map<
      number,
      any
    >();

    const deletedDummyIds =
      new Set<number>();

    for (const record of userDummyRecords) {
      const productId = Number(
        record.productId,
      );

      if (record.deleted) {
        deletedDummyIds.add(
          productId,
        );
      } else {
        overrides.set(
          productId,
          record,
        );
      }
    }

    let products = baseProducts
      .filter(
        (product: any) =>
          !deletedDummyIds.has(
            Number(product.id),
          ),
      )
      .map((product: any) => {
        const productId = Number(
          product.id,
        );

        const override =
          overrides.get(productId);

        if (!override) {
          return normalize(
            {
              ...product,
              source: "dummyjson",
            },
            {
              canEdit: true,
              canDelete: true,
            },
          );
        }

        return normalize(
          {
            ...product,
            ...override,
            id: productId,
            source: "dummyjson",
            createdBy:
              override.createdBy,
          },
          {
            canEdit: true,
            canDelete: true,
          },
        );
      });

    const localProducts =
      localRecords.map(
        (record: any) => {
          const isOwner =
            String(
              record.createdBy,
            ) === String(user.id);

          return normalize(
            {
              ...record,
              id: Number(
                record.productId,
              ),
              source: "local",
            },
            {
              canEdit: isOwner,
              canDelete: isOwner,
            },
          );
        },
      );

    products = [
      ...products,
      ...localProducts,
    ];

    if (search) {
      const query =
        search.toLowerCase();

      products = products.filter(
        (product: any) => {
          const searchable = [
            product.title,
            product.description,
            product.category,
            product.brand,
            product.sku,
            ...(product.tags ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query,
          );
        },
      );
    }

    if (category) {
      const normalizedCategory =
        category.toLowerCase();

      products =
        products.filter(
          (product: any) =>
            String(
              product.category,
            ).toLowerCase() ===
            normalizedCategory,
        );
    }

    products.sort(
      (a: any, b: any) => {
        const direction =
          order === "asc" ? 1 : -1;

        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (
          typeof aValue === "number" &&
          typeof bValue === "number"
        ) {
          return (
            (aValue - bValue) *
            direction
          );
        }

        return (
          String(aValue ?? "").localeCompare(
            String(bValue ?? ""),
          ) * direction
        );
      },
    );

    const total = products.length;

    return NextResponse.json({
      products: products.slice(
        skip,
        skip + limit,
      ),
      total,
      skip,
      limit,
    });
  } catch (error) {
    console.error(
      "GET /api/products error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const validation =
      validateProduct(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: Object.values(
            validation.errors,
          ).join(" "),
          errors:
            validation.errors,
        },
        {
          status: 400,
        },
      );
    }

    await connectMongo();

    let productId = Date.now();

    while (
      await ProductModel.exists({
        productId,
      })
    ) {
      productId += 1;
    }

    const product =
      await ProductModel.create({
        productId,
        source: "local",

        title:
          validation.value.title,

        description:
          validation.value
            .description,

        category:
          validation.value.category,

        price:
          validation.value.price,

        discountPercentage:
          validation.value
            .discountPercentage,

        stock:
          validation.value.stock,

        tags:
          validation.value.tags,

        brand:
          validation.value.brand ?? "",

        sku:
          validation.value.sku ?? "",

        weight:
          validation.value.weight,

        dimensions:
          validation.value.dimensions,

        warrantyInformation:
          validation.value
            .warrantyInformation,

        shippingInformation:
          validation.value
            .shippingInformation,

        availabilityStatus:
          validation.value
            .availabilityStatus,

        returnPolicy:
          validation.value
            .returnPolicy,

        minimumOrderQuantity:
          validation.value
            .minimumOrderQuantity,

        images:
          validation.value.images,

        thumbnail:
          validation.value.thumbnail,

        createdBy: user.id,
        deleted: false,
      });

    return NextResponse.json(
      normalize(
        {
          ...product.toObject(),
          id: product.productId,
          source: "local",
          createdBy:
            product.createdBy,
        },
        {
          canEdit: true,
          canDelete: true,
        },
      ),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/products error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create product",
      },
      {
        status: 500,
      },
    );
  }
}