import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const shop = searchParams.get("shop");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    if (!shop) {
      return NextResponse.json({ error: "Shop is required" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const total = await prisma.sampleOrder.count({
      where: { shop },
    });

    const orders = await prisma.sampleOrder.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
