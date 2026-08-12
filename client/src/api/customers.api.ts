import api from "./axios";

export type CustomerType =
  | "RETAIL"
  | "WHOLESALE"
  | "DISTRIBUTOR";

export type CustomerStatus =
  | "LEAD"
  | "ACTIVE"
  | "INACTIVE";

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string | null;
  gstNumber: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFollowUp {
  id: number;
  customerId: number;
  createdById: number;
  note: string;
  followUpDate: string;
  createdAt: string;
  createdBy?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  mobile?: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CustomerResponse {
  success: boolean;
  data: Customer;
}

interface FollowUpResponse {
  success: boolean;
  data: CustomerFollowUp;
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
}
export const getCustomers = async (
  params: CustomerQuery = {}
): Promise<CustomerListResponse> => {
  const response = await api.get<CustomerListResponse>(
    "/customers",
    { params }
  );

  return response.data;
};

export const getCustomerById = async (
  id: number
): Promise<Customer> => {
  const response = await api.get<CustomerResponse>(
    `/customers/${id}`
  );

  return response.data.data;
};

export const createCustomer = async (
  payload: CreateCustomerPayload
): Promise<Customer> => {
  const response = await api.post<CustomerResponse>(
    "/customers",
    payload
  );

  return response.data.data;
};

export const updateCustomer = async (
  id: number,
  payload: UpdateCustomerPayload
): Promise<Customer> => {
  const response = await api.put<CustomerResponse>(
    `/customers/${id}`,
    payload
  );

  return response.data.data;
};

export const addFollowUp = async (
  id: number,
  payload: {
    note: string;
    followUpDate: string;
  }
): Promise<CustomerFollowUp> => {
  const response = await api.post<FollowUpResponse>(
    `/customers/${id}/followups`,
    payload
  );

  return response.data.data;
};