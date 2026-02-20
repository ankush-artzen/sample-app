"use client";
import {
  Page,
  Layout,
  Card,
  Text,
  IndexTable,
  Badge,
  Spinner,
  Box,
  Pagination,
} from "@shopify/polaris";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";

type SampleCustomer = {
  id: string;
  email: string;
  name?: string | null;
  totalSamples: number;
  blocked: boolean;
  lastSampleAt?: string | null;
  createdAt: string;
};

export default function CustomersPage() {
  const app = useAppBridge();

  const [shop, setShop] = useState<string | null>(null);
  const [customers, setCustomers] = useState<SampleCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

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

    const fetchCustomers = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/sample/customer?shop=${encodeURIComponent(shop)}&page=${page}&limit=${limit}`,
        );

        if (!res.ok) throw new Error("Failed to fetch customers");

        const result = await res.json();

        setCustomers(result.data);
        setTotalPages(result.pagination.totalPages);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [shop, page]);

  if (loading) {
    return (
      <Page title="Sample Customers">
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Spinner />
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Sample Customers">
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Text as="p" tone="critical">
                  {error}
                </Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Sample Customers">
      <Layout>
        <Layout.Section>
          <Card>
            {customers.length === 0 ? (
              <Box padding="400">
                <Text as="p" tone="subdued">
                  No customers found.
                </Text>
              </Box>
            ) : (
              <IndexTable
                resourceName={{ singular: "customer", plural: "customers" }}
                itemCount={customers.length}
                selectable={false}
                headings={[
                  { title: "Email" },
                  { title: "Samples" },
                  { title: "Status" },
                  { title: "Created" },
                ]}
              >
                {customers.map((c, index) => (
                  <IndexTable.Row id={c.id} key={c.id} position={index}>
                    <IndexTable.Cell>
                      <Text as="p" fontWeight="bold">
                        {c.email}
                      </Text>
                    </IndexTable.Cell>

                    <IndexTable.Cell>{c.totalSamples}</IndexTable.Cell>

                    <IndexTable.Cell>
                      <Badge tone={c.blocked ? "critical" : "success"}>
                        {c.blocked ? "Blocked" : "Active"}
                      </Badge>
                    </IndexTable.Cell>

                    <IndexTable.Cell>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            )}
          </Card>

          {!loading && !error && customers.length > 0 && (
            <Box padding="300">
              <Pagination
                hasPrevious={page > 1}
                onPrevious={() => setPage((p) => Math.max(p - 1, 1))}
                hasNext={page < totalPages}
                onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
              />
            </Box>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
