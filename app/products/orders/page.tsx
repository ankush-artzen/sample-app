"use client";

import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Badge,
  Pagination,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function SampleOrdersPage() {
  const app = useAppBridge();
  const [shop, setShop] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!app) return;

    const shopFromConfig = (app as any)?.config?.shop;

    if (shopFromConfig) {
      setShop(shopFromConfig);
      setError(null);
    } else {
      setError("Unable to retrieve shop info. Please reload the app.");
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    if (!shop) return;

    setLoading(true);

    fetch(`/api/sample/orders?shop=${shop}&page=${page}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data);
        setTotalPages(data.pagination.totalPages);
        setLoading(false);
      });
  }, [shop, page]);

  // Extract store name from shop domain (e.g., "store-name.myshopify.com" -> "store-name")
  const getStoreName = (shopDomain: string) => {
    return shopDomain.replace(".myshopify.com", "");
  };

  return (
    <Page title="Sample Orders">
      <Layout>
        <Layout.Section>
          <Card>
            {loading ? (
              <SkeletonBodyText lines={6} />
            ) : (
              <>
                <IndexTable
                  resourceName={{ singular: "order", plural: "orders" }}
                  itemCount={orders.length}
                  selectable={false}
                  headings={[
                    { title: "Order ID" },
                    { title: "Email" },
                    { title: "Status" },
                    { title: "Created" },
                  ]}
                >
                  {orders.map((order, index) => (
                    <IndexTable.Row
                      id={order.id}
                      key={order.id}
                      position={index}
                    >
                      {/* ORDER LINK */}
                      <IndexTable.Cell>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();

                            // Get the store name from the shop domain
                            const storeName = getStoreName(shop);

                            window.open(
                              `https://admin.shopify.com/store/${storeName}/draft_orders/${order.draftOrderId}`,
                              "_blank",
                            );
                          }}
                          style={{
                            color: "#2563eb",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                        >
                          {order.draftOrderId || order.id.slice(-6)}
                        </a>
                      </IndexTable.Cell>

                      {/* EMAIL */}
                      <IndexTable.Cell>{order.email}</IndexTable.Cell>

                      <IndexTable.Cell>
                        <Badge
                          tone={order.isPurchased ? "success" : "attention"}
                        >
                          {order.isPurchased ? "COMPLETED" : "ABANDONED"}
                        </Badge>
                      </IndexTable.Cell>

                      {/* DATE */}
                      <IndexTable.Cell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>

                <div style={{ marginTop: 16 }}>
                  <Pagination
                    hasPrevious={page > 1}
                    hasNext={page < totalPages}
                    onPrevious={() => setPage((p) => p - 1)}
                    onNext={() => setPage((p) => p + 1)}
                  />
                </div>
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
