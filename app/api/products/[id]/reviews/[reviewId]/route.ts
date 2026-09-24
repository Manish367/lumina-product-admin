import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectMongo } from "@/lib/mongodb";
import { ReviewModel } from "@/lib/models/Review";
import { getSessionUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
    reviewId: string;
  }>;
};

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

    const { id, reviewId } =
      await context.params;

    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      !mongoose.Types.ObjectId.isValid(
        reviewId,
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid review or product id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const rating = Number(body.rating);

    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : "";

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error:
            "Rating must be between 1 and 5.",
        },
        {
          status: 400,
        },
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          error:
            "Review comment is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (comment.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Review comment is too long.",
        },
        {
          status: 400,
        },
      );
    }

    await connectMongo();

    /*
     * Ownership is enforced here.
     */
    const review =
      await ReviewModel.findOne({
        _id: reviewId,
        productId,
        reviewerId: user.id,
      });

    if (!review) {
      return NextResponse.json(
        {
          error:
            "You can only edit your own review.",
        },
        {
          status: 403,
        },
      );
    }

    review.rating = rating;
    review.comment = comment;
    review.date =
      new Date().toISOString();

    await review.save();

    return NextResponse.json({
      review: {
        id: String(review._id),
        productId:
          Number(review.productId),
        reviewerId:
          String(review.reviewerId),
        rating:
          Number(review.rating),
        comment:
          review.comment,
        date:
          review.date,
        reviewerName:
          review.reviewerName,
        reviewerEmail:
          review.reviewerEmail ?? "",
        source: "user",
        canEdit: true,
      },
    });
  } catch (error) {
    console.error(
      "PUT product review error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to update review",
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

    const { id, reviewId } =
      await context.params;

    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      !mongoose.Types.ObjectId.isValid(
        reviewId,
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid review or product id",
        },
        {
          status: 400,
        },
      );
    }

    await connectMongo();

    /*
     * Only the reviewer can delete their review.
     */
    const review =
      await ReviewModel.findOne({
        _id: reviewId,
        productId,
        reviewerId: user.id,
      });

    if (!review) {
      return NextResponse.json(
        {
          error:
            "You can only delete your own review.",
        },
        {
          status: 403,
        },
      );
    }

    await review.deleteOne();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE product review error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to delete review",
      },
      {
        status: 500,
      },
    );
  }
}