// "use client";

// import {
//   Page,
//   Card,
//   Button,
//   Layout,
//   BlockStack,
//   InlineStack,
//   Text,
//   Box,
//   Badge,
//   TextField,
//   Modal,
//   Spinner,
//   Toast,
//   Frame,
//   List,
//   Divider,
// } from "@shopify/polaris";
// import { useState, useEffect, useCallback } from "react";
// import { useAppBridge } from "@shopify/app-bridge-react";

// type SelectedProduct = {
//   id: string;
//   title: string;
//   image?: string;
// };

// type Variant = {
//   id: string;
//   title: string;
//   price: string;
// };

// export default function ProductSampleSettings() {
//   const [toastActive, setToastActive] = useState(false);
//   const [toastContent, setToastContent] = useState("");
//   const [toastError, setToastError] = useState(false);
//   const dismissToast = () => setToastActive(false);
//   const app = useAppBridge();

//   const showToast = (msg: string, isError = false) => {
//     setToastContent(msg);
//     setToastError(isError);
//     setToastActive(true);
//   };
//   const normalizeProductId = (gid: string) =>
//     gid.replace("gid://shopify/Product/", "");

//   const normalizeVariantId = (gid: string) =>
//     gid.replace("gid://shopify/ProductVariant/", "");
//   const [shop, setShop] = useState<string>("");

//   const [customPricesCount, setCustomPricesCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [modalActive, setModalActive] = useState(false);
//   const [selectedProduct, setSelectedProduct] =
//     useState<SelectedProduct | null>(null);
//   const [variants, setVariants] = useState<Variant[]>([]);
//   const [customPrice, setCustomPrice] = useState("");
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!app) return;

//     const shopFromConfig = (app as any)?.config?.shop;

//     if (shopFromConfig) {
//       setShop(shopFromConfig);
//     } else if (typeof window !== "undefined") {
//       setShop(window.location.hostname);
//     }

//     setLoading(false);
//   }, [app]);

//   const selectSampleProduct = async () => {
//     try {
//       if (!(window as any).shopify?.resourcePicker) {
//         showToast("Shopify resource picker not available", true);
//         return;
//       }

//       const pickerResult = await (window as any).shopify.resourcePicker({
//         type: "product",
//         multiple: false,
//       });

//       const product = pickerResult?.selection?.[0];
//       if (!product) return;

//       const parsedProduct = {
//         id: normalizeProductId(product.id),
//         title: product.title,
//         image: product.images?.[0]?.originalSrc,
//       };

//       setSelectedProduct(parsedProduct);

//       if (product.variants) {
//         const parsedVariants = product.variants.map((v: any) => ({
//           id: normalizeVariantId(v.id),
//           title: v.title,
//           price: v.price,
//         }));

//         setVariants(parsedVariants);
//       } else {
//         setVariants([]);
//       }

//       setModalActive(true);
//     } catch (error) {
//       console.error(error);
//       showToast("Failed to select product", true);
//     }
//   };

//   const handleSaveCustomPrice = useCallback(async () => {
//     if (!selectedProduct) {
//       showToast("No product selected", true);
//       return;
//     }

//     if (
//       !customPrice ||
//       isNaN(Number(customPrice)) ||
//       Number(customPrice) <= 0
//     ) {
//       showToast("Please enter a valid price", true);
//       return;
//     }

//     try {
//       setSaving(true);

//       const payload = {
//         productId: selectedProduct.id,
//         title: selectedProduct.title,
//         image: selectedProduct.image,
//         customPrice: Number(customPrice),
//         variants: variants.map((v) => ({ id: v.id, title: v.title })),
//       };

//       const response = await fetch(`/api/settings/custom?shop=${shop}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (data.success) {
//         showToast("Custom price saved successfully");
//         setModalActive(false);
//         setSelectedProduct(null);
//         setCustomPrice("");

//         if (data.alreadyExists) {
//           showToast("This price was already set");
//         }
//       } else {
//         showToast(data.error || "Failed to save custom price", true);
//       }
//     } catch (error) {
//       console.error("Error saving custom price:", error);
//       showToast("Failed to save custom price", true);
//     } finally {
//       setSaving(false);
//     }
//   }, [selectedProduct, customPrice, variants, shop]);

//   if (!shop) {
//     return (
//       <Frame>
//         <Page title="Sample Product Settings">
//           <Layout>
//             <Layout.Section>
//               <Card>
//                 <Box padding="400">
//                   <Text as="p" alignment="center">
//                     Loading...
//                   </Text>
//                 </Box>
//               </Card>
//             </Layout.Section>
//           </Layout>
//         </Page>
//       </Frame>
//     );
//   }

//   if (loading) {
//     return (
//       <Frame>
//         <Page title="Sample Product Settings">
//           <Layout>
//             <Layout.Section>
//               <Card>
//                 <Box padding="400">
//                   <Text as="p" alignment="center">
//                     Loading...
//                   </Text>
//                 </Box>
//               </Card>
//             </Layout.Section>
//           </Layout>
//         </Page>
//       </Frame>
//     );
//   }

//   return (
//     <Frame>
//       <Page title="Sample Product Settings">
//         <Layout>
//           {/* MAIN SECTION */}
//           <Layout.Section>
//             <BlockStack gap="400">
//               <Card>
//                 <BlockStack gap="300">
//                   <Text as="h2" variant="headingMd">
//                     Custom Sample Prices
//                   </Text>

//                   <List type="bullet">
//                     <List.Item>Select the Product You want to set price</List.Item>
//                     <List.Item>Manually set sample price</List.Item>
//                   </List>
//                   <Button
//                     variant="primary"
//                     tone="success"
//                     onClick={selectSampleProduct}
//                   >
//                     {selectedProduct ? "Change Product" : "Add Custom Price"}
//                   </Button>
//                 </BlockStack>
//               </Card>

//               {/* PRODUCT CONFIGURATION AREA */}
//               {selectedProduct && (
//                 <Card>
//                   <BlockStack gap="400">
//                     {/* Product Info */}
//                     <InlineStack gap="300" align="start">
//                       {selectedProduct.image && (
//                         <Box
//                           width="70px"
//                           borderRadius="200"
//                           overflowX="hidden"
//                           overflowY="hidden"
//                         >
//                           <img
//                             src={selectedProduct.image}
//                             alt={selectedProduct.title}
//                             style={{
//                               width: "100%",
//                               height: "70px",
//                               objectFit: "cover",
//                             }}
//                           />
//                         </Box>
//                       )}

//                       <BlockStack gap="100">
//                         <Text as="h3" variant="headingSm">
//                           {selectedProduct.title}
//                         </Text>
//                         <Text as="p" variant="bodySm" tone="subdued">
//                           {variants.length}{" "}
//                           {variants.length === 1 ? "variant" : "variants"}
//                         </Text>
//                       </BlockStack>
//                     </InlineStack>

//                     <Divider />

//                     {/* Price Field */}
//                     <TextField
//                       label="Custom Sample Price"
//                       type="number"
//                       value={customPrice}
//                       onChange={setCustomPrice}
//                       // prefix="$"
//                       autoComplete="off"
//                       helpText="This price will override global settings"
//                       disabled={saving}
//                     />

//                     {/* Variant Preview */}
//                     {variants.length > 1 && (
//                       <Box
//                         background="bg-surface-secondary"
//                         padding="300"
//                         borderRadius="200"
//                       >
//                         <BlockStack gap="200">
//                           <Text as="p" fontWeight="bold">
//                             Applies to all variants:
//                           </Text>

//                           {variants.map((variant) => (
//                             <InlineStack key={variant.id} align="space-between">
//                               <Text as="p" variant="bodySm">
//                                 {variant.title}
//                               </Text>
//                               <Text as="p" variant="bodySm" tone="subdued">
//                                 Original: {variant.price}
//                               </Text>
//                             </InlineStack>
//                           ))}
//                         </BlockStack>
//                       </Box>
//                     )}

//                     {/* Action Buttons */}
//                     <InlineStack gap="200">
//                       <Button
//                         variant="primary"
//                         loading={saving}
//                         disabled={!customPrice || saving}
//                         onClick={handleSaveCustomPrice}
//                       >
//                         Save Price
//                       </Button>

//                       <Button
//                         tone="critical"
//                         onClick={() => {
//                           setSelectedProduct(null);
//                           setCustomPrice("");
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </InlineStack>
//                   </BlockStack>
//                 </Card>
//               )}
//             </BlockStack>
//           </Layout.Section>

//           {/* SIDE GUIDE */}
//           <Layout.Section variant="oneThird">
//             <Card>
//               <BlockStack gap="300">
//                 <Text as="h2" variant="headingSm">
//                   Quick Guide
//                 </Text>

//                 <Text as="p" variant="bodySm">
//                   1. Click "Add Custom Price"
//                 </Text>
//                 <Text as="p" variant="bodySm">
//                   2. Select a product
//                 </Text>
//                 <Text as="p" variant="bodySm">
//                   3. Enter sample price and save
//                 </Text>

//                 <Box
//                   background="bg-surface-secondary"
//                   padding="300"
//                   borderRadius="200"
//                 >
//                   <Text as="p" variant="bodySm" tone="subdued">
//                     Custom prices override global settings.
//                   </Text>
//                 </Box>
//               </BlockStack>
//             </Card>
//           </Layout.Section>
//         </Layout>

//         {toastActive && (
//           <Toast
//             content={toastContent}
//             onDismiss={dismissToast}
//             error={toastError}
//           />
//         )}
//       </Page>
//     </Frame>
//   );
// }
"use client";

import {
  Page,
  Card,
  Button,
  Layout,
  BlockStack,
  InlineStack,
  Text,
  Box,
  Badge,
  TextField,
  Select,
  Modal,
  Spinner,
  Toast,
  Frame,
  List,
  Divider,
  RadioButton,
  ChoiceList,
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

type SelectedProduct = {
  id: string;
  title: string;
  image?: string;
  originalPrice?: number;
};

type Variant = {
  id: string;
  title: string;
  price: string;
  selected?: boolean;
};

type PricingType = "FIXED" | "PERCENTAGE" | "CUSTOM";

export default function ProductSampleSettings() {
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [toastError, setToastError] = useState(false);
  const dismissToast = () => setToastActive(false);
  const app = useAppBridge();

  const showToast = (msg: string, isError = false) => {
    setToastContent(msg);
    setToastError(isError);
    setToastActive(true);
  };

  const normalizeProductId = (gid: string) =>
    gid.replace("gid://shopify/Product/", "");

  const normalizeVariantId = (gid: string) =>
    gid.replace("gid://shopify/ProductVariant/", "");

  const [shop, setShop] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Product selection state
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [applyToAllVariants, setApplyToAllVariants] = useState(true);

  // Pricing state
  const [pricingType, setPricingType] = useState<PricingType>("CUSTOM");
  const [customPrice, setCustomPrice] = useState("");
  const [fixedPrice, setFixedPrice] = useState("");
  const [percentageOff, setPercentageOff] = useState("");

  // Settings ID (if editing existing)
  const [settingsId, setSettingsId] = useState<string | undefined>();

  useEffect(() => {
    if (!app) return;

    const shopFromConfig = (app as any)?.config?.shop;

    if (shopFromConfig) {
      setShop(shopFromConfig);
    } else if (typeof window !== "undefined") {
      setShop(window.location.hostname);
    }

    setLoading(false);
  }, [app]);

  const selectSampleProduct = async () => {
    try {
      if (!(window as any).shopify?.resourcePicker) {
        showToast("Shopify resource picker not available", true);
        return;
      }

      const pickerResult = await (window as any).shopify.resourcePicker({
        type: "product",
        multiple: false,
      });

      const product = pickerResult?.selection?.[0];
      if (!product) return;

      const parsedProduct = {
        id: normalizeProductId(product.id),
        title: product.title,
        image: product.images?.[0]?.originalSrc,
        originalPrice: parseFloat(product.variants?.[0]?.price || "0"),
      };

      setSelectedProduct(parsedProduct);

      if (product.variants) {
        const parsedVariants = product.variants.map((v: any) => ({
          id: normalizeVariantId(v.id),
          title: v.title,
          price: v.price,
          selected: true,
        }));

        setVariants(parsedVariants);
        setSelectedVariantIds(parsedVariants.map((v:any) => v.id));
      } else {
        setVariants([]);
        setSelectedVariantIds([]);
      }

      // Reset form
      setPricingType("CUSTOM");
      setCustomPrice("");
      setFixedPrice("");
      setPercentageOff("");
      setApplyToAllVariants(true);
    } catch (error) {
      console.error(error);
      showToast("Failed to select product", true);
    }
  };

  const handleVariantSelectionChange = (
    variantId: string,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedVariantIds([...selectedVariantIds, variantId]);
    } else {
      setSelectedVariantIds(
        selectedVariantIds.filter((id) => id !== variantId),
      );
    }
    setApplyToAllVariants(false);
  };

  const handleSelectAllVariants = () => {
    setSelectedVariantIds(variants.map((v) => v.id));
    setApplyToAllVariants(true);
  };

  const handleSaveCustomPrice = useCallback(async () => {
    if (!selectedProduct) {
      showToast("No product selected", true);
      return;
    }

    if (selectedVariantIds.length === 0) {
      showToast("Please select at least one variant", true);
      return;
    }

    // Validate based on pricing type
    if (
      pricingType === "CUSTOM" &&
      (!customPrice || isNaN(Number(customPrice)) || Number(customPrice) <= 0)
    ) {
      showToast("Please enter a valid custom price", true);
      return;
    }

    if (
      pricingType === "FIXED" &&
      (!fixedPrice || isNaN(Number(fixedPrice)) || Number(fixedPrice) <= 0)
    ) {
      showToast("Please enter a valid fixed price", true);
      return;
    }

    if (
      pricingType === "PERCENTAGE" &&
      (!percentageOff ||
        isNaN(Number(percentageOff)) ||
        Number(percentageOff) <= 0 ||
        Number(percentageOff) > 100)
    ) {
      showToast("Please enter a valid percentage (1-100)", true);
      return;
    }

    try {
      setSaving(true);

      if (applyToAllVariants) {
        const payload = {
          productId: selectedProduct.id,
          title: selectedProduct.title,
          image: selectedProduct.image,
          variants: variants.map((v) => ({
            id: v.id,
            title: v.title,
            price: parseFloat(v.price),
          })),
          pricingType,
          customPrice:
            pricingType === "CUSTOM" ? Number(customPrice) : undefined,
          fixedPrice: pricingType === "FIXED" ? Number(fixedPrice) : undefined,
          percentageOff:
            pricingType === "PERCENTAGE" ? Number(percentageOff) : undefined,
          settingsId,
        };

        const response = await fetch(`/api/settings/custom?shop=${shop}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: payload }),
        });

        const data = await response.json();

        if (data.success) {
          showToast("Prices saved successfully");
          resetForm();
        } else {
          showToast(data.error || "Failed to save prices", true);
        }
      } else {
        const promises = selectedVariantIds.map((variantId) => {
          const variant = variants.find((v) => v.id === variantId);
          const payload = {
            productId: selectedProduct.id,
            variantId,
            title: selectedProduct.title,
            image: selectedProduct.image,
            customPrice:
              pricingType === "CUSTOM"
                ? Number(customPrice)
                : variant
                  ? parseFloat(variant.price)
                  : undefined,
            pricingType,
            fixedPrice:
              pricingType === "FIXED" ? Number(fixedPrice) : undefined,
            percentageOff:
              pricingType === "PERCENTAGE" ? Number(percentageOff) : undefined,
            settingsId,
          };

          return fetch(`/api/settings/custom?shop=${shop}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: payload }),
          }).then((res) => res.json());
        });

        const results = await Promise.all(promises);
        const allSuccessful = results.every((r) => r.success);

        if (allSuccessful) {
          showToast("Prices saved successfully");
          resetForm();
        } else {
          showToast("Some variants failed to save", true);
        }
      }
    } catch (error) {
      console.error("Error saving custom price:", error);
      showToast("Failed to save custom price", true);
    } finally {
      setSaving(false);
    }
  }, [
    selectedProduct,
    variants,
    selectedVariantIds,
    pricingType,
    customPrice,
    fixedPrice,
    percentageOff,
    applyToAllVariants,
    shop,
    settingsId,
  ]);

  const resetForm = () => {
    setSelectedProduct(null);
    setVariants([]);
    setSelectedVariantIds([]);
    setCustomPrice("");
    setFixedPrice("");
    setPercentageOff("");
    setPricingType("CUSTOM");
    setApplyToAllVariants(true);
  };

  const pricingOptions = [
    // { label: "Custom Price", value: "CUSTOM" },
    { label: "Fixed Price", value: "FIXED" },
    { label: "Percentage Off", value: "PERCENTAGE" },
  ];

  if (!shop || loading) {
    return (
      <Frame>
        <Page title="Sample Product Settings">
          <Layout>
            <Layout.Section>
              <Card>
                <Box padding="400">
                  <Text as="p" alignment="center">
                    Loading...
                  </Text>
                </Box>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    );
  }

  return (
    <Frame>
      <Page title="Sample Product Settings">
        <Layout>
          {/* MAIN SECTION */}
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Custom Sample Prices
                  </Text>

                  <List type="bullet">
                    <List.Item>
                      Select a product to set custom sample prices
                    </List.Item>
                    <List.Item>
                      Choose pricing type: Custom, Fixed, or Percentage off
                    </List.Item>
                    <List.Item>
                      Apply to all variants or select specific ones
                    </List.Item>
                  </List>

                  <Button
                    variant="primary"
                    tone="success"
                    onClick={selectSampleProduct}
                  >
                    {selectedProduct ? "Change Product" : "Add Product Set Manual Price"}
                  </Button>
                </BlockStack>
              </Card>

              {/* PRODUCT CONFIGURATION AREA */}
              {selectedProduct && (
                <Card>
                  <BlockStack gap="400">
                    {/* Product Info */}
                    <InlineStack gap="300" align="start">
                      {selectedProduct.image && (
                        <Box
                          width="70px"
                          borderRadius="200"
                          overflowX="hidden"
                          overflowY="hidden"
                        >
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.title}
                            style={{
                              width: "100%",
                              height: "70px",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}

                      <BlockStack gap="100">
                        <Text as="h3" variant="headingSm">
                          {selectedProduct.title}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {variants.length}{" "}
                          {variants.length === 1 ? "variant" : "variants"}
                        </Text>
                      </BlockStack>
                    </InlineStack>

                    <Divider />

                    {/* Pricing Type Selection */}
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">
                        Pricing Type
                      </Text>
                      <ChoiceList
                        title="Pricing type"
                        titleHidden
                        choices={pricingOptions}
                        selected={[pricingType]}
                        onChange={(value) =>
                          setPricingType(value[0] as PricingType)
                        }
                      />
                    </BlockStack>

                    {/* Price Input Fields based on type */}
                    {pricingType === "CUSTOM" && (
                      <TextField
                        label="Custom Sample Price"
                        type="number"
                        value={customPrice}
                        onChange={setCustomPrice}
                        prefix="$"
                        autoComplete="off"
                        helpText="Set a specific price for samples"
                        disabled={saving}
                      />
                    )}

                    {pricingType === "FIXED" && (
                      <TextField
                        label="Fixed Price"
                        type="number"
                        value={fixedPrice}
                        onChange={setFixedPrice}
                        prefix="$"
                        autoComplete="off"
                        helpText="Set a fixed price (overrides product price)"
                        disabled={saving}
                      />
                    )}

                    {pricingType === "PERCENTAGE" && (
                      <TextField
                        label="Percentage Off"
                        type="number"
                        value={percentageOff}
                        onChange={setPercentageOff}
                        suffix="%"
                        autoComplete="off"
                        helpText="Enter percentage discount (1-100)"
                        disabled={saving}
                      />
                    )}

                    <Divider />

                    {/* Variant Selection */}
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <Text as="h3" variant="headingSm">
                          Apply to Variants
                        </Text>
                        <Button
                          variant="plain"
                          onClick={handleSelectAllVariants}
                          disabled={
                            selectedVariantIds.length === variants.length
                          }
                        >
                          Select All
                        </Button>
                      </InlineStack>

                      <Box
                        background="bg-surface-secondary"
                        padding="300"
                        borderRadius="200"
                      >
                        <BlockStack gap="200">
                          {variants.map((variant) => {
                            const finalPrice =
                              pricingType === "FIXED"
                                ? fixedPrice
                                : pricingType === "PERCENTAGE" && percentageOff
                                  ? (
                                      parseFloat(variant.price) *
                                      (1 - parseFloat(percentageOff) / 100)
                                    ).toFixed(2)
                                  : customPrice || variant.price;

                            return (
                              <Box
                                key={variant.id}
                                padding="200"
                                background={
                                  selectedVariantIds.includes(variant.id)
                                    ? "bg-surface"
                                    : undefined
                                }
                                borderRadius="200"
                              >
                                <InlineStack align="space-between" gap="200">
                                  <InlineStack gap="200">
                                    <input
                                      type="checkbox"
                                      checked={selectedVariantIds.includes(
                                        variant.id,
                                      )}
                                      onChange={(e) =>
                                        handleVariantSelectionChange(
                                          variant.id,
                                          e.target.checked,
                                        )
                                      }
                                      style={{ cursor: "pointer" }}
                                    />
                                    <BlockStack gap="100">
                                      <Text as="p" variant="bodyMd">
                                        {variant.title}
                                      </Text>
                                      <Text
                                        as="p"
                                        variant="bodySm"
                                        tone="subdued"
                                      >
                                        Original: {variant.price}
                                      </Text>
                                    </BlockStack>
                                  </InlineStack>

                                  {selectedVariantIds.includes(variant.id) && (
                                    <Text
                                      as="p"
                                      variant="bodyMd"
                                      tone="success"
                                    >
                                      New: {finalPrice}
                                    </Text>
                                  )}
                                </InlineStack>
                              </Box>
                            );
                          })}
                        </BlockStack>
                      </Box>

                      <Text as="p" variant="bodySm" tone="subdued">
                        Selected: {selectedVariantIds.length} of{" "}
                        {variants.length} variants
                      </Text>
                    </BlockStack>

                    {/* Action Buttons */}
                    <InlineStack gap="200">
                      <Button
                        variant="primary"
                        loading={saving}
                        disabled={
                          saving ||
                          selectedVariantIds.length === 0 ||
                          (pricingType === "CUSTOM" && !customPrice) ||
                          (pricingType === "FIXED" && !fixedPrice) ||
                          (pricingType === "PERCENTAGE" && !percentageOff)
                        }
                        onClick={handleSaveCustomPrice}
                      >
                        Save{" "}
                        {selectedVariantIds.length > 1
                          ? `${selectedVariantIds.length} Prices`
                          : "Price"}
                      </Button>

                      <Button tone="critical" onClick={resetForm}>
                        Cancel
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </Layout.Section>

          {/* SIDE GUIDE */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Quick Guide
                </Text>

                <BlockStack gap="200">
                  <Box
                    padding="200"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <Text as="p" variant="bodySm" fontWeight="bold">
                      Pricing Types:
                    </Text>
                    <List>
                      <List.Item>Custom: Set any price</List.Item>
                      <List.Item>Fixed: Override product price</List.Item>
                      <List.Item>Percentage: % off original</List.Item>
                    </List>
                  </Box>

                  <Box
                    padding="200"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <Text as="p" variant="bodySm">
                      ✓ Select specific variants or apply to all
                    </Text>
                  </Box>

                  <Box
                    padding="200"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <Text as="p" variant="bodySm" tone="subdued">
                      Custom prices override global settings per variant
                    </Text>
                  </Box>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {toastActive && (
          <Toast
            content={toastContent}
            onDismiss={dismissToast}
            error={toastError}
          />
        )}
      </Page>
    </Frame>
  );
}
