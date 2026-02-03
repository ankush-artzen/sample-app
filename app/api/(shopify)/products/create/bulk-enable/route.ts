import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";

const SAVE_SHOP_SETTINGS = /* GraphQL */ `
  mutation SaveShopSettings($shopId: ID!, $value: String!) {
    metafieldsSet(
      metafields: [{
        ownerId: $shopId
        namespace: "sample"
        key: "settings"
        type: "json"
        value: $value
      }]
    ) {
      metafields {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const {
      shop,
      enabled,
      limit,
      onePerCustomer,
    } = await req.json();

    if (!shop) {
      return Response.json(
        { error: "Missing shop" },
        { status: 400 }
      );
    }

    const sessions = await findSessionsByShop(shop);
    if (!sessions.length) {
      return Response.json(
        { error: "Unauthorized shop" },
        { status: 401 }
      );
    }

    const client = new shopify.clients.Graphql({
      session: sessions[0],
    });

    // Fetch shop GID
    const shopRes = await client.request(`
      query {
        shop { id }
      }
    `);

    // Same settings structure as your product API
    const settings = {
      enabled: Boolean(enabled),
      limit: Number(limit) || 1,
      onePerCustomer: Boolean(onePerCustomer),
      // Note: No sampleProductId for global settings since it applies to all products
      // This is consistent - global settings enable/disable the feature for all products
      // but don't specify a specific sample product
    };

    const response = await client.request(SAVE_SHOP_SETTINGS, {
      variables: {
        shopId: shopRes.data.shop.id,
        value: JSON.stringify(settings),
      },
    });

    const errors = response.data.metafieldsSet.userErrors;
    if (errors.length) {
      return Response.json(
        { error: errors[0].message },
        { status: 400 }
      );
    }

    return Response.json({ 
      success: true,
      settings: settings // Return the saved settings for confirmation
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}