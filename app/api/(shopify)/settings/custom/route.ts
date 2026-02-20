// // import { NextResponse } from "next/server";
// // import prisma from "@/lib/db/prisma-connect";

// // export async function POST(req: Request) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const shop = searchParams.get("shop");

// //     if (!shop) {
// //       return NextResponse.json(
// //         { error: "Missing shop in query params" },
// //         { status: 400 }
// //       );
// //     }

// //     const body = await req.json();
// //     const payload = body.data ?? body;

// //     const productId: string | undefined = payload.productId;
// //     const variantId: string | null = payload.variantId ?? null;
// //     const price: number | undefined = payload.customPrice ?? payload.price;

// //     if (!productId || price == null) {
// //       return NextResponse.json(
// //         { error: "productId and price are required" },
// //         { status: 400 }
// //       );
// //     }

// //     const settings = await prisma.sampleSettings.upsert({
// //       where: { shop },
// //       update: {},
// //       create: {
// //         shop,
// //         enabled: true,
// //         pricingType: "CUSTOM",
// //       },
// //     });

// //     // Use empty string fallback for unique constraint
// //     const effectiveVariantId = variantId || "";

// //     const customPrice = await prisma.sampleProductPrice.upsert({
// //       where: {
// //         shop_productId_variantId: {
// //           shop,
// //           productId,
// //           variantId: effectiveVariantId,
// //         },
// //       },
// //       update: { price },
// //       create: {
// //         shop,
// //         productId,
// //         variantId: effectiveVariantId,
// //         price,
// //         settingsId: settings.id,
// //       },
// //     });

// //     return NextResponse.json({ success: true, data: customPrice });
// //   } catch (error) {
// //     console.error("CUSTOM_SETTINGS_POST", error);
// //     return NextResponse.json(
// //       { error: "Failed to save custom settings" },
// //       { status: 500 }
// //     );
// //   }
// // }
// import { NextResponse } from "next/server";
// import prisma from "@/lib/db/prisma-connect";

// export async function POST(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const shop = searchParams.get("shop");

//     if (!shop) {
//       return NextResponse.json({ error: "Missing shop" }, { status: 400 });
//     }

//     const body = await req.json();
//     const payload = body.data ?? body;

//     const { productId, variantId, customPrice, variants } = payload;

//     if (!productId || customPrice == null) {
//       return NextResponse.json(
//         { error: "productId and price required" },
//         { status: 400 }
//       );
//     }

//     const settings = await prisma.sampleSettings.upsert({
//       where: { shop },
//       update: {},
//       create: {
//         shop,
//         enabled: true,
//         pricingType: "CUSTOM",
//       },
//     });

//     /* ======================================
//        APPLY TO ALL VARIANTS
//     ====================================== */

//     if (!variantId && Array.isArray(variants)) {
//       await prisma.$transaction(
//         variants.map((v: any) =>
//           prisma.sampleProductPrice.upsert({
//             where: {
//               shop_productId_variantId: {
//                 shop,
//                 productId,
//                 variantId: v.id,
//               },
//             },
//             update: {
//               price: customPrice,
//             },
//             create: {
//               shop,
//               productId,
//               variantId: v.id,
//               price: customPrice,
//               settingsId: settings.id,
//             },
//           })
//         )
//       );

//       return NextResponse.json({ success: true });
//     }

//     /* ======================================
//        SINGLE VARIANT
//     ====================================== */

//     const result = await prisma.sampleProductPrice.upsert({
//       where: {
//         shop_productId_variantId: {
//           shop,
//           productId,
//           variantId,
//         },
//       },
//       update: {
//         price: customPrice,
//       },
//       create: {
//         shop,
//         productId,
//         variantId,
//         price: customPrice,
//         settingsId: settings.id,
//       },
//     });

//     return NextResponse.json({ success: true, data: result });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
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

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json({ error: "Missing shop" }, { status: 400 });
    }

    const body = await req.json();
    const payload = body.data ?? body;

    const {
      productId,
      variantId,
      customPrice,
      variants,
      title,
      image,
      pricingType,
      fixedPrice,
      percentageOff,
      settingsId,
    } = payload;

    const pricingData =
      pricingType === "FIXED"
        ? { fixedPrice, percentageOff: null }
        : pricingType === "PERCENTAGE"
          ? { percentageOff, fixedPrice: null }
          : { fixedPrice: null, percentageOff: null };

    if (!variantId && Array.isArray(variants)) {
      await prisma.$transaction(
        variants.map((v: any) => {
          const finalPrice = calculateFinalPrice(
            v.price ?? customPrice,
            pricingType,
            customPrice,
            fixedPrice,
            percentageOff,
          );

          // return prisma.sampleProductPrice.upsert({
          //   where: {
          //     shop_productId_variantId: {
          //       shop,
          //       productId,
          //       variantId: v.id,
          //     },
          //   },
          //   update: {
          //     price: finalPrice,
          //     ...pricingData,
          //   },
          //   create: {
          //     shop,
          //     productId,
          //     variantId: v.id,
          //     title,
          //     image,
          //     price: finalPrice,
          //     settingsId,
          //     ...pricingData,
          //   },
          // });
          return prisma.sampleProductPrice.upsert({
            where: {
              shop_productId_variantId: {
                shop,
                productId,
                variantId: v.id,
              },
            },
            update: {
              price: finalPrice,
              originalProductPrice: Number(v.price),
              ...pricingData,
            },
            create: {
              shop,
              productId,
              variantId: v.id,
              title,
              image,
              originalProductPrice: Number(v.price),
              price: finalPrice,
              ...pricingData,
              settings: {
                connect: {
                  shop,
                },
              },
            },
          });
        }),
      );

      return NextResponse.json({ success: true });
    }

    const finalPrice = calculateFinalPrice(
      customPrice,
      pricingType,
      customPrice,
      fixedPrice,
      percentageOff,
    );

    // const result = await prisma.sampleProductPrice.upsert({
    //   where: {
    //     shop_productId_variantId: {
    //       shop,
    //       productId,
    //       variantId,
    //     },
    //   },
    //   update: {
    //     price: finalPrice,
    //     ...pricingData,
    //   },
    //   create: {
    //     shop,
    //     productId,
    //     variantId,
    //     title,
    //     image,
    //     price: finalPrice,
    //     ...pricingData,
    //     settings: {
    //       connect: {
    //         shop,
    //       },
    //     },
    //   },
    // });
    const result = await prisma.sampleProductPrice.upsert({
      where: {
        shop_productId_variantId: {
          shop,
          productId,
          variantId,
        },
      },
      update: {
        price: finalPrice,
        originalProductPrice: Number(customPrice), 
        ...pricingData,
      },
      create: {
        shop,
        productId,
        variantId,
        title,
        image,
        originalProductPrice: Number(customPrice), 
        price: finalPrice,
        ...pricingData,
        settings: {
          connect: { shop },
        },
      },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    console.error("CUSTOM_SETTINGS_POST", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
