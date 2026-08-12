import api from "./axios";

export type StockMovementType = "IN" | "OUT";

export type StockMovement = {
  id: number;
  productId: number;
  quantity: number;
  type: StockMovementType;
  reason: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    sku: string;
  };
  createdBy: {
    id: number;
    name: string;
    role: string;
  };
};

export type CreateStockMovementPayload = {
  productId: number;
  quantity: number;
  type: StockMovementType;
  reason: string;
};

export type StockMovementQuery = {
  page?: number;
  limit?: number;
  productId?: number;
  type?: StockMovementType;
};

export type StockMovementListResponse = {
  success: boolean;
  data: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type StockMovementResponse = {
  success: boolean;
  data: StockMovement;
};

export const getStockMovements = async (
  params?: StockMovementQuery
) => {
  const response =
    await api.get<StockMovementListResponse>(
      "/inventory/movements",
      {
        params,
      }
    );

  return response.data;
};

export const createStockMovement = async (
  payload: CreateStockMovementPayload
) => {
  const response =
    await api.post<StockMovementResponse>(
      "/inventory/movements",
      payload
    );

  return response.data;
};