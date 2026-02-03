import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json(
      { error: "Shop is required" },
      { status: 400 }
    );
  }

  const customers = await prisma.sampleCustomer.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}
