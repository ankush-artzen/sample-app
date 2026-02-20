import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";
function calculateFinalPrice(
  originalPrice: number,
  pricingType: string,
  customPrice?: number,
  fixedPrice?: number,
  percentageOff?: number,
) {
  if (pricingType === "FIXED") return Number(fixedPrice);

  if (pricingType === "PERCENTAGE") {
    return (
      Number(originalPrice) -
      (Number(originalPrice) * Number(percentageOff)) / 100
    );
  }

  return Number(customPrice);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const shop = searchParams.get("shop");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    if (!shop) {
      return NextResponse.json({ error: "Shop is required" }, { status: 400 });
    }

    // Fetch all rows for shop
    const products = await prisma.sampleProductPrice.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    });

    const grouped = Object.values(
      products.reduce((acc: any, item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = item;
        }
        return acc;
      }, {}),
    );

    const total = grouped.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = grouped.slice(start, end);

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const shop = searchParams.get("shop");

//     if (!shop) {
//       return NextResponse.json({ error: "Shop is required" }, { status: 400 });
//     }

//     const customProducts = await prisma.sampleProductPrice.findMany({
//       where: { shop },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json(customProducts);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
//   }
// }

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json({ error: "Missing shop" }, { status: 400 });
    }

    const body = await req.json();
    const payload = body.data ?? body;

    const { id, pricingType, customPrice, fixedPrice, percentageOff,originalProductPrice } = payload;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Find clicked variant
    const product = await prisma.sampleProductPrice.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const pricingData =
      pricingType === "FIXED"
        ? { fixedPrice, percentageOff: null }
        : pricingType === "PERCENTAGE"
          ? { percentageOff, fixedPrice: null }
          : { fixedPrice: null, percentageOff: null };

    // Get all variants of this product
    const allVariants = await prisma.sampleProductPrice.findMany({
      where: {
        shop: product.shop,
        productId: product.productId,
      },
    });

    await prisma.$transaction(
      allVariants.map((variant) => {
        const finalPrice = calculateFinalPrice(
          variant.originalProductPrice,
          pricingType,
          customPrice,
          fixedPrice,
          percentageOff,
        );

        return prisma.sampleProductPrice.update({
          where: { id: variant.id },
          data: {
            price: finalPrice,
            ...pricingData,
          },
        });
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CUSTOM_SETTINGS_PUT", error);
    return NextResponse.json(
      { error: "Failed to update price" },
      { status: 500 },
    );
  }
}
// export async function PUT(req: Request) {
//   try {
//     const body = await req.json();
//     const { id, price } = body;

//     if (!id || price === undefined) {
//       return NextResponse.json(
//         { error: "id and price are required" },
//         { status: 400 },
//       );
//     }

//     // Find productId from clicked row
//     const product = await prisma.sampleProductPrice.findUnique({
//       where: { id },
//     });

//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     // Update ALL variants of this product
//     await prisma.sampleProductPrice.updateMany({
//       where: {
//         shop: product.shop,
//         productId: product.productId,
//       },
//       data: {
//         price: Number(price),
//       },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to update price" },
//       { status: 500 },
//     );
//   }
// }

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Find productId
    const product = await prisma.sampleProductPrice.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.sampleProductPrice.deleteMany({
      where: {
        shop: product.shop,
        productId: product.productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
