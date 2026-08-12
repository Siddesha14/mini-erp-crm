import api from "./axios";

export interface DashboardCustomer {
  id: number;
  name: string;
  businessName: string | null;
}

export interface DashboardChallan {
  id: number;
  challanNumber: string;
  totalQuantity: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  customer: DashboardCustomer;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  warehouse: string;
}

export interface DashboardSummary {
  customers: number;
  products: number;
  lowStockProducts: number;
  challans: number;

  confirmedChallans: number;
 draftChallans: number;
 cancelledChallans: number;

totalStock: number;
stockInQuantity: number;
stockOutQuantity: number;

 recentChallans: DashboardChallan[];
  lowStockItems: LowStockItem[];
}

interface DashboardResponse {
  success: boolean;
  data: DashboardSummary;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get<DashboardResponse>(
    "/dashboard/summary"
  );

  return response.data.data;
};