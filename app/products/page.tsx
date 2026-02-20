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
  Button,
  TextField,
  InlineStack,
  Modal,
  BlockStack,
  Thumbnail,
  Pagination,
  Select,
  Icon,
  Tooltip,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import DeleteConfirmationModal from "../components/deleteConfirm";

type SampleProduct = {
  id: string;
  title: string;
  image: string;
  productId: string;
  percentageOff: number;
  fixedPrice: number;
  variantId: string;
  originalProductPrice: number;
  price: number;
  shop: string;
  createdAt: string;
};

export default function CustomProductsPage() {
  const app = useAppBridge();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;
  const [deleteProduct, setDeleteProduct] = useState<SampleProduct | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shop, setShop] = useState<string | null>(null);
  const [customProducts, setcustomProducts] = useState<SampleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricingType, setPricingType] = useState<
    "CUSTOM" | "FIXED" | "PERCENTAGE"
  >("CUSTOM");
  // Modal states
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SampleProduct | null>(
    null,
  );
  const [priceInput, setPriceInput] = useState("");
  const [updatingPrice, setUpdatingPrice] = useState(false);

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

    const fetchCustomProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/products?shop=${encodeURIComponent(shop)}&page=${page}&limit=${limit}`,
        );

        if (!res.ok) throw new Error("Failed to fetch products");

        const result = await res.json();

        setcustomProducts(result.data);
        setTotalPages(result.pagination.totalPages);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomProducts();
  }, [shop, page]);

  // const fetchCustomProducts = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch(
  //       `/api/products?shop=${encodeURIComponent(shop)}`,
  //     );

  //     if (!res.ok) throw new Error("Failed to fetch customProducts");

  //     const data = await res.json();
  //     setcustomProducts(result.data);
  //     setTotalPages(result.pagination.totalPages);
  //   } catch (err: any) {
  //     setError(err.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //   fetchCustomProducts();
  // }, [shop]);

  // Open price edit modal
  const openPriceModal = (product: SampleProduct) => {
    setEditingProduct(product);
    setPriceInput(String(product.price));
    setShowPriceModal(true);
  };

  // Close price edit modal
  const closePriceModal = () => {
    setShowPriceModal(false);
    setEditingProduct(null);
    setPriceInput("");
    setUpdatingPrice(false);
  };

  // const handleUpdatePrice = async () => {
  //   if (!editingProduct) return;

  //   try {
  //     setUpdatingPrice(true);

  //     const response = await fetch("/api/products", {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         id: editingProduct.id,
  //         price: Number(priceInput),
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to update price");
  //     }

  //     // Refresh the data
  //     const res = await fetch(
  //       `/api/products?shop=${encodeURIComponent(shop!)}`,
  //     );
  //     if (res.ok) {
  //       const data = await res.json();
  //       setcustomProducts(data);
  //     }

  //     closePriceModal();
  //   } catch (error) {
  //     console.error("Error updating price:", error);
  //     // You might want to show an error toast here
  //   } finally {
  //     setUpdatingPrice(false);
  //   }
  // };

  const handleUpdatePrice = async () => {
    if (!editingProduct) return;

    try {
      setUpdatingPrice(true);

      const response = await fetch(
        `/api/products?shop=${encodeURIComponent(shop!)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            pricingType,
            customPrice: pricingType === "CUSTOM" ? Number(priceInput) : null,
            fixedPrice: pricingType === "FIXED" ? Number(priceInput) : null,
            percentageOff:
              pricingType === "PERCENTAGE" ? Number(priceInput) : null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update price");
      }

      const res = await fetch(
        `/api/products?shop=${encodeURIComponent(shop!)}`,
      );

      if (res.ok) {
        // const data = await res.json();
        // setcustomProducts(data);
        const result = await res.json();
        setcustomProducts(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
      }

      closePriceModal();
    } catch (error) {
      console.error("Error updating price:", error);
    } finally {
      setUpdatingPrice(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      setDeleteLoading(true);

      await fetch(`/api/products?shop=${encodeURIComponent(shop!)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteProduct.id }),
      });

      // Refresh list
      const res = await fetch(
        `/api/products?shop=${encodeURIComponent(shop!)}&page=${page}&limit=${limit}`,
      );

      if (res.ok) {
        const result = await res.json();
        setcustomProducts(result.data);
        setTotalPages(result.pagination.totalPages);
      }

      setDeleteProduct(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <Page title="Sample Products">
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
      <Page title="Sample Products">
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
    <Page
      title="Sample Products"
      primaryAction={{
        content: "Add Product",
        onAction: () => router.push("/products/create"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            {customProducts.length === 0 ? (
              <Box padding="400">
                <Text as="p" tone="subdued">
                  No products found.
                </Text>
              </Box>
            ) : (
              <IndexTable
                resourceName={{
                  singular: "product",
                  plural: "products",
                }}
                itemCount={customProducts.length}
                selectable={false}
                headings={[
                  { title: "Product Image" },
                  { title: "Title" },
                  { title: "Product Original Price" },
                  { title: "Sample Price" },
                  { title: "Pricing Type" },
                  { title: "Created" },
                  { title: "Actions" },
                ]}
              >
                {customProducts.map((p, index) => (
                  <IndexTable.Row id={p.id} key={p.id} position={index}>
                    <IndexTable.Cell>
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    </IndexTable.Cell>

                    <IndexTable.Cell>
                      <Text as="p" fontWeight="bold">
                        {p.title}
                      </Text>
                    </IndexTable.Cell>

                    <IndexTable.Cell>
                      <Text as="p" fontWeight="bold" tone="success">
                        {p.originalProductPrice.toFixed(2)}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text as="p" fontWeight="bold" tone="success">
                        {p.price.toFixed(2)}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone="info">
                        {p.percentageOff != null
                          ? "Percentage"
                          : p.fixedPrice != null
                            ? "Fixed"
                            : "Custom"}
                      </Badge>
                    </IndexTable.Cell>

                    <IndexTable.Cell>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </IndexTable.Cell>

                    <IndexTable.Cell>
                      <InlineStack gap="200">
                        <Tooltip content="Edit Price Type">
                          <Button
                            size="slim"
                            icon={EditIcon}
                            tone="success"
                            onClick={() => openPriceModal(p)}
                          />
                        </Tooltip>
                        <Tooltip content="Delete Product">
                          <Button
                            size="slim"
                            icon={DeleteIcon}
                            tone="critical"
                            onClick={() => setDeleteProduct(p)}
                          />
                        </Tooltip>
                      </InlineStack>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={showPriceModal}
        onClose={closePriceModal}
        title="Update Product Price"
        size="large"
        primaryAction={{
          content: "Update Price",
          onAction: handleUpdatePrice,
          disabled: !priceInput || Number(priceInput) <= 0 || updatingPrice,
          loading: updatingPrice,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: closePriceModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {editingProduct && (
              <>
                {/* Product Info */}
                <Card>
                  <InlineStack gap="300" blockAlign="center">
                    {editingProduct.image && (
                      <Thumbnail
                        source={editingProduct.image}
                        alt={editingProduct.title}
                        size="medium"
                      />
                    )}
                    <BlockStack gap="100">
                      <Text variant="headingSm" as="h3">
                        {editingProduct.title}
                      </Text>
                      <Text as="p" tone="subdued">
                        Current Price: ${editingProduct.price.toFixed(2)}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </Card>

                {/* Price Input */}
                {/* <Card>
                  <BlockStack gap="400">
                    <TextField
                      label="New Price"
                      type="number"
                      value={priceInput}
                      onChange={setPriceInput}
                      autoComplete="off"
                      min={0}
                      step={0.01}
                      prefix="$"
                      helpText="Enter the new price for this product"
                    />

                    {/* Price Comparison */}
                {/* {priceInput && Number(priceInput) > 0 && (
                      <Box
                        background="bg-surface-secondary"
                        padding="300"
                        borderRadius="200"
                      >
                        <BlockStack gap="200">
                          <Text variant="headingSm" as="h3">
                            Price Update Summary
                          </Text>
                          <InlineStack align="space-between">
                            <Text as="span" tone="subdued">
                              Current Price:
                            </Text>
                            <Text as="span">
                              ${editingProduct.price.toFixed(2)}
                            </Text>
                          </InlineStack> */}
                {/* <InlineStack align="space-between">
                            <Text as="span" tone="subdued">
                              New Price:
                            </Text>
                            <Text 
                              as="span" 
                              fontWeight="bold" 
                              tone={Number(priceInput) < editingProduct.price ? "success" : "critical"}
                            >
                              ${Number(priceInput).toFixed(2)}
                            </Text>
                          </InlineStack> */}
                {/* <InlineStack align="space-between"></InlineStack>
                        </BlockStack>
                      </Box>
                    )}
                  </BlockStack> */}
                {/* </Card>  */}
                <Card>
                  <BlockStack gap="400">
                    <Select
                      label="Pricing Type"
                      options={[
                        // { label: "Custom Price", value: "CUSTOM" },
                        { label: "Fixed Price", value: "FIXED" },
                        { label: "Percentage Discount", value: "PERCENTAGE" },
                      ]}
                      value={pricingType}
                      onChange={(value) =>
                        setPricingType(
                          value as "CUSTOM" | "FIXED" | "PERCENTAGE",
                        )
                      }
                    />

                    <TextField
                      label={
                        pricingType === "PERCENTAGE"
                          ? "Discount Percentage"
                          : "Price"
                      }
                      type="number"
                      value={priceInput}
                      onChange={setPriceInput}
                      autoComplete="off"
                      min={0}
                      step={pricingType === "PERCENTAGE" ? 1 : 0.01}
                      prefix={pricingType === "PERCENTAGE" ? "%" : "$"}
                      helpText={
                        pricingType === "PERCENTAGE"
                          ? "Enter percentage to reduce from original price"
                          : "Enter new price"
                      }
                    />

                    {/* Summary Section */}
                    {priceInput && Number(priceInput) > 0 && (
                      <Box
                        background="bg-surface-secondary"
                        padding="300"
                        borderRadius="200"
                      >
                        <BlockStack gap="200">
                          <Text variant="headingSm" as="h3">
                            Price Update Summary
                          </Text>

                          <InlineStack align="space-between">
                            <Text as="p" tone="subdued">
                              Current Price:
                            </Text>
                            <Text as="p" tone="subdued">
                              ${editingProduct.price.toFixed(2)}
                            </Text>
                          </InlineStack>

                          {pricingType === "PERCENTAGE" && (
                            <InlineStack align="space-between">
                              <Text as="p" tone="subdued">
                                {" "}
                                Discount:
                              </Text>
                              <Text as="p" tone="subdued">
                                {Number(priceInput)}%
                              </Text>
                            </InlineStack>
                          )}

                          {(pricingType === "CUSTOM" ||
                            pricingType === "FIXED") && (
                            <InlineStack align="space-between">
                              <Text as="p" tone="subdued">
                                {" "}
                                New Price:
                              </Text>
                              <Text as="p" tone="subdued" fontWeight="bold">
                                ${Number(priceInput).toFixed(2)}
                              </Text>
                            </InlineStack>
                          )}
                        </BlockStack>
                      </Box>
                    )}
                  </BlockStack>
                </Card>
              </>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
      {!loading && !error && customProducts.length > 0 && (
        <Box padding="300">
          <Pagination
            hasPrevious={page > 1}
            onPrevious={() => setPage((p) => Math.max(p - 1, 1))}
            hasNext={page < totalPages}
            onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          />
        </Box>
      )}
      <DeleteConfirmationModal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Product"
        message={
          deleteProduct
            ? `Are you sure you want to delete "${deleteProduct.title}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Page>
  );
}
