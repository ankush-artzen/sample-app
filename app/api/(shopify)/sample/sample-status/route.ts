// import prisma from "@/lib/db/prisma-connect";

// /* ---------------- CORS ---------------- */
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET,OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type",
// };

// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: corsHeaders,
//   });
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const shop = searchParams.get("shop");

//     if (!shop) {
//       return new Response(JSON.stringify({ enabled: false }), {
//         headers: corsHeaders,
//       });
//     }

//     const sample = await prisma.sampleSettings.findUnique({
//       where: {
//         shop,
//       },
//     });

//     return new Response(
//       JSON.stringify({
//         enabled: Boolean(sample?.enabled),
//       }),
//       { headers: corsHeaders },
//     );
//   } catch (error) {
//     console.error("Sample status error:", error);

//     return new Response(JSON.stringify({ enabled: false }), {
//       headers: corsHeaders,
//     });
//   }
// }
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";
import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const shop = searchParams.get("shop");
    const type = searchParams.get("type");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search");

    if (!shop) {
      return NextResponse.json({ error: "Missing shop" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const sessions = await findSessionsByShop(shop);
    if (!sessions?.length) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 },
      );
    }

    const client = new shopify.clients.Rest({
      session: sessions[0],
      apiVersion: shopify.config.apiVersion,
    });

    const where: any = {
      shop,
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { draftOrderId: { contains: search } },
        ],
      }),
    };

    const orders = await prisma.sampleOrder.findMany({
      where,
      include: { customer: true },
    });

    for (const order of orders) {
      if (!order.isPurchased) {
        try {
          const draft = await client.get({
            path: `draft_orders/${order.draftOrderId}`,
          });

          const completedAt = draft.body.draft_order.completed_at;

          if (completedAt) {
            await prisma.sampleOrder.update({
              where: { id: order.id },
              data: { isPurchased: true },
            });

            order.isPurchased = true;
          }
        } catch (err) {
          console.log("Draft fetch failed:", err);
        }
      }
    }

    const filtered =
      type === "completed"
        ? orders.filter((o) => o.isPurchased)
        : orders.filter((o) => !o.isPurchased);

    const totalCount = filtered.length;
    const paginated = filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    return NextResponse.json({
      status: true,
      data: paginated,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error: any) {
    console.error("Error fetching sample orders:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
