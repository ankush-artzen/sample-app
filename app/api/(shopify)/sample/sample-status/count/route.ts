// import { NextResponse } from "next/server";
// import prisma from "@/lib/db/prisma-connect";

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const shop = searchParams.get("shop");

//     if (!shop) {
//       return NextResponse.json({ error: "Missing shop" }, { status: 400 });
//     }

//     const abandoned = await prisma.sampleOrder.count({
//       where: {
//         shop,
//         isPurchased: false,
//       },
//     });

//     const completed = await prisma.sampleOrder.count({
//       where: {
//         shop,
//         isPurchased: true,
//       },
//     });

//     return NextResponse.json({
//       status: true,
//       abandoned,
//       completed,
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err.message },
//       { status: 500 },
//     );
//   }
// }
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json({ error: "Missing shop" }, { status: 400 });
    }

    /* ---------------- BASIC COUNTS ---------------- */

    const abandoned = await prisma.sampleOrder.count({
      where: {
        shop,
        isPurchased: false,
      },
    });

    const completed = await prisma.sampleOrder.count({
      where: {
        shop,
        isPurchased: true,
      },
    });

    /* ---------------- TOTAL CUSTOMERS ---------------- */

    const totalCustomers = await prisma.sampleCustomer.count({
      where: { shop },
    });

    /* ---------------- TOP 5 CUSTOMERS ---------------- */

    const topCustomers = await prisma.sampleCustomer.findMany({
      where: { shop },
      orderBy: {
        totalSamples: "desc",
      },
      take: 5,
      select: {
        email: true,
        totalSamples: true,
        lastSampleAt: true,
      },
    });


    // Pull orders
    
    // const orders = await prisma.sampleOrder.findMany({
    //   where: {
    //     shop,
    //     isPurchased: true, 
    //   },
    //   select: {
    //     variantIds: true,
    //   },
    // });

    // Pull purchased orders WITH products
const orders = await prisma.sampleOrder.findMany({
    where: {
      shop,
      isPurchased: true,
    },
    include: {
      products: {
        select: {
          variantId: true,
        },
      },
    },
  });
  
  // Count variant usage
  const variantMap: Record<string, number> = {};
  
  for (const order of orders) {
    for (const product of order.products) {
      if (!product.variantId) continue;
  
      variantMap[product.variantId] =
        (variantMap[product.variantId] || 0) + 1;
    }
  }
  
  // Top 5 variants
  const topVariants = Object.entries(variantMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([variantId, count]) => ({
      variantId,
      count,
    }));
  
  const variantIds = topVariants.map(v => v.variantId);
  
  // Fetch product info
  const products = await prisma.sampleProductPrice.findMany({
    where: {
      shop,
      variantId: { in: variantIds },
    },
    select: {
      variantId: true,
      productId: true,
      title: true,
      image: true,
      price: true,
    },
  });
  
  // Map products
  const productMap = new Map(
    products.map(p => [p.variantId!, p]),
  );
  
  // Merge stats + product data
  const enrichedTopProducts = topVariants.map(v => {
    const product = productMap.get(v.variantId);
  
    return {
      variantId: v.variantId,
      count: v.count,
      productId: product?.productId ?? null,
      title: product?.title ?? "Unknown Product",
      image: product?.image ?? null,
      price: product?.price ?? null,
    };
  });
  return NextResponse.json({
  status: true,
  abandoned,
  completed,
  totalCustomers,
  topCustomers,
  topProducts: enrichedTopProducts,
});
    // Count variants manually
    // const variantMap: Record<string, number> = {};

    // orders.forEach((o) => {
    //   o.variantIds.forEach((v) => {
    //     variantMap[v] = (variantMap[v] || 0) + 1;
    //   });
    // });
    

    // const topVariants = Object.entries(variantMap)
    //   .sort((a, b) => b[1] - a[1])
    //   .slice(0, 5)
    //   .map(([variantId, count]) => ({
    //     variantId,
    //     count,
    //   }));

    // return NextResponse.json({
    //   status: true,
    //   abandoned,
    //   completed,
    //   totalCustomers,
    //   topCustomers,
    //   topVariants,
    // });
  } catch (err: any) {
    console.error("Analytics error:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}