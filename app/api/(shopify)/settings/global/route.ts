import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";

// export async function POST(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const shop = searchParams.get("shop");

//     if (!shop) {
//       return NextResponse.json({ error: "Missing shop" }, { status: 400 });
//     }

//     const body = await req.json();
//     const {
//       enabled,
//       pricingType,
//       fixedPrice,
//       percentageOff,
//     } = body.data ?? body;

//     const settings = await prisma.sampleSettings.upsert({
//       where: { shop },
//       update: {
//         enabled,
//         pricingType,
//         fixedPrice,
//         percentageOff,
//       },
//       create: {
//         shop,
//         enabled: enabled ?? true,
//         pricingType: pricingType ?? "FREE",
//         fixedPrice,
//         percentageOff,
//       },
//     });

//     return NextResponse.json({ success: true, data: settings });
//   } catch (err) {
//     console.error("GLOBAL_SETTINGS_POST", err);
//     return NextResponse.json(
//       { error: "Failed to save global pricing settings" },
//       { status: 500 }
//     );
//   }
// }
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json({ error: "Missing shop" }, { status: 400 });
    }

    const body = await req.json();
    const { enabled, pricingType, fixedPrice, percentageOff } = body.data ?? body;

    const pricingData =
      pricingType === "FIXED"
        ? {
            fixedPrice,
            percentageOff: null,
          }
        : pricingType === "PERCENTAGE"
        ? {
            percentageOff,
            fixedPrice: null,
          }
        : {
            fixedPrice: null,
            percentageOff: null,
          };

    const settings = await prisma.sampleSettings.upsert({
      where: { shop },
      update: {
        enabled,
        pricingType,
        ...pricingData,
      },
      create: {
        shop,
        enabled: enabled ?? true,
        pricingType: pricingType ?? "FREE",
        ...pricingData,
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    console.error("GLOBAL_SETTINGS_POST", err);
    return NextResponse.json(
      { error: "Failed to save global pricing settings" },
      { status: 500 }
    );
  }
}
