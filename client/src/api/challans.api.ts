import api from "./axios";

export type ChallanStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "CANCELLED";

export type ChallanItem = {
  id: number;
  challanId: number;
  productId: number;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
};

export type ChallanCustomer = {
  id: number;
  name: string;
  businessName?: string | null;
  mobile?: string | null;
};

export type ChallanUser = {
  id: number;
  name: string;
  email?: string;
  role: string;
};

export type Challan = {
  id: number;
  challanNumber: string;
  customerId: number;
  totalQuantity: number;
  status: ChallanStatus;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  customer?: ChallanCustomer;
  createdBy?: ChallanUser;
  items: ChallanItem[];
};

export type ChallanItemPayload = {
  productId: number;
  quantity: number;
};

export type CreateChallanPayload = {
  customerId: number;
  items: ChallanItemPayload[];
};

export type UpdateChallanPayload =
  Partial<CreateChallanPayload>;

export type ChallanQuery = {
  page?: number;
  limit?: number;
  status?: ChallanStatus;
  customerId?: number;
};

export type ChallanListResponse = {
  success: boolean;
  data: Challan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ChallanResponse = {
  success: boolean;
  data: Challan;
};

export const getChallans = async (
  params?: ChallanQuery
) => {
  const response =
    await api.get<ChallanListResponse>(
      "/challans",
      {
        params,
      }
    );

  return response.data;
};

export const getChallanById = async (
  id: number
) => {
  const response =
    await api.get<ChallanResponse>(
      `/challans/${id}`
    );

  return response.data;
};

export const createChallan = async (
  payload: CreateChallanPayload
) => {
  const response =
    await api.post<ChallanResponse>(
      "/challans",
      payload
    );

  return response.data;
};

export const updateChallan = async (
  id: number,
  payload: UpdateChallanPayload
) => {
  const response =
    await api.put<ChallanResponse>(
      `/challans/${id}`,
      payload
    );

  return response.data;
};

export const confirmChallan = async (
  id: number
) => {
  const response =
    await api.post<ChallanResponse>(
      `/challans/${id}/confirm`
    );

  return response.data;
};

export const cancelChallan = async (
  id: number
) => {
  const response =
    await api.post<ChallanResponse>(
      `/challans/${id}/cancel`
    );

  return response.data;
};