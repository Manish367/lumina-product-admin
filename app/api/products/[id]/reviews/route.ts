import { NextResponse } from "next/server";

import { dummyApi } from "@/lib/axios";
import { connectMongo } from "@/lib/mongodb";
import { ProductModel } from "@/lib/models/Product";
import { ReviewModel } from "@/lib/models/Review";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function canViewProduct(productId: number, userId: string) {
  await connectMongo();

  /*
   * Local products are globally visible unless
   * the creator has deleted them.
   */
  const localProduct: any = await ProductModel.findOne({
    productId,
    source: "local",
  }).lean();

  if (localProduct) {
    return !localProduct.deleted;
  }

  /*
   * DummyJSON deletion is user-specific.
   */
  const userOverride: any = await ProductModel.findOne({
    productId,
    source: "dummyjson",
    createdBy: userId,
  }).lean();

  if (userOverride?.deleted) {
    return false;
  }

  try {
    await dummyApi.get(`/products/${productId}`);

    return true;
  } catch {
    return false;
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

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

    const visible = await canViewProduct(productId, user.id);

    if (!visible) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Preserve original DummyJSON reviews.
     */
    let dummyReviews: any[] = [];

    try {
      const { data } = await dummyApi.get(`/products/${productId}`);

      if (Array.isArray(data?.reviews)) {
        dummyReviews = data.reviews;
      }
    } catch {
      dummyReviews = [];
    }

    const originalReviews = dummyReviews.map((review: any, index: number) => ({
      id: `dummyjson-${productId}-${index}`,
      productId,
      reviewerId: `dummyjson-${productId}-${index}`,
      rating: Number(review.rating ?? 0),
      comment: review.comment ?? "",
      date: review.date ?? new Date().toISOString(),
      reviewerName: review.reviewerName ?? "DummyJSON User",
      reviewerEmail: review.reviewerEmail ?? "",
      source: "dummyjson" as const,
      canEdit: false,
    }));

    await connectMongo();

    const userReviews = await ReviewModel.find({
      productId,
    })
      .sort({
        createdAt: 1,
      })
      .lean();

    const savedReviews = userReviews.map((review: any) => ({
      id: String(review._id),
      productId: Number(review.productId),
      reviewerId: String(review.reviewerId),
      rating: Number(review.rating),
      comment: review.comment ?? "",
      date:
        review.date ??
        review.createdAt?.toISOString?.() ??
        new Date().toISOString(),
      reviewerName: review.reviewerName ?? "",
      reviewerEmail: review.reviewerEmail ?? "",
      source: "user" as const,
      canEdit: String(review.reviewerId) === String(user.id),
    }));

    return NextResponse.json({
      reviews: [...originalReviews, ...savedReviews],
    });
  } catch (error) {
    console.error("GET product reviews error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

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

    const visible = await canViewProduct(productId, user.id);

    if (!visible) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    const body = await request.json();

    const rating = Number(body.rating);

    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: "Rating must be between 1 and 5.",
        },
        {
          status: 400,
        },
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          error: "Review comment is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (comment.length > 2000) {
      return NextResponse.json(
        {
          error: "Review comment is too long.",
        },
        {
          status: 400,
        },
      );
    }

    await connectMongo();

    const existing = await ReviewModel.findOne({
      productId,
      reviewerId: user.id,
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "You have already reviewed this product.",
        },
        {
          status: 409,
        },
      );
    }

    const reviewerName =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.username ||
      user.email ||
      "User";

    try {
      const review = await ReviewModel.create({
        productId,
        reviewerId: user.id,
        reviewerName,
        reviewerEmail: user.email ?? "",
        rating,
        comment,
        date: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          review: {
            id: String(review._id),
            productId: Number(review.productId),
            reviewerId: String(review.reviewerId),
            rating: Number(review.rating),
            comment: review.comment,
            date: review.date,
            reviewerName: review.reviewerName,
            reviewerEmail: review.reviewerEmail ?? "",
            source: "user",
            canEdit: true,
          },
        },
        {
          status: 201,
        },
      );
    } catch (error: any) {
      /*
       * Protect against a race condition where the
       * unique MongoDB index catches a duplicate.
       */
      if (error?.code === 11000) {
        return NextResponse.json(
          {
            error: "You have already reviewed this product.",
          },
          {
            status: 409,
          },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("POST product review error:", error);

    return NextResponse.json(
      {
        error: "Failed to create review",
      },
      {
        status: 500,
      },
    );
  }
}
