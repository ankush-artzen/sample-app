import { findSessionsByShop } from "@/lib/db/session-storage";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { shop } = await req.json();

  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  const sessions = await findSessionsByShop(shop);
  const session = sessions?.[0];

  if (!session) {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }

  // ✅ THIS IS THE IMPORTANT FIX
  if (!session.accessToken) {
    return NextResponse.json(
      { error: "Session missing access token" },
      { status: 401 },
    );
  }

  const res = await fetch(
    `https://${shop}/admin/api/2026-01/script_tags.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script_tag: {
          event: "onload",
          src: "https://sample-app-two-sandy.vercel.app/sample-app.js",
        },
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
