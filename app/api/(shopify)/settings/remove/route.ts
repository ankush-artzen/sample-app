// import shopify from "@/lib/shopify/initialize-context";
// import { findSessionsByShop } from "@/lib/db/session-storage";

// const DELETE_METAFIELDS = /* GraphQL */ `
//   mutation DeleteMetafields($ids: [ID!]!) {
//     metafieldsDelete(
//       metafieldIds: $ids
//     ) {
//       deletedMetafieldIds
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;

// // We need to fetch metafields differently - by querying products and their metafields
// const GET_PRODUCTS_WITH_METAFIELDS = /* GraphQL */ `
//   query GetProductsWithMetafields($first: Int!) {
//     products(first: $first) {
//       edges {
//         node {
//           id
//           title
//           metafield(namespace: "sample", key: "settings") {
//             id
//             value
//           }
//         }
//       }
//     }
//   }
// `;

// const GET_SHOP_METAFIELD = /* GraphQL */ `
//   query GetShopMetafield {
//     shop {
//       metafield(namespace: "sample", key: "settings") {
//         id
//         value
//       }
//     }
//   }
// `;

// export async function POST(req: Request) {
//   try {
//     const { shop } = await req.json();

//     if (!shop) {
//       return Response.json(
//         { error: "Missing shop" },
//         { status: 400 }
//       );
//     }

//     const sessions = await findSessionsByShop(shop);
//     if (!sessions.length) {
//       return Response.json(
//         { error: "Unauthorized shop" },
//         { status: 401 }
//       );
//     }

//     const client = new shopify.clients.Graphql({
//       session: sessions[0],
//     });

//     const metafieldIds: string[] = [];

//     // 1. Get shop metafield
//     try {
//       const shopResponse = await client.request(GET_SHOP_METAFIELD);
//       const shopMetafield = shopResponse.data.shop.metafield;
//       if (shopMetafield?.id) {
//         metafieldIds.push(shopMetafield.id);
//       }
//     } catch (error) {
//       console.log("No shop metafield found or error:", error);
//     }

//     // 2. Get product metafields
//     try {
//       const productsResponse = await client.request(GET_PRODUCTS_WITH_METAFIELDS, {
//         variables: {
//           first: 100, // Adjust based on your needs
//         },
//       });

//       const products = productsResponse.data.products.edges;
      
//       for (const edge of products) {
//         const product = edge.node;
//         if (product.metafield?.id) {
//           metafieldIds.push(product.metafield.id);
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching product metafields:", error);
//     }

//     if (metafieldIds.length === 0) {
//       return Response.json({ 
//         success: true,
//         message: "No sample settings metafields found",
//         deletedCount: 0
//       });
//     }

//     // 3. Delete the metafields (in batches if needed)
//     // Shopify might have limits on batch size, so we'll do them one by one or in small batches
//     const deletedMetafieldIds: string[] = [];
//     const userErrors: any[] = [];

//     for (const metafieldId of metafieldIds) {
//       try {
//         const deleteResponse = await client.request(DELETE_METAFIELDS, {
//           variables: {
//             ids: [metafieldId],
//           },
//         });

//         const errors = deleteResponse.data.metafieldsDelete.userErrors;
//         if (errors.length) {
//           userErrors.push(...errors);
//           console.error("Error deleting metafield:", errors);
//         } else {
//           const deletedIds = deleteResponse.data.metafieldsDelete.deletedMetafieldIds;
//           if (deletedIds?.length) {
//             deletedMetafieldIds.push(...deletedIds);
//           }
//         }
//       } catch (error) {
//         console.error("Error deleting metafield:", error);
//         userErrors.push({ message: `Failed to delete metafield ${metafieldId}` });
//       }
//     }

//     if (userErrors.length > 0) {
//       return Response.json(
//         { 
//           success: false,
//           error: `Failed to delete some metafields. ${userErrors.length} errors occurred.`,
//           deletedCount: deletedMetafieldIds.length,
//           totalErrors: userErrors.length,
//           errors: userErrors.slice(0, 5) // Return first 5 errors
//         },
//         { status: 400 }
//       );
//     }

//     return Response.json({ 
//       success: true,
//       deletedCount: deletedMetafieldIds.length,
//       deletedMetafieldIds
//     });

//   } catch (err) {
//     console.error(err);
//     return Response.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // GET endpoint to preview what will be deleted
// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const shop = searchParams.get('shop');

//     if (!shop) {
//       return Response.json(
//         { error: "Missing shop" },
//         { status: 400 }
//       );
//     }

//     const sessions = await findSessionsByShop(shop);
//     if (!sessions.length) {
//       return Response.json(
//         { error: "Unauthorized shop" },
//         { status: 401 }
//       );
//     }

//     const client = new shopify.clients.Graphql({
//       session: sessions[0],
//     });

//     const metafields: any[] = [];

//     // 1. Get shop metafield
//     try {
//       const shopResponse = await client.request(GET_SHOP_METAFIELD);
//       const shopMetafield = shopResponse.data.shop.metafield;
//       if (shopMetafield?.id) {
//         metafields.push({
//           id: shopMetafield.id,
//           ownerType: 'SHOP',
//           ownerId: 'shop',
//           ownerTitle: 'Shop Settings',
//           value: shopMetafield.value ? JSON.parse(shopMetafield.value) : null,
//         });
//       }
//     } catch (error) {
//       console.log("No shop metafield found or error:", error);
//     }

//     // 2. Get product metafields
//     try {
//       const productsResponse = await client.request(GET_PRODUCTS_WITH_METAFIELDS, {
//         variables: {
//           first: 100,
//         },
//       });

//       const products = productsResponse.data.products.edges;
      
//       for (const edge of products) {
//         const product = edge.node;
//         if (product.metafield?.id) {
//           metafields.push({
//             id: product.metafield.id,
//             ownerType: 'PRODUCT',
//             ownerId: product.id,
//             ownerTitle: product.title,
//             value: product.metafield.value ? JSON.parse(product.metafield.value) : null,
//           });
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching product metafields:", error);
//     }

//     return Response.json({ 
//       metafields,
//       count: metafields.length,
//       warning: "This is a preview. No metafields will be deleted by this GET request."
//     });

//   } catch (err) {
//     console.error(err);
//     return Response.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";

const DELETE_METAFIELDS = /* GraphQL */ `
  mutation DeleteMetafields($ids: [ID!]!) {
    metafieldsDelete(
      metafieldIds: $ids
    ) {
      deletedMetafieldIds
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_PRODUCTS_WITH_METAFIELDS = /* GraphQL */ `
  query GetProductsWithMetafields($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          metafield(namespace: "sample", key: "settings") {
            id
            value
          }
        }
      }
    }
  }
`;

const GET_SHOP_METAFIELD = /* GraphQL */ `
  query GetShopMetafield {
    shop {
      metafield(namespace: "sample", key: "settings") {
        id
        value
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { shop } = await req.json();

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

    const metafieldIds: string[] = [];

    // 1. Get shop metafield
    try {
      const shopResponse = await client.request(GET_SHOP_METAFIELD);
      const shopMetafield = shopResponse.data.shop.metafield;
      if (shopMetafield?.id) {
        metafieldIds.push(shopMetafield.id);
        console.log(`Found shop metafield: ${shopMetafield.id}`);
      }
    } catch (error) {
      console.log("No shop metafield found or error:", error);
    }

    // 2. Get product metafields
    try {
      const productsResponse = await client.request(GET_PRODUCTS_WITH_METAFIELDS, {
        variables: {
          first: 100, // Adjust based on your needs
        },
      });

      const products = productsResponse.data.products.edges;
      console.log(`Found ${products.length} products to check`);
      
      for (const edge of products) {
        const product = edge.node;
        if (product.metafield?.id) {
          metafieldIds.push(product.metafield.id);
          console.log(`Found product metafield for ${product.title}: ${product.metafield.id}`);
        }
      }
    } catch (error) {
      console.log("Error fetching product metafields:", error);
    }

    console.log(`Total metafields to delete: ${metafieldIds.length}`);

    if (metafieldIds.length === 0) {
      return Response.json({ 
        success: true,
        message: "No sample settings metafields found",
        deletedCount: 0
      });
    }

    // 3. Delete the metafields - Shopify allows up to 25 IDs per request
    const deletedMetafieldIds: string[] = [];
    const userErrors: any[] = [];

    // Split into batches of 25 (Shopify's limit)
    const batchSize = 25;
    for (let i = 0; i < metafieldIds.length; i += batchSize) {
      const batch = metafieldIds.slice(i, i + batchSize);
      console.log(`Deleting batch ${i/batchSize + 1} with ${batch.length} metafields`);
      
      try {
        const deleteResponse = await client.request(DELETE_METAFIELDS, {
          variables: {
            ids: batch,
          },
        });

        const errors = deleteResponse.data.metafieldsDelete.userErrors;
        if (errors.length) {
          userErrors.push(...errors);
          console.error(`Error deleting batch ${i/batchSize + 1}:`, errors);
        } else {
          const deletedIds = deleteResponse.data.metafieldsDelete.deletedMetafieldIds;
          if (deletedIds?.length) {
            deletedMetafieldIds.push(...deletedIds);
            console.log(`Successfully deleted ${deletedIds.length} metafields in batch ${i/batchSize + 1}`);
          }
        }
      } catch (error: any) {
        console.error(`Error deleting batch ${i/batchSize + 1}:`, error.message || error);
        userErrors.push({ 
          message: `Failed to delete batch ${i/batchSize + 1}: ${error.message || 'Unknown error'}` 
        });
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < metafieldIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Total deleted: ${deletedMetafieldIds.length}, Errors: ${userErrors.length}`);

    if (userErrors.length > 0) {
      return Response.json(
        { 
          success: false,
          error: `Failed to delete some metafields. ${userErrors.length} errors occurred.`,
          deletedCount: deletedMetafieldIds.length,
          totalErrors: userErrors.length,
          errors: userErrors.slice(0, 5) // Return first 5 errors
        },
        { status: 400 }
      );
    }

    return Response.json({ 
      success: true,
      deletedCount: deletedMetafieldIds.length,
      deletedMetafieldIds,
      message: `Successfully removed ${deletedMetafieldIds.length} sample settings metafields`
    });

  } catch (err: any) {
    console.error("Global error in POST:", err);
    return Response.json(
      { error: `Internal server error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what will be deleted
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');

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

    const metafields: any[] = [];

    // 1. Get shop metafield
    try {
      const shopResponse = await client.request(GET_SHOP_METAFIELD);
      const shopMetafield = shopResponse.data.shop.metafield;
      if (shopMetafield?.id) {
        metafields.push({
          id: shopMetafield.id,
          ownerType: 'SHOP',
          ownerId: 'shop',
          ownerTitle: 'Shop Settings',
          value: shopMetafield.value ? JSON.parse(shopMetafield.value) : null,
        });
      }
    } catch (error) {
      console.log("No shop metafield found or error:", error);
    }

    // 2. Get product metafields
    try {
      const productsResponse = await client.request(GET_PRODUCTS_WITH_METAFIELDS, {
        variables: {
          first: 100,
        },
      });

      const products = productsResponse.data.products.edges;
      
      for (const edge of products) {
        const product = edge.node;
        if (product.metafield?.id) {
          metafields.push({
            id: product.metafield.id,
            ownerType: 'PRODUCT',
            ownerId: product.id,
            ownerTitle: product.title,
            value: product.metafield.value ? JSON.parse(product.metafield.value) : null,
          });
        }
      }
    } catch (error) {
      console.log("Error fetching product metafields:", error);
    }

    return Response.json({ 
      metafields,
      count: metafields.length,
      warning: "This is a preview. No metafields will be deleted by this GET request."
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}