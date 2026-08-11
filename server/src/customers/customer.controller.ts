import type { Request, Response } from "express";
import { prisma } from "../config/database.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  followUpSchema,
  customerQuerySchema,
} from "./customer.validator.js";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const result = createCustomerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const customer = await prisma.customer.create({
      data: result.data,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const result = customerQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { page, limit, search, status } = result.data;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { mobile: { contains: search, mode: "insensitive" as const } },
              {
                businessName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        followUps: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            challans: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const result = updateCustomerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: result.data,
    });

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

export const addFollowUp = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = followUpSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId,
        createdById: req.user.userId,
        note: result.data.note,
        followUpDate: result.data.followUpDate,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        followUpDate: result.data.followUpDate,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Follow-up added successfully",
      data: followUp,
    });
  } catch (error) {
    console.error("Add follow-up error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add follow-up",
    });
  }
};