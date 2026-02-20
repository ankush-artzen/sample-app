// "use client";

// import {
//   Page,
//   Layout,
//   Card,
//   Text,
//   Spinner,
//   InlineGrid,
//   Badge,
//   BlockStack,
//   DataTable,
// } from "@shopify/polaris";
// import { useEffect, useState } from "react";
// import { useAppBridge } from "@shopify/app-bridge-react";

// export default function SampleAnalytics() {
//   const app = useAppBridge();
//   const [shop, setShop] = useState<string>("");

//   const [loading, setLoading] = useState(true);

//   const [stats, setStats] = useState({
//     abandoned: 0,
//     completed: 0,
//     totalCustomers: 0,
//     topCustomers: [] as any[],
//     topProducts: [] as any[],
//   });

//   /* ---------------- GET SHOP ---------------- */
//   useEffect(() => {
//     if (!app) return;

//     const shopFromConfig = (app as any)?.config?.shop;

//     if (shopFromConfig) {
//       setShop(shopFromConfig);
//     } else if (typeof window !== "undefined") {
//       setShop(window.location.hostname);
//     }
//   }, [app]);

//   /* ---------------- FETCH ANALYTICS ---------------- */
//   useEffect(() => {
//     if (!shop) return;

//     fetch(`/api/sample/sample-status/count?shop=${shop}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setStats(data);
//         setLoading(false);
//       });
//   }, [shop]);

//   return (
//     <Page
//       title="Sample Checkout Analytics"
//       subtitle="Track abandoned checkouts, completed orders, and top customers."
//     >
//       <Layout>
//         {/* ---------------- SUMMARY CARDS ---------------- */}
//         <Layout.Section>
//           {loading ? (
//             <Spinner />
//           ) : (
//             <InlineGrid columns={3} gap="400">
//               <Card>
//                 <BlockStack gap="200" inlineAlign="center">
//                   <Text variant="headingMd" as="h3">
//                     Abandoned Checkouts
//                   </Text>

//                   <Text tone="subdued" as="p" alignment="center">
//                     Customers started checkout but didn’t complete.
//                   </Text>

//                   <Text variant="heading2xl" tone="critical" as="p">
//                     {stats.abandoned}
//                   </Text>

//                   <Badge tone="info">Number of Abandoned Checkouts</Badge>
//                 </BlockStack>
//               </Card>

//               <Card padding="400">
//                 <BlockStack gap="200" inlineAlign="center">
//                   <Text variant="headingMd" as="h3">
//                     Completed Samples
//                   </Text>
//                   <Text tone="subdued" as="p" alignment="center">
//                     Number of orders created by the app when customers complete
//                     checkout after adding sample products.
//                   </Text>
//                   <Text variant="heading2xl" tone="critical" as="p">
//                     {stats.completed}
//                   </Text>
//                   <Badge tone="attention">Number of Completed Samples</Badge>
//                 </BlockStack>
//               </Card>

//               <Card padding="400">
//                 <BlockStack gap="200" inlineAlign="center">
//                   <Text variant="headingMd" as="h3">
//                     Total Customers
//                   </Text>
//                   <Text tone="subdued" as="p" alignment="center">
//                     Number of users who interacted with the app.
//                   </Text>
//                   <Text variant="heading2xl" as="p">
//                     {stats.totalCustomers}
//                   </Text>
//                   <Badge tone="success">All sample users</Badge>

//                 </BlockStack>
//               </Card>
//             </InlineGrid>
//           )}
//         </Layout.Section>

//         {/* ---------------- TOP CUSTOMERS ---------------- */}
//         <Layout.Section>
//           <Card>
//             <BlockStack gap="300">
//               <Text variant="headingMd" as="h2">
//                 Top 5 Customers
//               </Text>

//               <DataTable
//                 columnContentTypes={["text", "numeric"]}
//                 headings={["Email", "Total Samples"]}
//                 rows={stats.topCustomers.map((c) => [c.email, c.totalSamples])}
//               />
//             </BlockStack>
//           </Card>
//         </Layout.Section>

//         {/* ---------------- TOP PRODUCTS ---------------- */}
//         <Layout.Section>
//           <Card>
//             <BlockStack gap="300">
//               <Text variant="headingMd" as="h2">
//                 Top 5 Sample Products
//               </Text>

//               <DataTable
//                 columnContentTypes={["text", "numeric"]}
//                 headings={["Variant ID", "Times Ordered"]}
//                 rows={stats.topProducts.map((v) => [v.variantId, v.count])}
//               />
//             </BlockStack>
//           </Card>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }
"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  Spinner,
  InlineGrid,
  Badge,
  BlockStack,
  DataTable,
  SkeletonDisplayText,
  SkeletonBodyText,
  EmptyState,
  Icon,
} from "@shopify/polaris";
import { ArrowUpIcon, ArrowDownIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function SampleAnalytics() {
  const app = useAppBridge();
  const [shop, setShop] = useState<string>("");
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    abandoned: 0,
    completed: 0,
    totalCustomers: 0,
    topCustomers: [] as any[],
    topProducts: [] as any[],
  });
  const [orders, setOrders] = useState<any[]>([]);

  const [trends] = useState({
    abandoned: { value: 12, isPositive: false },
    completed: { value: 8, isPositive: true },
    customers: { value: 15, isPositive: true },
  });

  /* ---------------- GET SHOP ---------------- */
  useEffect(() => {
    if (!app) return;

    const shopFromConfig = (app as any)?.config?.shop;

    if (shopFromConfig) {
      setShop(shopFromConfig);
    } else if (typeof window !== "undefined") {
      setShop(window.location.hostname);
    }
  }, [app]);
  useEffect(() => {
    if (!app) return;

    const shopFromConfig = (app as any)?.config?.shop;
    const currentShop =
      shopFromConfig ||
      (typeof window !== "undefined" ? window.location.hostname : "");

    if (!currentShop) return;

    setShop(currentShop);

    const hasFetched = sessionStorage.getItem("sampleOrdersListFetched");

    if (hasFetched) {
      console.log("⏭ Orders API skipped — already fetched");
      return;
    }

    console.log("🚀 Refresh detected — loading orders");

    sessionStorage.setItem("sampleOrdersListFetched", "true");

    fetch(`/api/sample/orders?shop=${currentShop}&type=abandoned`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data);
        setLoading(false);
      });
  }, [app]);
  useEffect(() => {
    if (!shop) return;

    fetch(`/api/sample/sample-status/top-products?shop=${shop}`)
      .then((res) => res.json())
      .then((data) => {
        setTopProducts(data.topProducts || []);
      })
      .catch((err) => {
        console.error("Top products fetch error:", err);
      });
  }, [shop]);
  useEffect(() => {
    if (!shop) return;

    fetch(`/api/sample/sample-status/count?shop=${shop}`)
      .then((res) => res.json())
      .then((data) => {
        setStats({
          abandoned: data.abandoned,
          completed: data.completed,
          totalCustomers: data.totalCustomers,
          topCustomers: data.topCustomers,
          topProducts: data.topProducts,
        });

        setLoading(false);
      });
  }, [shop]);

  const renderTrendIndicator = (trend: {
    value: number;
    isPositive: boolean;
  }) => {
    const isGood =
      (trend.isPositive && trend.value > 0) ||
      (!trend.isPositive && trend.value < 0);
    return (
      <BlockStack gap="100">
        <InlineGrid columns="1fr auto" gap="200">
          <Text as="span" variant="bodySm" tone="subdued">
            vs previous period
          </Text>
          <InlineGrid columns="auto auto" gap="100">
            <Icon
              source={trend.isPositive ? ArrowUpIcon : ArrowDownIcon}
              tone={isGood ? "success" : "critical"}
            />
     
          </InlineGrid>
        </InlineGrid>
      </BlockStack>
    );
  };

  return (
    <Page
      title="Sample Checkout Analytics"
      subtitle="Track abandoned checkouts, completed orders, and top customers."
    >
      <Layout>
        {/* ---------------- SUMMARY CARDS ---------------- */}
        <Layout.Section>
          {loading ? (
            <InlineGrid columns={3} gap="400">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <BlockStack gap="400">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={2} />
                    <SkeletonDisplayText size="medium" />
                    <SkeletonBodyText lines={1} />
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          ) : (
            <InlineGrid columns={3} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h3">
                    Abandoned Checkouts
                  </Text>

                  <Text tone="subdued" as="p">
                  Customers started checkout but didn&apos;t complete.                  </Text>

                  <InlineGrid columns="1fr auto" gap="200" alignItems="end">
                    <Text variant="heading2xl" tone="critical" as="p">
                      {stats.abandoned}
                    </Text>
                    <Badge tone="info">Checkouts</Badge>
                  </InlineGrid>

                  {renderTrendIndicator(trends.abandoned)}
                </BlockStack>
              </Card>

              <Card padding="400">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h3">
                    Completed Samples
                  </Text>
                  <Text tone="subdued" as="p">
                    Orders created when customers complete checkout with sample
                    products.
                  </Text>

                  <InlineGrid columns="1fr auto" gap="200" alignItems="end">
                    <Text variant="heading2xl" tone="success" as="p">
                      {stats.completed}
                    </Text>
                    <Badge tone="attention">Completed</Badge>
                  </InlineGrid>

                  {renderTrendIndicator(trends.completed)}
                </BlockStack>
              </Card>

              <Card padding="400">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h3">
                    Total Customers
                  </Text>
                  <Text tone="subdued" as="p">
                    Users who interacted with the app.
                  </Text>

                  <InlineGrid columns="1fr auto" gap="200" alignItems="end">
                    <Text variant="heading2xl" as="p">
                      {stats.totalCustomers}
                    </Text>
                    <Badge tone="success">All users</Badge>
                  </InlineGrid>

                  {renderTrendIndicator(trends.customers)}
                </BlockStack>
              </Card>
            </InlineGrid>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Top 5 Customers
              </Text>

              {stats.topCustomers.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "numeric"]}
                  headings={["Email", "Total Samples"]}
                  rows={stats.topCustomers.map((c) => [
                    c.email,
                    c.totalSamples,
                  ])}
                  footerContent={`Total: ${stats.topCustomers.length} customers`}
                />
              ) : (
                <EmptyState heading="No customer data yet" image="" fullWidth>
                  <Text as="p" tone="subdued">
                    Customers will appear here once they start using samples.
                  </Text>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Top 5 Sample Products
              </Text>

              {topProducts.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "numeric", "numeric"]}
                  headings={["Product Name", "Times Ordered", "Revenue"]}
                  rows={topProducts.map((p) => [
                    p.title,
                    p.sold,
                    `$${p.revenue.toFixed(2)}`,
                  ])}
                  footerContent={`Total Orders: ${topProducts.reduce(
                    (sum, p) => sum + p.sold,
                    0,
                  )}`}
                />
              ) : (
                <EmptyState heading="No product data yet" image="" fullWidth>
                  <Text as="p" tone="subdued">
                    Sample products will appear here once customers start
                    ordering them.
                  </Text>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
