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

    rating: Number(
      value.rating ?? 0,
    ),

    stock: Number(
      value.stock ?? 0,
    ),

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

async function getDummyProduct(
  productId: number,
) {
  const { data } =
    await dummyApi.get(
      `/products/${productId}`,
    );

  return data;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } =
      await context.params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          error: "Invalid product id",
        },
        {
          status: 400,
        },
      );
    }

    await connectMongo();

    /*
     * LOCAL PRODUCT
     *
     * Globally visible.
     */
    const localProduct: any =
      await ProductModel.findOne({
        productId,
        source: "local",
      }).lean();

    if (localProduct) {
      if (localProduct.deleted) {
        return NextResponse.json(
          {
            error: "Product not found",
            code: "PRODUCT_NOT_FOUND",
          },
          {
            status: 404,
          },
        );
      }

      const isOwner =
        String(
          localProduct.createdBy,
        ) === String(user.id);

      return NextResponse.json(
        normalize(
          {
            ...localProduct,
            id: productId,
            source: "local",
          },
          {
            canEdit: isOwner,
            canDelete: isOwner,
          },
        ),
      );
    }

    /*
     * USER-SPECIFIC DUMMYJSON OVERRIDE
     */
    const userOverride: any =
      await ProductModel.findOne({
        productId,
        source: "dummyjson",
        createdBy: user.id,
      }).lean();

    if (userOverride?.deleted) {
      return NextResponse.json(
        {
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    let baseProduct: any;

    try {
      baseProduct =
        await getDummyProduct(
          productId,
        );
    } catch {
      return NextResponse.json(
        {
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      normalize(
        {
          ...baseProduct,
          ...(userOverride ?? {}),
          id: productId,
          source: "dummyjson",
          createdBy:
            userOverride?.createdBy,
        },
        {
          canEdit: true,
          canDelete: true,
        },
      ),
    );
  } catch (error) {
    console.error(
      "GET /api/products/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch product",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } =
      await context.params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          error: "Invalid product id",
        },
        {
          status: 400,
        },
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

    /*
     * LOCAL PRODUCT
     *
     * Only creator can edit.
     */
    const localProduct =
      await ProductModel.findOne({
        productId,
        source: "local",
      });

    if (localProduct) {
      if (localProduct.deleted) {
        return NextResponse.json(
          {
            error: "Product not found",
            code: "PRODUCT_NOT_FOUND",
          },
          {
            status: 404,
          },
        );
      }

      if (
        String(
          localProduct.createdBy,
        ) !== String(user.id)
      ) {
        return NextResponse.json(
          {
            error:
              "You can only edit products you created.",
          },
          {
            status: 403,
          },
        );
      }

      Object.assign(
        localProduct,
        validation.value,
        {
          productId,
          source: "local",
          createdBy: user.id,
          deleted: false,
        },
      );

      await localProduct.save();

      return NextResponse.json(
        normalize(
          {
            ...localProduct.toObject(),
            id: productId,
            source: "local",
          },
          {
            canEdit: true,
            canDelete: true,
          },
        ),
      );
    }

    /*
     * DUMMYJSON PRODUCT
     *
     * Each user has their own override.
     */
    let userOverride =
      await ProductModel.findOne({
        productId,
        source: "dummyjson",
        createdBy: user.id,
      });

    if (
      userOverride?.deleted
    ) {
      userOverride.deleted = false;
    }

    if (!userOverride) {
      let baseProduct: any;

      try {
        baseProduct =
          await getDummyProduct(
            productId,
          );
      } catch {
        return NextResponse.json(
          {
            error: "Product not found",
            code: "PRODUCT_NOT_FOUND",
          },
          {
            status: 404,
          },
        );
      }

      userOverride =
        new ProductModel({
          ...baseProduct,

          productId,

          sourceId: productId,

          source: "dummyjson",

          createdBy: user.id,

          deleted: false,
        });
    }

    /*
     * Do not let editing modify rating.
     *
     * Rating remains the source/aggregate value.
     */
    Object.assign(
      userOverride,
      validation.value,
      {
        productId,
        sourceId: productId,
        source: "dummyjson",
        createdBy: user.id,
        deleted: false,
      },
    );

    await userOverride.save();

    return NextResponse.json(
      normalize(
        {
          ...userOverride.toObject(),
          id: productId,
          source: "dummyjson",
        },
        {
          canEdit: true,
          canDelete: true,
        },
      ),
    );
  } catch (error) {
    console.error(
      "PUT /api/products/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update product",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } =
      await context.params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          error: "Invalid product id",
        },
        {
          status: 400,
        },
      );
    }

    await connectMongo();

    /*
     * LOCAL PRODUCTS
     *
     * Deletion is global.
     */
    const localProduct =
      await ProductModel.findOne({
        productId,
        source: "local",
      });

    if (localProduct) {
      if (localProduct.deleted) {
        return NextResponse.json(
          {
            error: "Product not found",
            code: "PRODUCT_NOT_FOUND",
          },
          {
            status: 404,
          },
        );
      }

      if (
        String(
          localProduct.createdBy,
        ) !== String(user.id)
      ) {
        return NextResponse.json(
          {
            error:
              "You can only delete products you created.",
          },
          {
            status: 403,
          },
        );
      }

      localProduct.deleted = true;

      await localProduct.save();

      return NextResponse.json({
        success: true,
        scope: "global",
      });
    }

    /*
     * DUMMYJSON PRODUCTS
     *
     * Deletion is user-specific.
     */
    let userOverride =
      await ProductModel.findOne({
        productId,
        source: "dummyjson",
        createdBy: user.id,
      });

    if (!userOverride) {
      let baseProduct: any;

      try {
        baseProduct =
          await getDummyProduct(
            productId,
          );
      } catch {
        return NextResponse.json(
          {
            error: "Product not found",
            code: "PRODUCT_NOT_FOUND",
          },
          {
            status: 404,
          },
        );
      }

      userOverride =
        new ProductModel({
          ...baseProduct,

          productId,

          sourceId: productId,

          source: "dummyjson",

          createdBy: user.id,

          deleted: true,
        });
    } else {
      userOverride.deleted = true;
    }

    await userOverride.save();

    return NextResponse.json({
      success: true,
      scope: "user",
    });
  } catch (error) {
    console.error(
      "DELETE /api/products/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete product",
      },
      {
        status: 500,
      },
    );
  }
}