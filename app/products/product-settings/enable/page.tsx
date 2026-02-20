// app/settings/page.tsx
"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  ChoiceList,
  TextField,
  DataTable,
  Modal,
  Button,
  Banner,
  Badge,
  Tabs,
  Box,
  BlockStack,
  InlineStack,
  IndexTable,
  useIndexResourceState,
  Thumbnail,
  Select,
  InlineGrid,
} from "@shopify/polaris";
import { PlusCircleIcon, SaveIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { RadioButton } from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
// Types
interface GeneralSettings {
  enabled: boolean;
  pricingType: "FIXED" | "PERCENTAGE";
  fixedPrice: number;
  percentageOff: number;
}

interface ProductSelection {
  productId: string;
  title: string;
  image: string;
  price: string;
  status: string;
}

interface CustomPrice {
  id: string;
  productId: string;
  variantId: string | null;
  productTitle: string;
  variantTitle?: string;
  originalPrice: number;
  customPrice: number;
  productImage?: string;
  productStatus?: string;
}

export default function SettingsPage() {
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    enabled: false,
    pricingType: "FIXED",
    fixedPrice: 0,
    percentageOff: 0,
  });

  // Custom Pricing State
  const [customPrices, setCustomPrices] = useState<CustomPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [shop, setShop] = useState<string>("");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Product Picker State
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSelection | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [customPriceInput, setCustomPriceInput] = useState<string>("");
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [selectedVariantDetails, setSelectedVariantDetails] =
    useState<any>(null);
  const [addingCustomPrice, setAddingCustomPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalPriceNumber = parseFloat(
    selectedVariantDetails?.price ?? selectedProduct?.price ?? "0",
  );

  const samplePriceNumber = parseFloat(customPriceInput || "0");

  let discountPercent = 0;

  if (originalPriceNumber > 0 && samplePriceNumber >= 0) {
    discountPercent =
      ((originalPriceNumber - samplePriceNumber) / originalPriceNumber) * 100;
  }

  // Clamp between 0–100
  discountPercent = Math.min(100, Math.max(0, discountPercent));
  const app = useAppBridge();

  // Derive shop from App Bridge config (preferred) with hostname fallback
  useEffect(() => {
    if (!app) return;

    const shopFromConfig = (app as any)?.config?.shop;

    if (shopFromConfig) {
      setShop(shopFromConfig);
    } else if (typeof window !== "undefined") {
      setShop(window.location.hostname);
    }
  }, [app]);


    

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Normalize product ID (remove 'gid://shopify/Product/' prefix)
  const normalizeProductId = (gid: string): string => {
    return gid.replace("gid://shopify/Product/", "");
  };

  const normalizeVariantId = (gid: string): string => {
    return gid.replace("gid://shopify/ProductVariant/", "");
  };

  const selectProduct = async () => {
    try {
      if (!(window as any).shopify || !(window as any).shopify.resourcePicker) {
        showToast("Shopify resource picker is not available");
        return;
      }

      const pickerResult = await (window as any).shopify.resourcePicker({
        type: "product",
        multiple: false,
        filter: {
          productType: null,
          collectionId: null,
          tags: null,
        },
      });

      const product = pickerResult?.selection?.[0];
      if (!product) return;

      // Parse product data from picker result
      const parsedProduct: ProductSelection = {
        productId: normalizeProductId(product.id),
        title: product.title,
        image: product.images?.[0]?.originalSrc || "",
        price: product.variants?.[0]?.price || "0",
        status: product.status || "active",
      };

      setSelectedProduct(parsedProduct);

      // Parse variants data
      if (product.variants) {
        const variants = product.variants.map((variant: any) => ({
          id: normalizeVariantId(variant.id),
          title: variant.title,
          price: variant.price,
          sku: variant.sku || "",
          inventoryQuantity: variant.inventoryQuantity || 0,
        }));
        setProductVariants(variants);

        // Auto-select first variant if only one exists
        if (variants.length === 1) {
          handleVariantSelect(variants[0].id);
        } else {
          setSelectedVariant("");
          setSelectedVariantDetails(null);
        }
      }

      // Set default custom price (80% of original)
      const originalPrice = parseFloat(parsedProduct.price);
      setCustomPriceInput((originalPrice * 0.8).toFixed(2));
    } catch (error) {
      console.error("Error in product picker:", error);
      showToast("Failed to open product picker");
    }
  };

  // Handle variant selection
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    const variant = productVariants.find((v) => v.id === variantId);
    setSelectedVariantDetails(variant);

    // Update custom price based on selected variant
    if (variant && customPriceInput) {
      const originalPrice = parseFloat(variant.price);
      const currentCustomPrice = parseFloat(customPriceInput);
      const originalProductPrice = parseFloat(selectedProduct?.price || "0");

      // Keep the same percentage discount if price changed
      if (originalProductPrice > 0) {
        const discountPercentage =
          (originalProductPrice - currentCustomPrice) / originalProductPrice;
        const newCustomPrice = originalPrice * (1 - discountPercentage);
        setCustomPriceInput(newCustomPrice.toFixed(2));
      }
    }
  };

  const loadAllSettings = useCallback(async (shopDomain: string) => {
    try {
      const response = await fetch(`/api/settings?shop=${shopDomain}`);
      const data = await response.json();
  
      if (data.success && data.data) {
        setGeneralSettings({
          enabled: data.data.enabled || false,
          pricingType: data.data.pricingType || "FIXED",
          fixedPrice: data.data.fixedPrice || 0,
          percentageOff: data.data.percentageOff || 0,
        });
  
        if (data.data.customPrices) {
          const transformedPrices = await transformCustomPrices(
            data.data.customPrices
          );
          setCustomPrices(transformedPrices);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!shop) return;
    loadAllSettings(shop);
  }, [shop, loadAllSettings]);

  const transformCustomPrices = async (
    prices: any[],
  ): Promise<CustomPrice[]> => {
    return prices.map((price) => ({
      id: price.id || Math.random().toString(),
      productId: price.productId,
      variantId: price.variantId,
      productTitle: price.productTitle || `Product ${price.productId}`,
      variantTitle: price.variantTitle,
      originalPrice: price.originalPrice || 0,
      customPrice: price.customPrice || price.price,
      productImage: price.productImage,
      productStatus: price.productStatus,
    }));
  };

  // Save General Settings
  const saveGeneralSettings = async () => {
    setSavingGeneral(true);
    try {
      const response = await fetch(`/api/settings/global?shop=${shop}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "general",
          data: generalSettings,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast("General settings saved successfully");
      } else {
        showToast("Failed to save general settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Failed to save general settings");
    } finally {
      setSavingGeneral(false);
    }
  };

  // Add Custom Price
  const addCustomPrice = async () => {
    if (!selectedProduct || !customPriceInput) {
      showToast("Please select a product and enter a price");
      return;
    }

    setAddingCustomPrice(true);
    try {
      const customPriceData = {
        productId: selectedProduct.productId,
        variantId: selectedVariant || null,
        productTitle: selectedProduct.title,
        variantTitle: selectedVariantDetails?.title,
        title: selectedProduct.title,
        image: selectedProduct.image,

        originalPrice: selectedVariantDetails
          ? parseFloat(selectedVariantDetails.price)
          : parseFloat(selectedProduct.price),
        customPrice: parseFloat(customPriceInput),
        variants: selectedVariant ? undefined : productVariants,
        productImage: selectedProduct.image,
        productStatus: selectedProduct.status,
      };

      const response = await fetch(`/api/settings/custom?shop=${shop}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          data: customPriceData,
        }),
      });

      const data = await response.json();
      if (data.alreadyExists) {
        showToast("Same sample price already applied");
        closeModal();
        return;
      }
      if (data.success) {
        // APPLY TO ALL VARIANTS
        if (!selectedVariant) {
          showToast("Sample price applied to all variants");
          closeModal();
          return;
        }

        // SINGLE VARIANT ONLY
        const newPrice: CustomPrice = {
          id: data.data?.id || Math.random().toString(),
          ...customPriceData,
        };

        setCustomPrices([...customPrices, newPrice]);
        closeModal();
        showToast("Custom price added successfully");
      }

      // if (data.success) {
      //   // APPLY TO ALL VARIANTS
      //   if (!selectedVariant) {
      //     showToast("Sample price applied to all variants successfully");
      //     closeModal();
      //     return;
      //   }

      //   // SINGLE VARIANT
      //   const newPrice: CustomPrice = {
      //     id: data.data?.id || Math.random().toString(),
      //     ...customPriceData,
      //   };

      //   setCustomPrices([...customPrices, newPrice]);
      //   closeModal();
      //   showToast("Custom price added successfully");
      // }
      if (data.success && data.appliedToAll) {
        showToast(`Sample price applied to ${data.variantsCount} variants`);
        closeModal();
        return;
      }

      // if (data.success) {
      //         const newPrice: CustomPrice = {
      //     id: data.data.id || Math.random().toString(),
      //     ...customPriceData,
      //   };

      // setCustomPrices([...customPrices, newPrice]);
      // closeModal();
      // showToast("Custom price added successfully");
      else {
        showToast("Failed to add custom price");
      }
    } catch (error) {
      console.error("Failed to add custom price:", error);
      showToast("Failed to add custom price");
    } finally {
      setAddingCustomPrice(false);
    }
  };

  // Delete Custom Price
  const deleteCustomPrice = async (id: string) => {
    try {
      const response = await fetch(`/api/custom-prices/${id}?shop=${shop}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setCustomPrices(customPrices.filter((price) => price.id !== id));
        showToast("Custom price deleted successfully");
      } else {
        showToast("Failed to delete custom price");
      }
    } catch (error) {
      console.error("Failed to delete price:", error);
      showToast("Failed to delete custom price");
    }
  };

  // Reset Modal
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedProduct(null);
    setSelectedVariant("");
    setCustomPriceInput("");
    setProductVariants([]);
    setSelectedVariantDetails(null);
  };

  if (loading) {
    return (
      <Page title="Sample Settings">
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Text as="p">Loading settings...</Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <>
      <Page
        title="Sample Product Settings"
        primaryAction={{
          content: "Save Settings",
          icon: SaveIcon,
          onAction: saveGeneralSettings,
          disabled: savingGeneral,
        }}
      >
        <Layout>
          {/* Top Info + Enable Toggle */}
          <Layout.Section>
            <Card>
              <Banner
                title="when disable original price will be aaplied to sample"
                tone="info"
              />
              <BlockStack gap="200">
                {/* <Text as="p" variant="headingSm">
                    Sample Products
                  </Text> */}

                <RadioButton
                  label="Disabled – Save Settings as Disabled ,Settings will disable"
                  checked={generalSettings.enabled === false}
                  name="sample-enabled"
                  onChange={() =>
                    setGeneralSettings({ ...generalSettings, enabled: false })
                  }
                />
                <RadioButton
                  label="Enabled – Show Sample Product Settings"
                  checked={generalSettings.enabled === true}
                  name="sample-enabled"
                  onChange={() =>
                    setGeneralSettings({ ...generalSettings, enabled: true })
                  }
                />
              </BlockStack>

              {toastMessage && (
                <Box padding="200">
                  <Banner tone="info" onDismiss={() => setToastMessage("")}>
                    {toastMessage}
                  </Banner>
                </Box>
              )}
            </Card>
          </Layout.Section>
          <Layout.Section>
            {/* <InlineGrid columns={{ xs: 1, md: 2 }} gap="400"> */}
            {generalSettings.enabled && (
              <>
                <Card>
                  <Box padding="400">
                    <BlockStack gap="400">
                      <BlockStack gap="200">
                        <Text as="p" variant="headingSm">
                          Default Pricing Method for All Products
                        </Text>

                        <RadioButton
                          label="Fixed Price"
                          helpText="All samples will have the same price"
                          checked={generalSettings.pricingType === "FIXED"}
                          name="pricing-type"
                          onChange={() =>
                            setGeneralSettings({
                              ...generalSettings,
                              pricingType: "FIXED",
                            })
                          }
                        />

                        <RadioButton
                          label="Percentage Off"
                          helpText="All samples will apply same Discount based on original price"
                          checked={generalSettings.pricingType === "PERCENTAGE"}
                          name="pricing-type"
                          onChange={() =>
                            setGeneralSettings({
                              ...generalSettings,
                              pricingType: "PERCENTAGE",
                            })
                          }
                        />
                      </BlockStack>

                      {generalSettings.pricingType === "FIXED" && (
                        <TextField
                          label="Fixed Sample Price"
                          type="number"
                          prefix="$"
                          value={generalSettings.fixedPrice.toString()}
                          onChange={(value) =>
                            setGeneralSettings({
                              ...generalSettings,
                              fixedPrice: parseFloat(value) || 0,
                            })
                          }
                          autoComplete="off"
                          min={0}
                          step={0.01}
                          helpText="This price will apply to all sample products unless overridden in custom pricing"
                        />
                      )}

                      {generalSettings.pricingType === "PERCENTAGE" && (
                        <TextField
                          label="Discount Percentage"
                          type="number"
                          suffix="%"
                          value={generalSettings.percentageOff.toString()}
                          onChange={(value) => {
                            const percent = Math.min(
                              100,
                              Math.max(0, parseFloat(value) || 0),
                            );
                            setGeneralSettings({
                              ...generalSettings,
                              percentageOff: percent,
                            });
                          }}
                          autoComplete="off"
                          min={0}
                          max={100}
                          step={1}
                          helpText="Percentage discount applied to original product price"
                        />
                      )}
                    </BlockStack>
                  </Box>
                </Card>
              </>
            )}
            {/* 
              {generalSettings.enabled && (
                <>
                  <Card>
                    <Box padding="400">
                      <BlockStack gap="400">
                        <InlineStack
                          align="space-between"
                          blockAlign="center"
                          gap="400"
                        >
                          <BlockStack gap="100">
                            <Text variant="headingMd" as="h3">
                              Custom Product Pricing
                            </Text>
                            <Text as="p" variant="bodyMd" tone="subdued">
                              Override default pricing for specific products
                            </Text>
                          </BlockStack>
             
                        </InlineStack>

                  
                        <Banner
                          title="Custom pricing"
                          action={{
                            content: "Add custom price",
                            onAction: () => setShowAddModal(true),
                          }}
                          tone="info"
                        >
                          <p>
                            Use custom pricing to override sample prices for
                            specific products. Added prices will be applied
                            automatically — no listing is shown here.
                          </p>
                        </Banner>
                      </BlockStack>
                    </Box>
                  </Card>
                </>
              )} */}
            {/* </InlineGrid> */}
          </Layout.Section>
        </Layout>
      </Page>

      <Modal
        open={showAddModal}
        onClose={closeModal}
        title="Add Custom Sample Price"
        size="large"
        primaryAction={{
          content: "Save Custom Price",
          onAction: addCustomPrice,
          disabled: !selectedProduct || !customPriceInput || addingCustomPrice,
          loading: addingCustomPrice,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: closeModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Button onClick={selectProduct} fullWidth>
                  {selectedProduct ? "Change Product" : "Select Product"}
                </Button>

                {/* Selected Product Display */}
                {selectedProduct && (
                  <Box
                    background="bg-surface-secondary"
                    padding="300"
                    borderRadius="200"
                  >
                    <InlineStack align="start" gap="300" blockAlign="center">
                      {selectedProduct.image && (
                        <Thumbnail
                          source={selectedProduct.image}
                          alt={selectedProduct.title}
                          size="medium"
                        />
                      )}
                      <BlockStack gap="100">
                        <Text variant="headingSm" as="h3">
                          {selectedProduct.title}
                        </Text>
                        {/* <Text as="p" tone="subdued">
                          Product ID: {selectedProduct.productId}
                        </Text> */}
                        <Text as="p" tone="subdued">
                          Status:{" "}
                          <Badge
                            tone={
                              selectedProduct.status === "active"
                                ? "success"
                                : "warning"
                            }
                          >
                            {selectedProduct.status}
                          </Badge>
                        </Text>
                        <Text as="p" tone="subdued">
                          Original Price: {selectedProduct.price}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                  </Box>
                )}
              </BlockStack>
            </Card>

            {/* Variant Selection */}
            {selectedProduct && productVariants.length > 1 && (
              <Card>
                <Select
                  label="Select Variant (Optional)"
                  options={[
                    { label: "All Variants (Apply to all)", value: "" },
                    ...productVariants.map((variant) => ({
                      label: `${variant.title} - $${variant.price}${variant.sku ? ` (SKU: ${variant.sku})` : ""}`,
                      value: variant.id,
                    })),
                  ]}
                  value={selectedVariant}
                  onChange={handleVariantSelect}
                  helpText="Leave empty to apply sample price to all variants"
                />
              </Card>
            )}

            {/* Price Input */}
            {selectedProduct && (
              <Card>
                <BlockStack gap="200">
                  <TextField
                    label="Sample Price"
                    type="number"
                    // prefix="$"
                    value={customPriceInput}
                    onChange={setCustomPriceInput}
                    autoComplete="off"
                    min={0}
                    step={0.01}
                    helpText={
                      selectedVariantDetails
                        ? `Original price for ${selectedVariantDetails.title}: ${selectedVariantDetails.price}`
                        : `Original price: ${selectedProduct.price}`
                    }
                  />

                  {/* Price Summary */}
                  {customPriceInput && (
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                    >
                      <BlockStack gap="100">
                        <Text variant="headingSm" as="h3">
                          Price Summary
                        </Text>
                        <InlineStack align="space-between">
                          <Text as="span" tone="subdued">
                            Product:
                          </Text>
                          <Text as="span" fontWeight="bold">
                            {selectedProduct.title}
                          </Text>
                        </InlineStack>
                        {selectedVariantDetails && (
                          <InlineStack align="space-between">
                            <Text as="span" tone="subdued">
                              Variant:
                            </Text>
                            <Text as="span">
                              {selectedVariantDetails.title}
                            </Text>
                          </InlineStack>
                        )}
                        <InlineStack align="space-between">
                          <Text as="span" tone="subdued">
                            Original Price:
                          </Text>
                          <Text as="span">
                            {selectedVariantDetails
                              ? selectedVariantDetails.price
                              : selectedProduct.price}
                          </Text>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="span" tone="subdued">
                            Sample Price:
                          </Text>
                          <Text as="span" fontWeight="bold" tone="success">
                            {parseFloat(customPriceInput).toFixed(2)}
                          </Text>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="span" tone="subdued">
                            Discount:
                          </Text>
                          <Text as="span" tone="success">
                            {discountPercent.toFixed(0)}% off
                          </Text>

                          {/* <Text as="span" tone="success">
                            {(
                              ((parseFloat(
                                selectedVariantDetails
                                  ? selectedVariantDetails.price
                                  : selectedProduct.price,
                              ) -
                                parseFloat(customPriceInput)) /
                                parseFloat(
                                  selectedVariantDetails
                                    ? selectedVariantDetails.price
                                    : selectedProduct.price,
                                )) *
                              100
                            ).toFixed(0)}
                            % off
                          </Text> */}
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  )}
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
