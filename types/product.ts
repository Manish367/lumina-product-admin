export type ProductMeta = {
  createdAt?: string;
  updatedAt?: string;
  barcode?: string;
  qrCode?: string;
};

export type ProductDimensions = {
  width: number;
  height: number;
  depth: number;
};

export type Review = {
  id: string;
  productId: number;
  reviewerId: string;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
  source?: "dummyjson" | "user";
  canEdit?: boolean;
};

export type Product = {
  id: number;

  title: string;
  description: string;
  category: string;

  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;

  tags?: string[];

  brand?: string;
  sku?: string;

  weight?: number;

  dimensions?: ProductDimensions;

  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;

  returnPolicy?: string;
  minimumOrderQuantity?: number;

  reviews?: Review[];

  meta?: ProductMeta;

  images: string[];
  thumbnail: string;

  source?: "dummyjson" | "local";
  createdBy?: string;

  canEdit?: boolean;
  canDelete?: boolean;
};

export type ProductPage = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};