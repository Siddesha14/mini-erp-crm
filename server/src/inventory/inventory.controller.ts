import type { Request, Response } from "express";
import { prisma } from "../config/database.js";
import {
  createStockMovementSchema,
  stockMovementQuerySchema,
} from "./inventory.validator.js";

export const createStockMovement = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = createStockMovementSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock movement data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { productId, quantity, type, reason } = result.data;

    const movement = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let newStock = product.currentStock;

      if (type === "IN") {
        newStock += quantity;
      } else {
        if (product.currentStock < quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        newStock -= quantity;
      }

      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          currentStock: newStock,
        },
      });

      return tx.stockMovement.create({
        data: {
          productId,
          quantity,
          type,
          reason,
          createdById: req.user!.userId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              currentStock: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: `Stock ${type === "IN" ? "added" : "removed"} successfully`,
      data: movement,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          success: false,
          message: "Insufficient stock",
        });
      }
    }

    console.error("Create stock movement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create stock movement",
    });
  }
};

export const getStockMovements = async (
  req: Request,
  res: Response
) => {
  try {
    const result = stockMovementQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const {
      page,
      limit,
      productId,
      type,
    } = result.data;

    const skip = (page - 1) * limit;

    const where = {
      ...(productId
        ? {
            productId,
          }
        : {}),

      ...(type
        ? {
            type,
          }
        : {}),
    };

    const [movements, total] = await prisma.$transaction([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      }),

      prisma.stockMovement.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
};