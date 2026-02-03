import shopify from "@/lib/shopify/initialize-context";
import { findSessionsByShop } from "@/lib/db/session-storage";

export const dynamic = "force-dynamic";

const GET_PRODUCTS_WITH_SAMPLE_SETTINGS = /* GraphQL */ `
  query GetProductsWithSampleSettings($cursor: String) {
    products(
      first: 50
      after: $cursor
      query: "metafield:sample.settings:*"
    ) {
      edges {
        cursor
        node {
          id
          title
          status
          metafield(namespace: "sample", key: "settings") {
            id
            value
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

/* ----------------------------------
   Type Definitions
----------------------------------- */
type SampleSettings = {
  enabled: boolean;
  sampleProductId: string;
  limit: number;
  onePerCustomer: boolean;
};

type ProductNode = {
  id: string;
  title: string;
  status: string;
  metafield: {
    id: string;
    value: string;
  } | null;
};

type ProductEdge = {
  cursor: string;
  node: ProductNode;
};

type ProductsQueryResponse = {
  products: {
    edges: ProductEdge[];
    pageInfo: {
      hasNextPage: boolean;
    };
  };
};

type ApiProduct = {
  id: string;
  title: string;
  status: string;
  settings: SampleSettings | null;
};


export async function GET(req: Request) {
  try {
    // ✅ Read from search params instead of body
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return Response.json(
        { error: "Shop is required" },
        { status: 400 }
      );
    }

    // ✅ Trust stored sessions only
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

    let products: ApiProduct[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await client.request<ProductsQueryResponse>(
        GET_PRODUCTS_WITH_SAMPLE_SETTINGS,
        {
          variables: { cursor },
        }
      );

      if (!response.data) {
        throw new Error("Shopify GraphQL response missing data");
      }

      const edges: ProductEdge[] =
        response.data.products.edges;

      products.push(
        ...edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          status: edge.node.status,
          settings: edge.node.metafield
            ? (JSON.parse(
                edge.node.metafield.value
              ) as SampleSettings)
            : null,
        }))
      );
    
  //   const filteredProducts: ApiProduct[] = edges
  //   .map((edge): ApiProduct | null => {
  //     if (!edge.node.metafield) return null;
  
  //     return {
  //       id: edge.node.id,
  //       title: edge.node.title,
  //       status: edge.node.status,
  //       settings: JSON.parse(
  //         edge.node.metafield.value
  //       ) as SampleSettings,
  //     };
  //   })
  //   .filter(
  //     (product): product is ApiProduct => product !== null
  //   );
  
  // products.push(...filteredProducts);
  

      hasNextPage =
        response.data.products.pageInfo.hasNextPage;

      cursor = edges.length
        ? edges[edges.length - 1].cursor
        : null;
    }

    return Response.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Fetch products with sample settings error:",
      error
    );

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
