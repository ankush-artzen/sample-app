// import shopify from "@/lib/shopify/initialize-context";
// import { findSessionsByShop } from "@/lib/db/session-storage";
// import { NextResponse } from "next/server";

// /* ---------------- HELPERS ---------------- */
// function isValidShop(shop: string) {
//   return shop.endsWith(".myshopify.com");
// }

// function getCorsHeaders(origin: string | null): Record<string, string> {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//   };

//   if (!origin) return headers;

//   // Allow requests from any Shopify domain
//   if (origin.endsWith(".myshopify.com") || origin.includes("shopify.com")) {
//     headers["Access-Control-Allow-Origin"] = origin;
//     headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
//     headers["Access-Control-Allow-Headers"] = "Content-Type, Accept";
//     headers["Access-Control-Allow-Credentials"] = "true";
//   }

//   return headers;
// }

// /* ---------------- OPTIONS (Preflight) ---------------- */
// export async function OPTIONS(req: Request) {
//   const origin = req.headers.get("origin");
//   const headers = getCorsHeaders(origin);

//   return new NextResponse(null, {
//     status: 204,
//     headers,
//   });
// }

// /* ---------------- POST ---------------- */
// export async function POST(req: Request) {
//   const origin = req.headers.get("origin");
//   const corsHeaders = getCorsHeaders(origin);

//   try {
//     // Extract shop from origin
//     let shop: string | null = null;

//     if (origin) {
//       try {
//         const originUrl = new URL(origin);
//         shop = originUrl.hostname;
//       } catch {
//         // If origin parsing fails, try to get shop from Referer header
//         const referer = req.headers.get("Referer");
//         if (referer) {
//           try {
//             const refererUrl = new URL(referer);
//             shop = refererUrl.hostname;
//           } catch {}
//         }
//       }
//     }

//     console.log("Detected shop:", shop);

//     if (!shop || !isValidShop(shop)) {
//       console.error("Invalid shop domain:", shop);
//       return NextResponse.json(
//         { error: "Invalid shop domain. Must end with .myshopify.com" },
//         { status: 400, headers: corsHeaders },
//       );
//     }

//     /* ---------------- BODY ---------------- */
//     const body = await req.json();
//     console.log("Request body:", body);

//     // ACCEPT SINGLE VARIANT OR ARRAY OF VARIANTS
//     const { variantId, variantIds, customerEmail } = body as {
//       variantId?: number;
//       variantIds?: number[]; // NEW: Accept array of variant IDs
//       customerEmail?: string;
//     };

//     // Validate input
//     if (!variantId && (!variantIds || variantIds.length === 0)) {
//       console.error("Missing variantId or variantIds in request body");
//       return NextResponse.json(
//         { error: "Missing variantId or variantIds" },
//         { status: 400, headers: corsHeaders },
//       );
//     }

//     // Create array of variant IDs (support both single and multiple)
//     let variantIdArray: number[] = [];
//     if (variantId) {
//       variantIdArray = [Number(variantId)];
//     } else if (variantIds && variantIds.length > 0) {
//       variantIdArray = variantIds.map((id) => Number(id));
//     }

//     console.log("Processing variants:", variantIdArray);

//     /* ---------------- LOAD SESSION ---------------- */
//     console.log("Looking for sessions for shop:", shop);
//     const sessions = await findSessionsByShop(shop);

//     if (!sessions || sessions.length === 0) {
//       console.error("No sessions found for shop:", shop);
//       return NextResponse.json(
//         { error: "No active session found. Please re-install the app." },
//         { status: 401, headers: corsHeaders },
//       );
//     }

//     const session = sessions[0];
//     console.log("Found session ID:", session.id);

//     // Check if session is valid and has required scopes
//     if (!session.accessToken) {
//       console.error("Session has no access token");
//       return NextResponse.json(
//         { error: "Invalid session - missing access token" },
//         { status: 401, headers: corsHeaders },
//       );
//     }

//     /* ---------------- SHOPIFY CLIENT ---------------- */
//     const client = new shopify.clients.Rest({
//       session,
//       apiVersion: shopify.config.apiVersion,
//     });

//     console.log(`Creating draft order with ${variantIdArray.length} items`);

//     // Prepare line items with 100% discount for each variant
//     const lineItems = variantIdArray.map((variantId) => ({
//       variant_id: variantId,
//       quantity: 1,
//       applied_discount: {
//         description: "Sample Discount (90%)",
//         value_type: "percentage",
//         value: "90",
//       },
//     }));

//     const response = await client.post({
//       path: "draft_orders",
//       data: {
//         draft_order: {
//           line_items: lineItems,
//           note: "Sample order - " + variantIdArray.length + " items",
//           tags: "sample",
//           email: customerEmail,
//           use_customer_default_address: true,
//         },
//       },
//     });

//     console.log("Draft order created:", response.body);

//     const draftOrder = response.body.draft_order;

//     if (!draftOrder.invoice_url) {
//       throw new Error("No invoice URL returned from Shopify");
//     }

//     return NextResponse.json(
//       {
//         checkoutUrl: draftOrder.invoice_url,
//         draftOrderId: draftOrder.id,
//         itemCount: variantIdArray.length, // Return count for verification
//       },
//       { status: 200, headers: corsHeaders },
//     );
//   } catch (error: any) {
//     console.error("Draft order creation failed:", error);

//     // Log more details about Shopify API errors
//     if (error.response) {
//       console.error("Shopify API Response:", error.response.body);
//       console.error("Shopify API Status:", error.response.statusCode);
//     }

//     const errorMessage = error.message || "Failed to create draft order";

//     return NextResponse.json(
//       {
//         error: errorMessage,
//         details: error.response?.body || undefined,
//       },
//       { status: 500, headers: corsHeaders },
//     );
//   }
// }

import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";
const SAMPLE_LIMIT = 10;

function isValidShop(shop: string) {
  return shop.endsWith(".myshopify.com");
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!origin) return headers;

  // Allow Shopify storefront + admin
  if (origin.endsWith(".myshopify.com") || origin.includes("shopify.com")) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] =
      "Content-Type, Accept, Authorization";
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

/* ---------------- OPTIONS (Preflight) ---------------- */
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  return new NextResponse(null, {
    status: 204,
    headers,
  });
}

/* ---------------- POST ---------------- */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    /* ---------------- DETECT SHOP ---------------- */
    let shop: string | null = null;

    if (origin) {
      try {
        shop = new URL(origin).hostname;
      } catch {}
    }

    if (!shop) {
      const referer = req.headers.get("referer");
      if (referer) {
        try {
          shop = new URL(referer).hostname;
        } catch {}
      }
    }

    console.log("Detected shop:", shop);

    if (!shop || !isValidShop(shop)) {
      return NextResponse.json(
        { error: "Invalid shop domain" },
        { status: 400, headers: corsHeaders },
      );
    }

    /* ---------------- BODY ---------------- */
    const body = await req.json();

    const { variantId, variantIds, customerEmail } = body as {
      variantId?: number;
      variantIds?: number[];
      customerEmail?: string;
    };

    if (!variantId && (!variantIds || variantIds.length === 0)) {
      return NextResponse.json(
        { error: "Missing variantId or variantIds" },
        { status: 400, headers: corsHeaders },
      );
    }

    const variantIdArray = variantId
      ? [Number(variantId)]
      : variantIds!.map((id) => Number(id));
    /* ---------------- PRISMA: CUSTOMER CHECK ---------------- */

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing customer email" },
        { status: 400, headers: corsHeaders },
      );
    }

    const existingCustomer = await prisma.sampleCustomer.findUnique({
      where: {
        shop_email: {
          shop,
          email: customerEmail,
        },
      },
    });

    if (existingCustomer?.blocked) {
      return NextResponse.json(
        { error: "Customer is blocked from ordering samples" },
        { status: 403, headers: corsHeaders },
      );
    }

    const currentTotal = existingCustomer?.totalSamples || 0;
    const requestedCount = variantIdArray.length;

    if (currentTotal + requestedCount > SAMPLE_LIMIT) {
      return NextResponse.json(
        {
          error: "Sample limit reached",
          remaining: Math.max(0, SAMPLE_LIMIT - currentTotal),
        },
        { status: 403, headers: corsHeaders },
      );
    }

    /* ---------------- LOAD SESSION ---------------- */
    const sessions = await findSessionsByShop(shop);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: "No active session found. Reinstall the app." },
        { status: 401, headers: corsHeaders },
      );
    }

    const session = sessions[0];

    if (!session.accessToken) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401, headers: corsHeaders },
      );
    }

    /* ---------------- SHOPIFY CLIENT ---------------- */
    const client = new shopify.clients.Rest({
      session,
      apiVersion: shopify.config.apiVersion,
    });

    const lineItems = variantIdArray.map((id) => ({
      variant_id: id,
      quantity: 1,
      applied_discount: {
        description: "Sample Discount (90%)",
        value_type: "percentage",
        value: "90",
      },
    }));

    const response = await client.post({
      path: "draft_orders",
      data: {
        draft_order: {
          line_items: lineItems,
          tags: "sample",
          note: `Sample order (${variantIdArray.length} items)`,
          email: customerEmail,
          use_customer_default_address: true,
        },
      },
    });

    const draftOrder = response.body.draft_order;
    /* ---------------- PRISMA: SAVE ORDER ---------------- */

    await prisma.$transaction(async (tx) => {
      const customer =
        existingCustomer ??
        (await tx.sampleCustomer.create({
          data: {
            shop,
            email: customerEmail,
          },
        }));

      await tx.sampleCustomer.update({
        where: { id: customer.id },
        data: {
          totalSamples: currentTotal + requestedCount,
        },
      });

      await tx.sampleOrder.create({
        data: {
          shop,
          email: customerEmail,
          variantIds: variantIdArray,
          sampleCount: requestedCount,

          draftOrderId: String(draftOrder.id),
          // invoiceUrl: draftOrder.invoice_url,
          customerId: customer.id,
        },
      });
    });

    if (!draftOrder?.invoice_url) {
      throw new Error("Draft order invoice URL missing");
    }

    return NextResponse.json(
      {
        checkoutUrl: draftOrder.invoice_url,
        draftOrderId: draftOrder.id,
        itemCount: requestedCount, // computed, not DB
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error: any) {
    console.error("Draft order error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to create draft order",
        details: error.response?.body,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
