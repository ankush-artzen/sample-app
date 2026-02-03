import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";

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

const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          metafield(namespace: "sample", key: "settings") {
            value
          }
        }
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

    // 1. Get all products
    const productsResponse = await client.request(GET_PRODUCTS, {
      variables: {
        first: 100, // Adjust based on your needs
      },
    });

    const products = productsResponse.data.products.edges;
    const updatedProducts = [];
    
    // 2. Apply settings to products without existing settings
    for (const edge of products) {
      const product = edge.node;
      
      // Only apply if product doesn't have existing settings
      if (!product.metafield || !product.metafield.value) {
        const settings = {
          enabled,
          sampleProductId: product.id.split("/").pop(), // Use product as its own sample
          limit: Number(limit) || 1,
          onePerCustomer: Boolean(onePerCustomer),
        };

        await client.request(SAVE_SAMPLE_SETTINGS, {
          variables: {
            productId: product.id,
            value: JSON.stringify(settings),
          },
        });
        
        updatedProducts.push(product.id);
      }
    }

    return Response.json({ 
      success: true,
      updatedCount: updatedProducts.length,
      updatedProducts
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}