import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json(
        { error: "Shop parameter missing" },
        { status: 400 }
      );
    }

    /* ---------- Global Settings ---------- */

    const settings = await prisma.sampleSettings.findUnique({
      where: { shop },
      select: {
        enabled: true,
        updatedAt: true,
      },
    });

    /* ---------- Product Overrides ---------- */

    const productPrices = await prisma.sampleProductPrice.findMany({
      where: { shop },
      select: {
        variantId: true,
        updatedAt: true,
      },
    });

    const customProducts = new Set(
      productPrices.map(p => p.variantId ?? "product")
    ).size;

    const overrides = productPrices.filter(p => p.variantId !== null).length;

    /* ---------- Last Updated ---------- */

    const lastUpdated =
      productPrices.length > 0
        ? productPrices
            .map(p => p.updatedAt)
            .sort((a, b) => b.getTime() - a.getTime())[0]
        : settings?.updatedAt ?? null;

    return NextResponse.json({
      globalEnabled: settings?.enabled ?? false,
      customProducts,
      overrides,
      lastUpdated,
    });
  } catch (error) {
    console.error("Stats API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
