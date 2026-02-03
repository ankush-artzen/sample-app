import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma-connect";
// import { SAMPLE_LIMIT } from "@/lib/sample-constants";
function getCorsHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
  
    if (!origin) return headers;
  
    // Allow requests from any Shopify domain
    if (origin.endsWith(".myshopify.com") || origin.includes("shopify.com")) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
      headers["Access-Control-Allow-Headers"] = "Content-Type, Accept";
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
const SAMPLE_LIMIT = 5

export async function GET(req: Request) {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);
  
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
  
    if (!email || !origin) {
      return NextResponse.json(
        { allowed: false },
        { status: 400, headers: corsHeaders }
      );
    }
  
    const shop = new URL(origin).hostname;
  
    const customer = await prisma.sampleCustomer.findUnique({
      where: { shop_email: { shop, email } },
    });
  
    if (!customer) {
      return NextResponse.json(
        { allowed: true, remaining: SAMPLE_LIMIT },
        { headers: corsHeaders }
      );
    }
  
    if (customer.blocked) {
      return NextResponse.json(
        { allowed: false, reason: "BLOCKED" },
        { headers: corsHeaders }
      );
    }
  
    if (customer.totalSamples >= SAMPLE_LIMIT) {
      return NextResponse.json(
        { allowed: false, reason: "LIMIT_REACHED" },
        { headers: corsHeaders }
      );
    }
  
    return NextResponse.json(
      {
        allowed: true,
        remaining: SAMPLE_LIMIT - customer.totalSamples,
      },
      { headers: corsHeaders }
    );
  }
  