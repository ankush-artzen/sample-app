import prisma from "@/lib/db/prisma-connect";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { shop, ...ui } = body;

    if (!shop) {
      return NextResponse.json(
        { ok: false, message: "Missing shop" },
        { status: 400 }
      );
    }

    if (!Object.keys(ui).length) {
      return NextResponse.json(
        { ok: false, message: "No UI settings provided" },
        { status: 400 }
      );
    }

    await prisma.sampleSettings.upsert({
      where: { shop },
      update: {
        ui,
      },
      create: {
        shop,
        enabled: true,
        ui,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "UI settings saved successfully",
    });

  } catch (error) {
    console.error("UI save error:", error);

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}