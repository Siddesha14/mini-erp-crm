import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

export const getDashboardSummary = async (
  _req: Request,
  res: Response
) => {
  try {
    const [
      customerCount,
      productCount,
      lowStockCount,
      challanCount,
      recentChallans,
      lowStockProducts,
    ] = await prisma.$transaction([
      // Total customers
      prisma.customer.count(),

      // Total products
      prisma.product.count(),

      // Products that have reached or fallen below minimum stock
      prisma.product.count({
        where: {
          currentStock: {
            lte: prisma.product.fields.minStock,
          },
        },
      }),

      // Total challans
      prisma.challan.count(),

      // Latest 5 challans
      prisma.challan.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          challanNumber: true,
          totalQuantity: true,
          status: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
            },
          },
        },
      }),

      // Latest 5 low-stock products
      prisma.product.findMany({
        where: {
          currentStock: {
            lte: prisma.product.fields.minStock,
          },
        },
        take: 5,
        orderBy: {
          currentStock: "asc",
        },
        select: {
          id: true,
          name: true,
          sku: true,
          currentStock: true,
          minStock: true,
          warehouse: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customers: customerCount,
        products: productCount,
        lowStockProducts: lowStockCount,
        challans: challanCount,
        recentChallans,
        lowStockItems: lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};