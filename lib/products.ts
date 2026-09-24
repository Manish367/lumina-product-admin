import { api } from "./axios";
import type {
  Product,
  ProductPage,
  Review,
} from "@/types/product";

export async function getProducts(
  params: {
    limit: number;
    skip: number;
    search?: string;
    category?: string;
    sortBy?: string;
    order?: "asc" | "desc";
  },
  signal?: AbortSignal,
): Promise<ProductPage> {
  const { data } =
    await api.get<ProductPage>(
      "/api/products",
      {
        params,
        signal,
      },
    );

  return data;
}

export async function getProduct(
  id: string,
  signal?: AbortSignal,
) {
  const { data } =
    await api.get<Product>(
      `/api/products/${id}`,
      {
        signal,
      },
    );

  return data;
}

export async function getCategories(
  signal?: AbortSignal,
): Promise<any[]> {
  const { data } =
    await api.get<any[]>(
      "/api/categories",
      {
        signal,
      },
    );

  return data;
}

export async function createProduct(
  payload: Partial<Product>,
) {
  const { data } =
    await api.post<Product>(
      "/api/products",
      payload,
    );

  return data;
}

export async function updateProduct(
  id: number,
  payload: Partial<Product>,
) {
  const { data } =
    await api.put<Product>(
      `/api/products/${id}`,
      payload,
    );

  return data;
}

export async function deleteProduct(
  id: number,
) {
  const { data } =
    await api.delete(
      `/api/products/${id}`,
    );

  return data;
}

export async function uploadProductImage(
  file: File,
) {
  const formData = new FormData();

  formData.append("file", file);

  const { data } =
    await api.post<{
      url: string;
      publicId: string;
    }>(
      "/api/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
        timeout: 60000,
      },
    );

  return data;
}

export async function getProductReviews(
  productId: number | string,
  signal?: AbortSignal,
) {
  const { data } =
    await api.get<{
      reviews: Review[];
    }>(
      `/api/products/${productId}/reviews`,
      {
        signal,
      },
    );

  return data.reviews;
}

export async function createProductReview(
  productId: number | string,
  data: {
    rating: number;
    comment: string;
  },
) {
  const response =
    await api.post(
      `/api/products/${productId}/reviews`,
      data,
    );

  return response.data.review as Review;
}

export async function updateProductReview(
  productId: number | string,
  reviewId: string,
  data: {
    rating: number;
    comment: string;
  },
) {
  const response =
    await api.put(
      `/api/products/${productId}/reviews/${reviewId}`,
      data,
    );

  return response.data.review as Review;
}

export async function deleteProductReview(
  productId: number | string,
  reviewId: string,
) {
  const response =
    await api.delete(
      `/api/products/${productId}/reviews/${reviewId}`,
    );

  return response.data;
}