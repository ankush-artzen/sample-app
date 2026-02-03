import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";

// const SAVE_SAMPLE_SETTINGS = /* GraphQL */ `
//   mutation SaveSampleSettings($productId: ID!, $value: JSON!) {
//     metafieldsSet(
//       metafields: [{
//         ownerId: $productId
//         namespace: "sample"
//         key: "settings"
//         type: "json"
//         value: $value
//       }]
//     ) {
//       metafields {
//         id
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;
const SAVE_SAMPLE_SETTINGS = /* GraphQL */ `
  mutation SaveSampleSettings($productId: ID!, $value: String!) {
    metafieldsSet(
      metafields: [{
        ownerId: $productId
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
      productId,
      sampleProductId,
      enabled,
      limit,
      onePerCustomer,
    } = await req.json();

    if (!shop || !productId || !sampleProductId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ TRUST ONLY STORED SESSIONS
    const sessions = await findSessionsByShop(shop);

    if (!sessions.length) {
      return Response.json(
        { error: "Unauthorized shop" },
        { status: 401 }
      );
    }

    const client = new shopify.clients.Graphql({
      session: sessions[0], // first active session
    });

    const settings = {
      enabled,
      sampleProductId,
      limit: Number(limit) || 1,
      onePerCustomer,
    };

    const response = await client.request(SAVE_SAMPLE_SETTINGS, {
      variables: {
        productId: `gid://shopify/Product/${productId}`,
        value: JSON.stringify(settings),
      },
    });
    

    const userErrors =
      response?.data?.metafieldsSet?.userErrors || [];

    if (userErrors.length) {
      return Response.json(
        { error: userErrors[0].message },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      metafieldId:
        response.data.metafieldsSet.metafields[0].id,
    });

  } catch (error) {
    console.error("Save sample settings error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
