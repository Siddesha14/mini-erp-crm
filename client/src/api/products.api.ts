import api from "./axios";

export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  warehouse: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductPayload = {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minStock?: number;
  warehouse: string;
};

export type UpdateProductPayload = Partial<
  Omit<CreateProductPayload, "currentStock">
>;

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
};

export type ProductListResponse = {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductResponse = {
  success: boolean;
  data: Product;
};

export const getProducts = async (
  params?: ProductQuery
) => {
  const response = await api.get<ProductListResponse>(
    "/products",
    {
      params,
    }
  );

  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get<ProductResponse>(
    `/products/${id}`
  );

  return response.data;
};

export const createProduct = async (
  payload: CreateProductPayload
) => {
  const response = await api.post<ProductResponse>(
    "/products",
    payload
  );

  return response.data;
};

export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload
) => {
  const response = await api.put<ProductResponse>(
    `/products/${id}`,
    payload
  );

  return response.data;
};