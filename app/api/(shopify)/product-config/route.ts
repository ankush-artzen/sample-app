import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";

function normalizeProductId(productId: string): string | null {
  const trimmed = productId.trim();

  // gid://shopify/Product/7746098167891
  const gidMatch = /^gid:\/\/shopify\/Product\/(\d+)$/.exec(trimmed);
  if (gidMatch) return gidMatch[1];

  // Already numeric
  if (/^\d+$/.test(trimmed)) return trimmed;

  // Fallback: try last segment if it looks numeric
  const lastSegment = trimmed.split("/").pop();
  if (lastSegment && /^\d+$/.test(lastSegment)) return lastSegment;

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const shop = searchParams.get("shop");
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 401 });
    }

    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const normalizedProductId = normalizeProductId(productId);
    if (!normalizedProductId) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const setting = await prisma.productSetting.findUnique({
      where: {
        shop_productId: {
          shop,
          productId: normalizedProductId,
        },
      },
    });

    return NextResponse.json({
      sampleEnabled: setting?.sampleEnabled ?? false,
      reason: setting?.reason ?? null,
    });
  } catch (error) {
    console.error("PRODUCT_SETTING_GET", error);
    return NextResponse.json(
      { error: "Failed to fetch product setting" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const shop = searchParams.get("shop");
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const productId = body?.productId;
    const sampleEnabled = body?.sampleEnabled;
    const reason = body?.reason;

    if (typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const normalizedProductId = normalizeProductId(productId);
    if (!normalizedProductId) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    if (typeof sampleEnabled !== "boolean") {
      return NextResponse.json(
        { error: "sampleEnabled must be a boolean" },
        { status: 400 },
      );
    }

    if (reason != null && typeof reason !== "string") {
      return NextResponse.json(
        { error: "reason must be a string" },
        { status: 400 },
      );
    }

    const setting = await prisma.productSetting.upsert({
      where: {
        shop_productId: {
          shop,
          productId: normalizedProductId,
        },
      },
      update: {
        sampleEnabled,
        reason: reason ?? null,
      },
      create: {
        shop,
        productId: normalizedProductId,
        sampleEnabled,
        reason: reason ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      productId: setting.productId, // numeric-only
    });
  } catch (error) {
    console.error("PRODUCT_SETTING_POST", error);
    return NextResponse.json(
      { error: "Failed to save product setting" },
      { status: 500 },
    );
  }
}
