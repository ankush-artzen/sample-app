import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";
const DELETE_SAMPLE_SETTINGS = /* GraphQL */ `
  mutation DeleteSampleSettings($ownerId: ID!) {
    metafieldDelete(
      input: { ownerId: $ownerId, namespace: "sample", key: "settings" }
    ) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { shop, productId } = await req.json();

    if (!shop || !productId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // ✅ TRUST ONLY STORED SESSIONS
    const sessions = await findSessionsByShop(shop);

    if (!sessions.length) {
      return Response.json({ error: "Unauthorized shop" }, { status: 401 });
    }

    const client = new shopify.clients.Graphql({
      session: sessions[0],
    });

    const response = await client.request(DELETE_SAMPLE_SETTINGS, {
      variables: {
        ownerId: `gid://shopify/Product/${productId}`,
      },
    });

    const userErrors = response?.data?.metafieldDelete?.userErrors || [];

    if (userErrors.length) {
      return Response.json({ error: userErrors[0].message }, { status: 400 });
    }

    return Response.json({
      success: true,
      deletedId: response.data.metafieldDelete.deletedId,
    });
  } catch (error) {
    console.error("Delete sample settings error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
