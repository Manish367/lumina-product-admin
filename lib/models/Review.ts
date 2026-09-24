import mongoose, {
  Schema,
  type InferSchemaType,
} from "mongoose";

const ReviewSchema = new Schema(
  {
    productId: {
      type: Number,
      required: true,
      index: true,
    },

    reviewerId: {
      type: String,
      required: true,
      index: true,
    },

    reviewerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    reviewerEmail: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

ReviewSchema.index(
  {
    productId: 1,
    reviewerId: 1,
  },
  {
    unique: true,
  },
);

export type ReviewDocument = InferSchemaType<typeof ReviewSchema>;

export const ReviewModel =
  mongoose.models.Review ||
  mongoose.model("Review", ReviewSchema);