"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Page,
  Card,
  IndexTable,
  TextField,
  Button,
  Banner,
  Badge,
  EmptyState,
  Select,
  BlockStack,
  InlineStack,
  Layout,
  Text,
  Box,
  Loading,
  useIndexResourceState,
} from "@shopify/polaris";
import { SkeletonPage, SkeletonBodyText } from "@shopify/polaris";

import { useAppBridge } from "@shopify/app-bridge-react";
 const EMPTY_STATE_IMAGE =
  "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png";
/* ----------------------------------
   Type Definitions
----------------------------------- */
type SampleSettings = {
  enabled: boolean;
  sampleProductId: string;
  limit: number;
  onePerCustomer: boolean;
};

type ApiProduct = {
  id: string;
  title: string;
  status: string;
  settings: SampleSettings | null;
};

type ApiResponse = {
  success: boolean;
  count: number;
  products: ApiProduct[];
  error?: string;
};

/* ----------------------------------
   Status Badge Component
----------------------------------- */
const StatusBadge = ({ status }: { status: string }) => {
  const config = (() => {
    switch (status) {
      case "ACTIVE":
        return { label: "Active", tone: "success" as const };
      case "DRAFT":
        return { label: "Draft", tone: "warning" as const };
      case "ARCHIVED":
        return { label: "Archived", tone: "critical" as const };
      default:
        return { label: status, tone: "subdued" as const };
    }
  })();

  return <Badge>{config.label}</Badge>;
};

/* ----------------------------------
   Settings Badge Component
----------------------------------- */
const SettingsBadge = ({ settings }: { settings: SampleSettings | null }) => {
  if (!settings) return <Badge tone="info">No Settings</Badge>;

  return (
    <BlockStack gap="200">
      <InlineStack gap="200">
        <Badge tone={settings.enabled ? "success" : "info"}>
          {settings.enabled ? "Enabled" : "Disabled"}
        </Badge>
        {/* {settings.onePerCustomer && <Badge tone="info">One Per Customer</Badge>} */}
      </InlineStack>
      {/* <Text as="p" variant="bodySm" tone="subdued">
        Limit: {settings.limit} • Product ID:{" "}
        {settings.sampleProductId.slice(0, 8)}…
      </Text> */}
    </BlockStack>
  );
};

/* ----------------------------------
   Main Component
----------------------------------- */
export default function ProductsWithSampleSettings() {
  const app = useAppBridge();

  const [shop, setShop] = useState<string | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!app) return;

    const shopFromConfig = (app as any)?.config?.shop;

    if (shopFromConfig) {
      setShop(shopFromConfig);
      setError(null);
    } else {
      setShop(null);
      setError("Unable to retrieve shop info. Please reload the app.");
    }
  }, [app]);

  /* ----------------------------------
     Index Table Selection
  ----------------------------------- */
  const { clearSelection } = useIndexResourceState(filteredProducts);

  /* ----------------------------------
     Fetch Products
  ----------------------------------- */
  const fetchProducts = useCallback(async () => {
    if (!shop) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products?shop=${encodeURIComponent(shop)}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: ApiResponse = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shop]);

  /* ----------------------------------
     Auto Fetch
  ----------------------------------- */
  useEffect(() => {
    if (shop) fetchProducts();
  }, [shop, fetchProducts]);

  /* ----------------------------------
     Apply Filters
  ----------------------------------- */
  useEffect(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const shortId = p.id.split("/").pop() ?? "";
        return (
          p.title.toLowerCase().includes(q) || shortId.toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    setFilteredProducts(result);
    clearSelection();
  }, [products, searchQuery, statusFilter, clearSelection]);

  /* ----------------------------------
     Stats
  ----------------------------------- */
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
    enabledSamples: products.filter((p) => p.settings?.enabled).length,
  };

  /* ----------------------------------
     Table Rows
  ----------------------------------- */
  const rows = filteredProducts.map((product, index) => {
    const shortId = product.id.split("/").pop();

    return (
      <IndexTable.Row
        id={product.id}
        key={product.id}
        position={index}

        // selected={selectedResources.includes(product.id)}
      >
        <IndexTable.Cell>
          <Text as="p" fontWeight="semibold">
            {product.title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <StatusBadge status={product.status} />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <SettingsBadge settings={product.settings} />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="200">
            <Button
              size="micro"
              onClick={() =>
                window.open(
                  `https://${shop}/admin/products/${shortId}`,
                  "_blank",
                )
              }
            >
              Edit
            </Button>
            <Button
              size="micro"
              variant="secondary"
              onClick={() =>
                window.open(
                  `https://${shop}/admin/products/${shortId}`,
                  "_blank",
                )
              }
            >
              View
            </Button>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  if (loading) {
    return (
      <SkeletonPage primaryAction>
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={6} />
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  return (
    <Page
      title="Sample Settings Products"
      // subtitle={`Products with sample settings for ${shop ?? "your store"}`}
      primaryAction={{
        content: "Refresh",
        onAction: fetchProducts,
        disabled: !shop,
      }}
      secondaryActions={[
        {
          content: "Create",
          onAction: () => {
            window.location.href = "/products/create";
          },
        },
      ]}
    >
      <Layout>
        {products.length > 0 && (
          <Layout.Section>
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  <Text as="p" variant="headingLg">
                    {stats.total}
                  </Text>
                  <Text as="p" tone="subdued">
                    Total Products
                  </Text>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <Text as="p" variant="headingLg">
                    {stats.active}
                  </Text>
                  <Text as="p" tone="subdued">
                    Active Products
                  </Text>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <Text as="p" variant="headingLg">
                    {stats.enabledSamples}
                  </Text>
                  <Text as="p" tone="subdued">
                    Enabled Samples
                  </Text>
                </Card>
              </Layout.Section>
            </Layout>
          </Layout.Section>
        )}
        <Layout.Section>
          <Card>
            {!shop ? (
              <EmptyState
                heading="Waiting for shop context"
                image={"EMPTY_STATE_IMAGE"}
              >
                Open this page from Shopify Admin.
              </EmptyState>
            ) : products.length === 0 ? (
              <EmptyState
                heading="No products found"
                action={{ content: "Refresh", onAction: fetchProducts }}
                image={"EMPTY_STATE_IMAGE"}
              />
            ) : (
              <IndexTable
                resourceName={{ singular: "product", plural: "products" }}
                itemCount={filteredProducts.length}
                // selectedItemsCount={
                //   allResourcesSelected ? "All" : selectedResources.length
                // }
                // onSelectionChange={handleSelectionChange}
                selectable={false}
                headings={[
                  { title: "Product" },
                  { title: "Status" },
                  { title: "Sample Settings" },
                  { title: "Actions" },
                ]}
              >
                {rows}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
