import { NextResponse } from "next/server";

/* -----------------------------
   SIMPLE CORS HELPER
------------------------------ */
function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }));
}

/* -----------------------------
   GET → CONFIG
------------------------------ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  console.log("🟢 [API] GET action:", action);

  if (action !== "config") {
    return cors(
      NextResponse.json({ ok: false, message: "Invalid action" }, { status: 400 })
    );
  }

  return cors(
    NextResponse.json({
      ok: true,

      store: {
        quantity: 2,
        type: "fixed", // fixed | percentage
        amount: 49
      },

      ui: {
        buttonText: "GET SAMPLE",
        cartText: "Sample Cart",
        buttonBg: "#000",
        buttonColor: "#fff"
      }
    })
  );
}

/* -----------------------------
   POST → CUSTOMER / CHECKOUT
------------------------------ */
export async function POST(req: Request) {
  const body = await req.json();
  console.log("🟢 [API] POST body:", body);

  /* ---- CUSTOMER ---- */
  if (body.action === "customer") {
    if (!body.name || !body.email) {
      return cors(
        NextResponse.json({
          ok: false,
          message: "Name & Email required"
        })
      );
    }

    return cors(
      NextResponse.json({
        ok: true,
        customerId: "cust_" + Date.now()
      })
    );
  }

  /* ---- CHECKOUT ---- */
  if (body.action === "checkout") {
    if (!body.cart || body.cart.length === 0) {
      return cors(
        NextResponse.json({ ok: false, message: "Cart empty" })
      );
    }

    return cors(
      NextResponse.json({
        ok: true,
        redirect: `https://${body.store}/checkout`
      })
    );
  }

  return cors(
    NextResponse.json({ ok: false, message: "Invalid action" })
  );
}
