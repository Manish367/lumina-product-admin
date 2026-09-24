import mongoose, {
  Schema,
  type InferSchemaType,
} from "mongoose";

const ProductSchema = new Schema(
  {
    productId: {
      type: Number,
      required: true,
      index: true,
    },

    sourceId: {
      type: Number,
      index: true,
    },

    source: {
      type: String,
      enum: ["dummyjson", "local"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /*
     * IMPORTANT:
     * Rating is NOT edited from ProductForm.
     * It is maintained separately from product editing.
     */
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    tags: {
      type: [String],
      default: [],
    },

    brand: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    sku: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    weight: {
      type: Number,
      min: 0,
    },

    dimensions: {
      width: {
        type: Number,
        min: 0,
      },

      height: {
        type: Number,
        min: 0,
      },

      depth: {
        type: Number,
        min: 0,
      },
    },

    availabilityStatus: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    warrantyInformation: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    shippingInformation: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    returnPolicy: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    minimumOrderQuantity: {
      type: Number,
      min: 1,
    },

    meta: {
      createdAt: {
        type: String,
      },

      updatedAt: {
        type: String,
      },

      barcode: {
        type: String,
      },

      qrCode: {
        type: String,
      },
    },

    images: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: String,
      default: "",
    },

    createdBy: {
      type: String,
      required: true,
      index: true,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index(
  {
    productId: 1,
    createdBy: 1,
  },
  {
    unique: true,
  },
);

ProductSchema.index({
  title: "text",
  description: "text",
  category: "text",
  brand: "text",
  sku: "text",
});

export type ProductDocument =
  InferSchemaType<typeof ProductSchema>;

export const ProductModel =
  mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);