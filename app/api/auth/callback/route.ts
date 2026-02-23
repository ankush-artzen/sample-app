import shopify from "@/lib/shopify/initialize-context";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json(
        { error: "Missing shop parameter" },
        { status: 400 }
      );
    }

    console.log("🔥 AUTH CALLBACK HIT FOR:", shop);

    // 🔐 Complete OAuth
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
    });

    const session = callbackResponse.session;

    if (!session) {
      return NextResponse.json(
        { error: "Session not created" },
        { status: 500 }
      );
    }

    console.log("✅ SESSION SAVED:", session.id);

    // Redirect to embedded app
    const redirectUrl = `/?shop=${shop}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ OAuth callback error:", error);
    return NextResponse.json(
      {
        error: "OAuth failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}