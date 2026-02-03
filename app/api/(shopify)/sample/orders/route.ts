import prisma from "@/lib/db/prisma-connect";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return NextResponse.json([]);

  const shop = new URL(origin).hostname;

  const orders = await prisma.sampleOrder.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
