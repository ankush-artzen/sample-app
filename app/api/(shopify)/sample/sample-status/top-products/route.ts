import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json({ error: "Missing shop" }, { status: 400 });
    }

    const topProducts = await prisma.sampleProductPrice.groupBy({
      by: ["productId", "title", "image"],

      where: {
        shop,
        // order: {
        //   status: "COMPLETED",
        // },
      },

      _count: {
        productId: true,
      },

      _sum: {
        price: true,
      },

      orderBy: {
        _count: {
          productId: "desc",
        },
      },

      take: 5,
    });

    const formatted = topProducts.map((p) => ({
      productId: p.productId,
      title: p.title,
      image: p.image,
      sold: p._count.productId,
      revenue: p._sum?.price ?? 0,
    }));

    return NextResponse.json({
      status: true,
      topProducts: formatted,
    });
  } catch (error: any) {
    console.error("Top Products Error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }
}