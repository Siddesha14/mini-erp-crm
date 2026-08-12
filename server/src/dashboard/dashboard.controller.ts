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
      confirmedChallanCount,
      draftChallanCount,
      cancelledChallanCount,
      totalStock,
      stockInQuantity,
      stockOutQuantity,
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

      // Confirmed challans
      prisma.challan.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      // Draft challans
      prisma.challan.count({
        where: {
          status: "DRAFT",
        },
      }),

      // Cancelled challans
      prisma.challan.count({
        where: {
          status: "CANCELLED",
        },
      }),

      // Total current stock across all products
      prisma.product.aggregate({
        _sum: {
          currentStock: true,
        },
      }),

      // Total Stock IN movements
      prisma.stockMovement.aggregate({
        where: {
          type: "IN",
        },
        _sum: {
          quantity: true,
        },
      }),

      // Total Stock OUT movements
      prisma.stockMovement.aggregate({
        where: {
          type: "OUT",
        },
        _sum: {
          quantity: true,
        },
      }),

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
        // Existing dashboard fields
        customers: customerCount,
        products: productCount,
        lowStockProducts: lowStockCount,
        challans: challanCount,
        recentChallans,
        lowStockItems: lowStockProducts,

        // Analytics
        confirmedChallans: confirmedChallanCount,
        draftChallans: draftChallanCount,
        cancelledChallans: cancelledChallanCount,
        totalStock: totalStock._sum.currentStock ?? 0,
        stockInQuantity: stockInQuantity._sum.quantity ?? 0,
        stockOutQuantity: stockOutQuantity._sum.quantity ?? 0,
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