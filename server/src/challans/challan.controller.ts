import type { Request, Response } from "express";
import { prisma } from "../config/database.js";
import {
  createChallanSchema,
  updateChallanSchema,
  challanQuerySchema,
} from "./challan.validator.js";

const generateChallanNumber = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `CH-${year}${month}${day}-${random}`;
};

export const createChallan = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = createChallanSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { customerId, items } = result.data;

    // Prevent duplicate products in the same challan.
    const productIds = items.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "The same product cannot be added more than once",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));

      const missingProductIds = productIds.filter(
        (id) => !foundIds.has(id)
      );

      return res.status(404).json({
        success: false,
        message: "One or more products were not found",
        missingProductIds,
      });
    }

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const challanNumber = generateChallanNumber();

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: "DRAFT",
        createdById: req.user.userId,

        items: {
          create: items.map((item) => {
            const product = productMap.get(item.productId)!;

            return {
              productId: product.id,
              productNameSnapshot: product.name,
              skuSnapshot: product.sku,
              unitPriceSnapshot: product.unitPrice,
              quantity: item.quantity,
            };
          }),
        },
      },

      include: {
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: challan,
    });
  } catch (error) {
    console.error("Create challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create challan",
    });
  }
};

export const getChallans = async (req: Request, res: Response) => {
  try {
    const result = challanQuerySchema.safeParse(req.query);

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
      status,
      customerId,
    } = result.data;

    const skip = (page - 1) * limit;

    const where = {
      ...(status
        ? {
            status,
          }
        : {}),

      ...(customerId
        ? {
            customerId,
          }
        : {}),
    };

    const [challans, total] = await prisma.$transaction([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true,
            },
          },

          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },

          items: true,
        },
      }),

      prisma.challan.count({
        where,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get challans error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch challans",
    });
  }
};

export const getChallanById = async (
  req: Request,
  res: Response
) => {
  try {
    const challanId = Number(req.params.id);

    if (!Number.isInteger(challanId) || challanId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const challan = await prisma.challan.findUnique({
      where: {
        id: challanId,
      },

      include: {
        customer: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        items: true,
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    console.error("Get challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch challan",
    });
  }
};

export const updateChallan = async (
  req: Request,
  res: Response
) => {
  try {
    const challanId = Number(req.params.id);

    if (!Number.isInteger(challanId) || challanId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const result = updateChallanSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const existingChallan = await prisma.challan.findUnique({
      where: {
        id: challanId,
      },
      include: {
        items: true,
      },
    });

    if (!existingChallan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (existingChallan.status !== "DRAFT") {
      return res.status(409).json({
        success: false,
        message: "Only draft challans can be edited",
      });
    }

    const customerId =
      result.data.customerId ?? existingChallan.customerId;

    const items = result.data.items ?? existingChallan.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const productIds = items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "The same product cannot be added more than once",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products were not found",
      });
    }

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const challan = await prisma.$transaction(async (tx) => {
      await tx.challanItem.deleteMany({
        where: {
          challanId,
        },
      });

      return tx.challan.update({
        where: {
          id: challanId,
        },

        data: {
          customerId,
          totalQuantity,

          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!;

              return {
                productId: product.id,
                productNameSnapshot: product.name,
                skuSnapshot: product.sku,
                unitPriceSnapshot: product.unitPrice,
                quantity: item.quantity,
              };
            }),
          },
        },

        include: {
          customer: true,
          items: true,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Challan updated successfully",
      data: challan,
    });
  } catch (error) {
    console.error("Update challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update challan",
    });
  }
};

export const confirmChallan = async (
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

    const challanId = Number(req.params.id);

    if (!Number.isInteger(challanId) || challanId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: {
          id: challanId,
        },

        include: {
          items: true,
        },
      });

      if (!challan) {
        throw new Error("CHALLAN_NOT_FOUND");
      }

      if (challan.status !== "DRAFT") {
        throw new Error("CHALLAN_NOT_DRAFT");
      }

      const productIds = challan.items.map(
        (item) => item.productId
      );

      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const productMap = new Map(
        products.map((product) => [product.id, product])
      );

      // Check EVERY item before changing ANY stock.
      for (const item of challan.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (product.currentStock < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${product.name}:${product.currentStock}:${item.quantity}`
          );
        }
      }

      // All products have sufficient stock.
      for (const item of challan.items) {
        const product = productMap.get(item.productId)!;

        await tx.product.update({
          where: {
            id: product.id,
          },

          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            type: "OUT",
            reason: `Sales challan ${challan.challanNumber}`,
            createdById: req.user!.userId,
          },
        });
      }

      return tx.challan.update({
        where: {
          id: challanId,
        },

        data: {
          status: "CONFIRMED",
        },

        include: {
          customer: true,
          items: true,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Challan confirmed and stock deducted successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CHALLAN_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Challan not found",
        });
      }

      if (error.message === "CHALLAN_NOT_DRAFT") {
        return res.status(409).json({
          success: false,
          message: "Only draft challans can be confirmed",
        });
      }

      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "One or more products no longer exist",
        });
      }

      if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const [, productName, available, requested] =
          error.message.split(":");

        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${productName}`,
          details: {
            availableStock: Number(available),
            requestedQuantity: Number(requested),
          },
        });
      }
    }

    console.error("Confirm challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm challan",
    });
  }
};

export const cancelChallan = async (
  req: Request,
  res: Response
) => {
  try {
    const challanId = Number(req.params.id);

    if (!Number.isInteger(challanId) || challanId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const challan = await prisma.challan.findUnique({
      where: {
        id: challanId,
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (challan.status !== "DRAFT") {
      return res.status(409).json({
        success: false,
        message: "Only draft challans can be cancelled",
      });
    }

    const cancelledChallan = await prisma.challan.update({
      where: {
        id: challanId,
      },

      data: {
        status: "CANCELLED",
      },

      include: {
        customer: true,
        items: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Challan cancelled successfully",
      data: cancelledChallan,
    });
  } catch (error) {
    console.error("Cancel challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel challan",
    });
  }
};