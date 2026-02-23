// "use client";

// import {
//   Page,
//   Layout,
//   Card,
//   Text,
//   ChoiceList,
//   TextField,
//   DataTable,
//   Modal,
//   Button,
//   Banner,
//   Badge,
//   Tabs,
//   Box,
//   BlockStack,
//   InlineStack,
//   IndexTable,
//   useIndexResourceState,
//   Thumbnail,
//   Select,
//   InlineGrid,
//   Icon,
//   Divider,
//   CalloutCard,
// } from "@shopify/polaris";
// import { PlusCircleIcon, SaveIcon, DeleteIcon } from "@shopify/polaris-icons";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { RadioButton } from "@shopify/polaris";
// import { useState, useEffect, useCallback } from "react";

// // Types
// interface GeneralSettings {
//   enabled: boolean;
//   pricingType: "FIXED" | "PERCENTAGE";
//   fixedPrice: number;
//   percentageOff: number;
// }

// interface ProductSelection {
//   productId: string;
//   title: string;
//   image: string;
//   price: string;
//   status: string;
// }

// interface CustomPrice {
//   id: string;
//   productId: string;
//   variantId: string | null;
//   productTitle: string;
//   variantTitle?: string;
//   originalPrice: number;
//   customPrice: number;
//   productImage?: string;
//   productStatus?: string;
// }

// export default function SettingsPage() {
//   const app = useAppBridge();

//   // Tab State
//   const [selectedTab, setSelectedTab] = useState(0);

//   // Shop State
//   const [shop, setShop] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Toast State
//   const [toastMessage, setToastMessage] = useState<string>("");

//   // General Settings State
//   const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
//     enabled: false,
//     pricingType: "FIXED",
//     fixedPrice: 0,
//     percentageOff: 0,
//   });

//   // Custom Pricing State
//   const [customPrices, setCustomPrices] = useState<CustomPrice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [savingGeneral, setSavingGeneral] = useState(false);

//   // Modal State
//   const [showAddModal, setShowAddModal] = useState(false);

//   // Product Picker State
//   const [selectedProduct, setSelectedProduct] =
//     useState<ProductSelection | null>(null);
//   const [selectedVariant, setSelectedVariant] = useState<string>("");
//   const [customPriceInput, setCustomPriceInput] = useState<string>("");
//   const [productVariants, setProductVariants] = useState<any[]>([]);
//   const [selectedVariantDetails, setSelectedVariantDetails] =
//     useState<any>(null);
//   const [addingCustomPrice, setAddingCustomPrice] = useState(false);

//   // Script Installation State
//   const [saveMessage, setSaveMessage] = useState<{
//     type: "success" | "error";
//     message: string;
//   } | null>(null);
//   const [isInstalling, setIsInstalling] = useState(false);

//   // Tabs configuration
//   const tabs = [
//     {
//       id: "sample-pricing",
//       content: "Sample Pricing",
//       accessibilityLabel: "Sample pricing settings",
//       panelID: "sample-pricing-panel",
//     },
//     {
//       id: "theme-settings",
//       content: "Theme Settings",
//       accessibilityLabel: "Theme and script settings",
//       panelID: "theme-settings-panel",
//     },
//   ];

//   // Derive shop from App Bridge config
//   useEffect(() => {
//     if (!app) return;

//     setIsLoading(true);
//     const timer = setTimeout(() => {
//       const shopFromConfig = (app as any)?.config?.shop;

//       if (shopFromConfig) {
//         setShop(shopFromConfig);
//         setError(null);
//       } else if (typeof window !== "undefined") {
//         setShop(window.location.hostname);
//       } else {
//         setError("Unable to retrieve shop info. Please reload the app.");
//       }
//       setIsLoading(false);
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [app]);

//   const showToast = (message: string) => {
//     setToastMessage(message);
//     setTimeout(() => setToastMessage(""), 3000);
//   };

//   const normalizeProductId = (gid: string): string => {
//     return gid.replace("gid://shopify/Product/", "");
//   };

//   const normalizeVariantId = (gid: string): string => {
//     return gid.replace("gid://shopify/ProductVariant/", "");
//   };

//   const selectProduct = async () => {
//     try {
//       if (!(window as any).shopify || !(window as any).shopify.resourcePicker) {
//         showToast("Shopify resource picker is not available");
//         return;
//       }

//       const pickerResult = await (window as any).shopify.resourcePicker({
//         type: "product",
//         multiple: false,
//       });

//       const product = pickerResult?.selection?.[0];
//       if (!product) return;

//       const parsedProduct: ProductSelection = {
//         productId: normalizeProductId(product.id),
//         title: product.title,
//         image: product.images?.[0]?.originalSrc || "",
//         price: product.variants?.[0]?.price || "0",
//         status: product.status || "active",
//       };

//       setSelectedProduct(parsedProduct);

//       if (product.variants) {
//         const variants = product.variants.map((variant: any) => ({
//           id: normalizeVariantId(variant.id),
//           title: variant.title,
//           price: variant.price,
//           sku: variant.sku || "",
//           inventoryQuantity: variant.inventoryQuantity || 0,
//         }));
//         setProductVariants(variants);

//         if (variants.length === 1) {
//           handleVariantSelect(variants[0].id);
//         } else {
//           setSelectedVariant("");
//           setSelectedVariantDetails(null);
//         }
//       }

//       const originalPrice = parseFloat(parsedProduct.price);
//       setCustomPriceInput((originalPrice * 0.8).toFixed(2));
//     } catch (error) {
//       console.error("Error in product picker:", error);
//       showToast("Failed to open product picker");
//     }
//   };

//   const handleVariantSelect = (variantId: string) => {
//     setSelectedVariant(variantId);
//     const variant = productVariants.find((v) => v.id === variantId);
//     setSelectedVariantDetails(variant);

//     if (variant && customPriceInput) {
//       const originalPrice = parseFloat(variant.price);
//       const currentCustomPrice = parseFloat(customPriceInput);
//       const originalProductPrice = parseFloat(selectedProduct?.price || "0");

//       if (originalProductPrice > 0) {
//         const discountPercentage =
//           (originalProductPrice - currentCustomPrice) / originalProductPrice;
//         const newCustomPrice = originalPrice * (1 - discountPercentage);
//         setCustomPriceInput(newCustomPrice.toFixed(2));
//       }
//     }
//   };
//   const loadAllSettings = useCallback(async (shopDomain: string) => {
//     try {
//       const res = await fetch(`/api/settings?shop=${shopDomain}`);
//       const json = await res.json();

//       if (json.success && json.data) {
//         setGeneralSettings({
//           enabled: json.data.enabled,
//           pricingType: json.data.pricingType || "FIXED",
//           fixedPrice: Number(json.data.fixedPrice || 0),
//           percentageOff: Number(json.data.percentageOff || 0),
//         });

//         if (json.data.customPrices) {
//           const transformedPrices = await transformCustomPrices(
//             json.data.customPrices,
//           );
//           setCustomPrices(transformedPrices);
//         }
//       }
//     } catch (e) {
//       console.error("loadAllSettings error:", e);
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   useEffect(() => {
//     if (!shop) return;
//     loadAllSettings(shop);
//   }, [shop, loadAllSettings]);

//   const transformCustomPrices = async (
//     prices: any[],
//   ): Promise<CustomPrice[]> => {
//     return prices.map((price) => ({
//       id: price.id || Math.random().toString(),
//       productId: price.productId,
//       variantId: price.variantId,
//       productTitle: price.productTitle || `Product ${price.productId}`,
//       variantTitle: price.variantTitle,
//       originalPrice: price.originalPrice || 0,
//       customPrice: price.customPrice || price.price,
//       productImage: price.productImage,
//       productStatus: price.productStatus,
//     }));
//   };

//   const saveGeneralSettings = async () => {
//     setSavingGeneral(true);
//     try {
//       const response = await fetch(`/api/settings/global?shop=${shop}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "general",
//           data: generalSettings,
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         showToast("General settings saved successfully");
//       } else {
//         showToast("Failed to save general settings");
//       }
//     } catch (error) {
//       console.error("Failed to save settings:", error);
//       showToast("Failed to save general settings");
//     } finally {
//       setSavingGeneral(false);
//     }
//   };

//   const addCustomPrice = async () => {
//     if (!selectedProduct || !customPriceInput) {
//       showToast("Please select a product and enter a price");
//       return;
//     }

//     setAddingCustomPrice(true);
//     try {
//       const customPriceData = {
//         productId: selectedProduct.productId,
//         variantId: selectedVariant || null,
//         productTitle: selectedProduct.title,
//         variantTitle: selectedVariantDetails?.title,
//         title: selectedProduct.title,
//         image: selectedProduct.image,
//         originalPrice: selectedVariantDetails
//           ? parseFloat(selectedVariantDetails.price)
//           : parseFloat(selectedProduct.price),
//         customPrice: parseFloat(customPriceInput),
//         variants: selectedVariant ? undefined : productVariants,
//         productImage: selectedProduct.image,
//         productStatus: selectedProduct.status,
//       };

//       const response = await fetch(`/api/settings/custom?shop=${shop}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "custom",
//           data: customPriceData,
//         }),
//       });

//       const data = await response.json();
//       if (data.alreadyExists) {
//         showToast("Same sample price already applied");
//         closeModal();
//         return;
//       }
//       if (data.success) {
//         if (!selectedVariant) {
//           showToast("Sample price applied to all variants");
//           closeModal();
//           return;
//         }

//         const newPrice: CustomPrice = {
//           id: data.data?.id || Math.random().toString(),
//           ...customPriceData,
//         };

//         setCustomPrices([...customPrices, newPrice]);
//         closeModal();
//         showToast("Custom price added successfully");
//       }

//       if (data.success && data.appliedToAll) {
//         showToast(`Sample price applied to ${data.variantsCount} variants`);
//         closeModal();
//         return;
//       } else {
//         showToast("Failed to add custom price");
//       }
//     } catch (error) {
//       console.error("Failed to add custom price:", error);
//       showToast("Failed to add custom price");
//     } finally {
//       setAddingCustomPrice(false);
//     }
//   };

//   const installScriptTag = async () => {
//     try {
//       setIsInstalling(true);
//       setSaveMessage(null);

//       const shop = (app as any)?.config?.shop;

//       if (!shop) {
//         throw new Error("Shop not found");
//       }

//       const res = await fetch("/api/script-tag", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ shop }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.error || "Failed to install script");
//       }

//       setSaveMessage({
//         type: "success",
//         message: "🎉 Storefront script installed successfully!",
//       });
//     } catch (error: any) {
//       setSaveMessage({
//         type: "error",
//         message: error.message,
//       });
//     } finally {
//       setIsInstalling(false);
//     }
//   };

//   const closeModal = () => {
//     setShowAddModal(false);
//     setSelectedProduct(null);
//     setSelectedVariant("");
//     setCustomPriceInput("");
//     setProductVariants([]);
//     setSelectedVariantDetails(null);
//   };

//   const originalPriceNumber = parseFloat(
//     selectedVariantDetails?.price ?? selectedProduct?.price ?? "0",
//   );
//   const samplePriceNumber = parseFloat(customPriceInput || "0");
//   let discountPercent = 0;

//   if (originalPriceNumber > 0 && samplePriceNumber >= 0) {
//     discountPercent =
//       ((originalPriceNumber - samplePriceNumber) / originalPriceNumber) * 100;
//   }
//   discountPercent = Math.min(100, Math.max(0, discountPercent));

//   const storeName = shop?.replace(".myshopify.com", "");
//   const themeEditorUrl = storeName
//     ? `https://admin.shopify.com/store/${storeName}/themes/current/editor`
//     : "#";

//   if (loading || isLoading) {
//     return (
//       <Page title="Settings">
//         <Layout>
//           <Layout.Section>
//             <Card>
//               <Box padding="400">
//                 <Text as="p">Loading settings...</Text>
//               </Box>
//             </Card>
//           </Layout.Section>
//         </Layout>
//       </Page>
//     );
//   }

//   return (
//     <>
//       <Page
//         title="Settings"
//         // titleMetadata={
//         //   selectedTab === 0 ? (
//         //     <Button
//         //       onClick={() => setShowAddModal(true)}
//         //       icon={PlusCircleIcon}
//         //       variant="primary"
//         //     >
//         //       Add Custom Price
//         //     </Button>
//         //   ) : undefined
//         // }
//         primaryAction={
//           selectedTab === 0
//             ? {
//                 content: "Save Settings",
//                 icon: SaveIcon,
//                 onAction: saveGeneralSettings,
//                 disabled: savingGeneral,
//               }
//             : undefined
//         }
//       >
//         <Layout>
//           {/* Error State */}
//           {error && (
//             <Layout.Section>
//               <Banner
//                 title={error}
//                 tone="critical"
//                 action={{
//                   content: "Reload",
//                   onAction: () => window.location.reload(),
//                 }}
//               />
//             </Layout.Section>
//           )}

//           {/* Toast Message */}
//           {toastMessage && (
//             <Layout.Section>
//               <Banner tone="info" onDismiss={() => setToastMessage("")}>
//                 {toastMessage}
//               </Banner>
//             </Layout.Section>
//           )}

//           {/* Script Installation Message */}
//           {saveMessage && (
//             <Layout.Section>
//               <Banner
//                 title={saveMessage.message}
//                 // tone={saveMessage.type}
//                 onDismiss={() => setSaveMessage(null)}
//               />
//             </Layout.Section>
//           )}

//           {/* Tabs */}
//           <Layout.Section>
//             <Card>
//               <Tabs
//                 tabs={tabs}
//                 selected={selectedTab}
//                 onSelect={setSelectedTab}
//               >
//                 <Box padding="400">
//                   {selectedTab === 0 && (
//                     <BlockStack gap="400">
//                       <Banner
//                         title="When disabled, original price will be applied to sample products"
//                         tone="info"
//                       />
// {/*
//                       <Card>
//                         <BlockStack gap="200">
//                           <Text as="h2" variant="headingMd">
//                             Sample Product Status
//                           </Text>
//                           <RadioButton
//                             label="Disabled – Sample product pricing is turned off"
//                             checked={generalSettings.enabled === false}
//                             name="sample-enabled"
//                             onChange={() =>
//                               setGeneralSettings({
//                                 ...generalSettings,
//                                 enabled: false,
//                               })
//                             }
//                           />
//                           <RadioButton
//                             label="Enabled – Sample product pricing is active"
//                             checked={generalSettings.enabled === true}
//                             name="sample-enabled"
//                             onChange={() =>
//                               setGeneralSettings({
//                                 ...generalSettings,
//                                 enabled: true,
//                               })
//                             }
//                           />
//                         </BlockStack>
//                       </Card> */}
// <Card>
//   <BlockStack gap="200">
//     <Text as="h2" variant="headingMd">
//       Sample Product Status
//     </Text>
//     <RadioButton
//       label="Disabled – Sample product pricing is turned off"
//       checked={generalSettings.enabled === false}
//       name="sample-enabled"
//       onChange={() =>
//         setGeneralSettings({
//           ...generalSettings,
//           enabled: false,
//         })
//       }
//     />
//     <RadioButton
//       label="Enabled – Sample product pricing is active"
//       checked={generalSettings.enabled === true}
//       name="sample-enabled"
//       onChange={() =>
//         setGeneralSettings({
//           ...generalSettings,
//           enabled: true,
//         })
//       }
//     />
//   </BlockStack>
// </Card>
//                       {generalSettings.enabled && (
//                         <Card>
//                           <Box padding="400">
//                             <BlockStack gap="400">
//                               <BlockStack gap="200">
//                                 <Text as="p" variant="headingSm">
//                                   Default Pricing Method for All Products
//                                 </Text>

//                                 <RadioButton
//                                   label="Fixed Price"
//                                   helpText="All samples will have the same price"
//                                   checked={
//                                     generalSettings.pricingType === "FIXED"
//                                   }
//                                   name="pricing-type"
//                                   onChange={() =>
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       pricingType: "FIXED",
//                                     })
//                                   }
//                                 />

//                                 <RadioButton
//                                   label="Percentage Off"
//                                   helpText="All samples will apply same discount based on original price"
//                                   checked={
//                                     generalSettings.pricingType === "PERCENTAGE"
//                                   }
//                                   name="pricing-type"
//                                   onChange={() =>
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       pricingType: "PERCENTAGE",
//                                     })
//                                   }
//                                 />
//                               </BlockStack>

//                               {generalSettings.pricingType === "FIXED" && (
//                                 <TextField
//                                   label="Fixed Sample Price"
//                                   type="number"
//                                   prefix="$"
//                                   value={generalSettings.fixedPrice.toString()}
//                                   onChange={(value) =>
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       fixedPrice: parseFloat(value) || 0,
//                                     })
//                                   }
//                                   autoComplete="off"
//                                   min={0}
//                                   step={0.01}
//                                   helpText="This price will apply to all sample products unless overridden"
//                                 />
//                               )}

//                               {generalSettings.pricingType === "PERCENTAGE" && (
//                                 <TextField
//                                   label="Discount Percentage"
//                                   type="number"
//                                   suffix="%"
//                                   value={generalSettings.percentageOff.toString()}
//                                   onChange={(value) => {
//                                     const percent = Math.min(
//                                       100,
//                                       Math.max(0, parseFloat(value) || 0),
//                                     );
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       percentageOff: percent,
//                                     });
//                                   }}
//                                   autoComplete="off"
//                                   min={0}
//                                   max={100}
//                                   step={1}
//                                   helpText="Percentage discount applied to original product price"
//                                 />
//                               )}
//                             </BlockStack>
//                           </Box>
//                         </Card>
//                       )}

//                       {/* Custom Prices List */}
//                       {customPrices.length > 0 && (
//                         <Card>
//                           <BlockStack gap="200">
//                             <Text as="h2" variant="headingMd">
//                               Custom Sample Prices
//                             </Text>
//                             {/* Add a table or list of custom prices here */}
//                             <Text as="p" tone="subdued">
//                               {customPrices.length} custom price(s) configured
//                             </Text>
//                           </BlockStack>
//                         </Card>
//                       )}
//                     </BlockStack>
//                   )}

//                   {/* Theme Settings Tab */}
//                   {selectedTab === 1 && (
//                     <BlockStack gap="400">
//                       <Banner title="Pro Tip" tone="success">
//                         <p>
//                           Always preview changes in your theme editor before
//                           publishing. This ensures your storefront maintains a
//                           professional appearance.
//                         </p>
//                       </Banner>

//                       {/* Instructions */}
//                       <Card>
//                         <BlockStack gap="100">
//                           <Text as="p" variant="headingMd" alignment="center">
//                             Follow These Steps to Use the Sample App
//                           </Text>

//                           <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
//                             <Box padding="400">
//                               <BlockStack gap="200" align="center">
//                                 <Box
//                                   background="bg-surface-brand"
//                                   padding="400"
//                                   borderRadius="300"
//                                 >
//                                   <Text
//                                     variant="headingLg"
//                                     as="h2"
//                                     alignment="center"
//                                   >
//                                     1
//                                   </Text>
//                                 </Box>
//                                 <Text
//                                   variant="headingSm"
//                                   as="h4"
//                                   alignment="center"
//                                 >
//                                   Install Script
//                                 </Text>
//                                 <Text
//                                   as="p"
//                                   variant="bodyMd"
//                                   tone="subdued"
//                                   alignment="center"
//                                 >
//                                   Click &quot;Install Storefront Script&quot; to
//                                   add required functionality to your theme.
//                                 </Text>
//                               </BlockStack>
//                             </Box>

//                             <Box padding="400">
//                               <BlockStack gap="200" align="center">
//                                 <Box
//                                   background="bg-surface-brand"
//                                   padding="400"
//                                   borderRadius="300"
//                                 >
//                                   <Text
//                                     variant="headingLg"
//                                     as="h2"
//                                     alignment="center"
//                                   >
//                                     2
//                                   </Text>
//                                 </Box>
//                                 <Text
//                                   variant="headingSm"
//                                   as="h4"
//                                   alignment="center"
//                                 >
//                                   Customize Theme
//                                 </Text>
//                                 <Text
//                                   as="p"
//                                   variant="bodyMd"
//                                   tone="subdued"
//                                   alignment="center"
//                                 >
//                                   Open Theme Editor to adjust colors, buttons,
//                                   and styles to match your brand.
//                                 </Text>
//                               </BlockStack>
//                             </Box>

//                             <Box padding="400">
//                               <BlockStack gap="200" align="center">
//                                 <Box
//                                   background="bg-surface-brand"
//                                   padding="400"
//                                   borderRadius="300"
//                                 >
//                                   <Text
//                                     variant="headingLg"
//                                     as="h2"
//                                     alignment="center"
//                                   >
//                                     3
//                                   </Text>
//                                 </Box>
//                                 <Text
//                                   variant="headingSm"
//                                   as="h4"
//                                   alignment="center"
//                                 >
//                                   Add Products
//                                 </Text>
//                                 <Text
//                                   as="p"
//                                   variant="bodyMd"
//                                   tone="subdued"
//                                   alignment="center"
//                                 >
//                                   Configure sample products in your theme to see
//                                   the changes in action.
//                                 </Text>
//                               </BlockStack>
//                             </Box>
//                           </InlineGrid>
//                         </BlockStack>
//                       </Card>

//                       {/* Action Cards */}
//                       <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
//                         {/* Installation Card */}
//                         <Card>
//                           <BlockStack gap="400">
//                             <InlineStack align="space-between">
//                               <Text variant="headingMd" as="h3">
//                                 Script Installation
//                               </Text>
//                               {shop && <Badge tone="success">Ready</Badge>}
//                             </InlineStack>

//                             <Text as="p" variant="bodyMd">
//                               Install the necessary scripts to enable advanced
//                               features on your storefront.
//                             </Text>

//                             <Box
//                               padding="400"
//                               background="bg-surface-secondary"
//                               borderRadius="200"
//                             >
//                               <BlockStack gap="200">
//                                 <Text variant="headingSm" as="h4">
//                                   What gets installed:
//                                 </Text>
//                                 <BlockStack gap="100">
//                                   <InlineStack align="start" gap="200">
//                                     <Box
//                                       padding="100"
//                                       borderRadius="full"
//                                     ></Box>
//                                     <Text as="span" variant="bodyMd">
//                                       Custom button scripts
//                                     </Text>
//                                   </InlineStack>
//                                   <InlineStack align="start" gap="200">
//                                     <Box
//                                       padding="100"
//                                       borderRadius="full"
//                                     ></Box>
//                                     <Text as="span" variant="bodyMd">
//                                       Color theme controller
//                                     </Text>
//                                   </InlineStack>
//                                   <InlineStack align="start" gap="200">
//                                     <Box
//                                       padding="100"
//                                       borderRadius="full"
//                                     ></Box>
//                                     <Text as="span" variant="bodyMd">
//                                       Sample product integration
//                                     </Text>
//                                   </InlineStack>
//                                 </BlockStack>
//                               </BlockStack>
//                             </Box>

//                             <Button
//                               size="large"
//                               variant="primary"
//                               loading={isInstalling}
//                               disabled={!shop || isLoading}
//                               onClick={installScriptTag}
//                               fullWidth
//                             >
//                               {isInstalling
//                                 ? "Installing…"
//                                 : "Install Storefront Script"}
//                             </Button>
//                           </BlockStack>
//                         </Card>

//                         {/* Theme Editor Card */}
//                         <Card>
//                           <BlockStack gap="400">
//                             <InlineStack align="space-between">
//                               <Text variant="headingMd" as="h3">
//                                 Theme Customization
//                               </Text>
//                               {shop && <Badge tone="info">Available</Badge>}
//                             </InlineStack>

//                             <Text as="p" variant="bodyMd">
//                               Customize button labels, colors, and tones to
//                               match your brand identity.
//                             </Text>

//                             <Box
//                               padding="400"
//                               background="bg-surface-secondary"
//                               borderRadius="200"
//                             >
//                               <BlockStack gap="200">
//                                 <Text variant="headingSm" as="h4">
//                                   Customizable elements:
//                                 </Text>
//                                 <BlockStack gap="100">
//                                   <InlineStack gap="200" align="start">
//                                     <Badge tone="info">Button Labels</Badge>
//                                     <Text as="span" variant="bodyMd">
//                                       Customize call-to-action text
//                                     </Text>
//                                   </InlineStack>
//                                   <InlineStack gap="200" align="start">
//                                     <Badge tone="info">Color Scheme</Badge>
//                                     <Text as="span" variant="bodyMd">
//                                       Match your brand colors
//                                     </Text>
//                                   </InlineStack>
//                                   <InlineStack gap="200" align="start">
//                                     <Badge tone="info">Visual Tone</Badge>
//                                     <Text as="span" variant="bodyMd">
//                                       Set button styles and effects
//                                     </Text>
//                                   </InlineStack>
//                                 </BlockStack>
//                               </BlockStack>
//                             </Box>

//                             <Button
//                               size="large"
//                               variant="primary"
//                               external
//                               url={themeEditorUrl}
//                               disabled={!shop || isLoading}
//                               fullWidth
//                             >
//                               Open Theme Editor
//                             </Button>
//                           </BlockStack>
//                         </Card>
//                       </InlineGrid>
//                     </BlockStack>
//                   )}
//                 </Box>
//               </Tabs>
//             </Card>
//           </Layout.Section>

//           {/* Footer */}
//           <Layout.Section>
//             <Box padding="400">
//               <Text as="p" variant="bodySm" tone="subdued" alignment="center">
//                 Need help? Contact our support team or refer to the
//                 documentation.
//               </Text>
//             </Box>
//           </Layout.Section>
//         </Layout>
//       </Page>

//       {/* Add Custom Price Modal */}
//       <Modal
//         open={showAddModal}
//         onClose={closeModal}
//         title="Add Custom Sample Price"
//         size="large"
//         primaryAction={{
//           content: "Save Custom Price",
//           onAction: addCustomPrice,
//           disabled: !selectedProduct || !customPriceInput || addingCustomPrice,
//           loading: addingCustomPrice,
//         }}
//         secondaryActions={[
//           {
//             content: "Cancel",
//             onAction: closeModal,
//           },
//         ]}
//       >
//         <Modal.Section>
//           <BlockStack gap="400">
//             <Card>
//               <BlockStack gap="200">
//                 <Button onClick={selectProduct} fullWidth>
//                   {selectedProduct ? "Change Product" : "Select Product"}
//                 </Button>

//                 {selectedProduct && (
//                   <Box
//                     background="bg-surface-secondary"
//                     padding="300"
//                     borderRadius="200"
//                   >
//                     <InlineStack align="start" gap="300" blockAlign="center">
//                       {selectedProduct.image && (
//                         <Thumbnail
//                           source={selectedProduct.image}
//                           alt={selectedProduct.title}
//                           size="medium"
//                         />
//                       )}
//                       <BlockStack gap="100">
//                         <Text variant="headingSm" as="h3">
//                           {selectedProduct.title}
//                         </Text>
//                         <Text as="p" tone="subdued">
//                           Status:{" "}
//                           <Badge
//                             tone={
//                               selectedProduct.status === "active"
//                                 ? "success"
//                                 : "warning"
//                             }
//                           >
//                             {selectedProduct.status}
//                           </Badge>
//                         </Text>
//                         <Text as="p" tone="subdued">
//                           Original Price: {selectedProduct.price}
//                         </Text>
//                       </BlockStack>
//                     </InlineStack>
//                   </Box>
//                 )}
//               </BlockStack>
//             </Card>

//             {selectedProduct && productVariants.length > 1 && (
//               <Card>
//                 <Select
//                   label="Select Variant (Optional)"
//                   options={[
//                     { label: "All Variants (Apply to all)", value: "" },
//                     ...productVariants.map((variant) => ({
//                       label: `${variant.title} - $${variant.price}${variant.sku ? ` (SKU: ${variant.sku})` : ""}`,
//                       value: variant.id,
//                     })),
//                   ]}
//                   value={selectedVariant}
//                   onChange={handleVariantSelect}
//                   helpText="Leave empty to apply sample price to all variants"
//                 />
//               </Card>
//             )}

//             {selectedProduct && (
//               <Card>
//                 <BlockStack gap="200">
//                   <TextField
//                     label="Sample Price"
//                     type="number"
//                     value={customPriceInput}
//                     onChange={setCustomPriceInput}
//                     autoComplete="off"
//                     min={0}
//                     step={0.01}
//                     helpText={
//                       selectedVariantDetails
//                         ? `Original price for ${selectedVariantDetails.title}: ${selectedVariantDetails.price}`
//                         : `Original price: ${selectedProduct.price}`
//                     }
//                   />

//                   {customPriceInput && (
//                     <Box
//                       background="bg-surface-secondary"
//                       padding="300"
//                       borderRadius="200"
//                     >
//                       <BlockStack gap="100">
//                         <Text variant="headingSm" as="h3">
//                           Price Summary
//                         </Text>
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Product:
//                           </Text>
//                           <Text as="span" fontWeight="bold">
//                             {selectedProduct.title}
//                           </Text>
//                         </InlineStack>
//                         {selectedVariantDetails && (
//                           <InlineStack align="space-between">
//                             <Text as="span" tone="subdued">
//                               Variant:
//                             </Text>
//                             <Text as="span">
//                               {selectedVariantDetails.title}
//                             </Text>
//                           </InlineStack>
//                         )}
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Original Price:
//                           </Text>
//                           <Text as="span">
//                             {selectedVariantDetails
//                               ? selectedVariantDetails.price
//                               : selectedProduct.price}
//                           </Text>
//                         </InlineStack>
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Sample Price:
//                           </Text>
//                           <Text as="span" fontWeight="bold" tone="success">
//                             {parseFloat(customPriceInput).toFixed(2)}
//                           </Text>
//                         </InlineStack>
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Discount:
//                           </Text>
//                           <Text as="span" tone="success">
//                             {discountPercent.toFixed(0)}% off
//                           </Text>
//                         </InlineStack>
//                       </BlockStack>
//                     </Box>
//                   )}
//                 </BlockStack>
//               </Card>
//             )}
//           </BlockStack>
//         </Modal.Section>
//       </Modal>
//     </>
//   );
// }
// "use client";

// import {
//   Page,
//   Layout,
//   Card,
//   Text,
//   ChoiceList,
//   TextField,
//   DataTable,
//   Modal,
//   Button,
//   Banner,
//   Badge,
//   Tabs,
//   Box,
//   BlockStack,
//   InlineStack,
//   IndexTable,
//   useIndexResourceState,
//   Thumbnail,
//   Select,
//   InlineGrid,
//   Icon,
//   Divider,
//   CalloutCard,
// } from "@shopify/polaris";
// import { PlusCircleIcon, SaveIcon, DeleteIcon } from "@shopify/polaris-icons";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { RadioButton } from "@shopify/polaris";
// import { useState, useEffect, useCallback, useRef } from "react";

// // Types
// interface GeneralSettings {
//   enabled: boolean;
//   pricingType: "FIXED" | "PERCENTAGE";
//   fixedPrice: number;
//   percentageOff: number;
// }

// interface ProductSelection {
//   productId: string;
//   title: string;
//   image: string;
//   price: string;
//   status: string;
// }

// interface CustomPrice {
//   id: string;
//   productId: string;
//   variantId: string | null;
//   productTitle: string;
//   variantTitle?: string;
//   originalPrice: number;
//   customPrice: number;
//   productImage?: string;
//   productStatus?: string;
// }

// export default function SettingsPage() {
//   const app = useAppBridge();

//   // Tab State
//   const [selectedTab, setSelectedTab] = useState(0);

//   // Shop State
//   const [shop, setShop] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Toast State
//   const [toastMessage, setToastMessage] = useState<string>("");

//   // General Settings State
//   const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
//     enabled: false,
//     pricingType: "FIXED",
//     fixedPrice: 0,
//     percentageOff: 0,
//   });

//   // Custom Pricing State
//   const [customPrices, setCustomPrices] = useState<CustomPrice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [savingGeneral, setSavingGeneral] = useState(false);

//   // Modal State
//   const [showAddModal, setShowAddModal] = useState(false);

//   // Product Picker State
//   const [selectedProduct, setSelectedProduct] =
//     useState<ProductSelection | null>(null);
//   const [selectedVariant, setSelectedVariant] = useState<string>("");
//   const [customPriceInput, setCustomPriceInput] = useState<string>("");
//   const [productVariants, setProductVariants] = useState<any[]>([]);
//   const [selectedVariantDetails, setSelectedVariantDetails] =
//     useState<any>(null);
//   const [addingCustomPrice, setAddingCustomPrice] = useState(false);

//   // Script Installation State
//   const [saveMessage, setSaveMessage] = useState<{
//     type: "success" | "error";
//     message: string;
//   } | null>(null);
//   const [isInstalling, setIsInstalling] = useState(false);
//   const [scriptInstalled, setScriptInstalled] = useState(false);
//   // UI Settings State
//   const [buttonText, setButtonText] = useState("Get Sample");
//   const [bgColor, setBgColor] = useState("#000000");
//   const [textColor, setTextColor] = useState("#ffffff");
//   const [hoverColor, setHoverColor] = useState("#333333");
//   const [borderRadius, setBorderRadius] = useState("6");
//   const [position, setPosition] = useState("right");
//   const [savingUi, setSavingUi] = useState(false);
//   // Tabs configuration
//   const tabs = [
//     {
//       id: "sample-pricing",
//       content: "Sample Settings",
//       accessibilityLabel: "Sample pricing settings",
//       panelID: "sample-pricing-panel",
//     },
//     {
//       id: "theme-settings",
//       content: "Theme Settings",
//       accessibilityLabel: "Theme and script settings",
//       panelID: "theme-settings-panel",
//     },
//   ];

//   useEffect(() => {
//     if (!app) return;

//     setIsLoading(true);
//     const timer = setTimeout(() => {
//       const shopFromConfig = (app as any)?.config?.shop;

//       if (shopFromConfig) {
//         setShop(shopFromConfig);
//         setError(null);
//       } else if (typeof window !== "undefined") {
//         setShop(window.location.hostname);
//       } else {
//         setError("Unable to retrieve shop info. Please reload the app.");
//       }
//       setIsLoading(false);
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [app]);

//   const showToast = (message: string) => {
//     setToastMessage(message);
//     setTimeout(() => setToastMessage(""), 3000);
//   };

//   const normalizeProductId = (gid: string): string => {
//     return gid.replace("gid://shopify/Product/", "");
//   };

//   const normalizeVariantId = (gid: string): string => {
//     return gid.replace("gid://shopify/ProductVariant/", "");
//   };

//   const selectProduct = async () => {
//     try {
//       if (!(window as any).shopify || !(window as any).shopify.resourcePicker) {
//         showToast("Shopify resource picker is not available");
//         return;
//       }

//       const pickerResult = await (window as any).shopify.resourcePicker({
//         type: "product",
//         multiple: false,
//       });

//       const product = pickerResult?.selection?.[0];
//       if (!product) return;

//       const parsedProduct: ProductSelection = {
//         productId: normalizeProductId(product.id),
//         title: product.title,
//         image: product.images?.[0]?.originalSrc || "",
//         price: product.variants?.[0]?.price || "0",
//         status: product.status || "active",
//       };

//       setSelectedProduct(parsedProduct);

//       if (product.variants) {
//         const variants = product.variants.map((variant: any) => ({
//           id: normalizeVariantId(variant.id),
//           title: variant.title,
//           price: variant.price,
//           sku: variant.sku || "",
//           inventoryQuantity: variant.inventoryQuantity || 0,
//         }));
//         setProductVariants(variants);

//         if (variants.length === 1) {
//           handleVariantSelect(variants[0].id);
//         } else {
//           setSelectedVariant("");
//           setSelectedVariantDetails(null);
//         }
//       }

//       const originalPrice = parseFloat(parsedProduct.price);
//       setCustomPriceInput((originalPrice * 0.8).toFixed(2));
//     } catch (error) {
//       console.error("Error in product picker:", error);
//       showToast("Failed to open product picker");
//     }
//   };
//   const saveUiSettings = async () => {
//     try {
//       setSavingUi(true);

//       await fetch("/api/settings/ui", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           buttonText,
//           bgColor,
//           textColor,
//           hoverColor,
//           borderRadius: Number(borderRadius),
//           position,
//         }),
//       });

//       showToast("Theme UI settings saved");
//     } catch (e) {
//       console.error(e);
//       showToast("Failed to save UI settings");
//     } finally {
//       setSavingUi(false);
//     }
//   };

//   const handleVariantSelect = (variantId: string) => {
//     setSelectedVariant(variantId);
//     const variant = productVariants.find((v) => v.id === variantId);
//     setSelectedVariantDetails(variant);

//     if (variant && customPriceInput) {
//       const originalPrice = parseFloat(variant.price);
//       const currentCustomPrice = parseFloat(customPriceInput);
//       const originalProductPrice = parseFloat(selectedProduct?.price || "0");

//       if (originalProductPrice > 0) {
//         const discountPercentage =
//           (originalProductPrice - currentCustomPrice) / originalProductPrice;
//         const newCustomPrice = originalPrice * (1 - discountPercentage);
//         setCustomPriceInput(newCustomPrice.toFixed(2));
//       }
//     }
//   };

//   const loadAllSettings = useCallback(async (shopDomain: string) => {
//     try {
//       const res = await fetch(`/api/settings?shop=${shopDomain}`);
//       const json = await res.json();

//       if (json.success && json.data) {
//         setGeneralSettings({
//           enabled: json.data.enabled,
//           pricingType: json.data.pricingType || "FIXED",
//           fixedPrice: Number(json.data.fixedPrice || 0),
//           percentageOff: Number(json.data.percentageOff || 0),
//         });

//         if (json.data.customPrices) {
//           const transformedPrices = await transformCustomPrices(
//             json.data.customPrices,
//           );
//           setCustomPrices(transformedPrices);
//         }
//       }
//     } catch (e) {
//       console.error("loadAllSettings error:", e);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!shop) return;
//     loadAllSettings(shop);
//   }, [shop, loadAllSettings]);

//   const transformCustomPrices = async (
//     prices: any[],
//   ): Promise<CustomPrice[]> => {
//     return prices.map((price) => ({
//       id: price.id || Math.random().toString(),
//       productId: price.productId,
//       variantId: price.variantId,
//       productTitle: price.productTitle || `Product ${price.productId}`,
//       variantTitle: price.variantTitle,
//       originalPrice: price.originalPrice || 0,
//       customPrice: price.customPrice || price.price,
//       productImage: price.productImage,
//       productStatus: price.productStatus,
//     }));
//   };

//   const installScriptTag = async () => {
//     // Skip if already installed
//     if (scriptInstalled) {
//       showToast("Script already installed");
//       return;
//     }

//     try {
//       setIsInstalling(true);
//       setSaveMessage(null);

//       const shop = (app as any)?.config?.shop;

//       if (!shop) {
//         throw new Error("Shop not found");
//       }

//       const res = await fetch("/api/script-tag", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ shop }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.error || "Failed to install script");
//       }

//       setSaveMessage({
//         type: "success",
//         message: "🎉 Storefront script installed successfully!",
//       });

//       // Mark as installed
//       setScriptInstalled(true);
//       showToast("Script installed successfully!");
//     } catch (error: any) {
//       setSaveMessage({
//         type: "error",
//         message: error.message,
//       });
//       showToast(error.message);
//     } finally {
//       setIsInstalling(false);
//     }
//   };

//   const saveGeneralSettings = async () => {
//     setSavingGeneral(true);
//     try {
//       const response = await fetch(`/api/settings/global?shop=${shop}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "general",
//           data: generalSettings,
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         showToast("General settings saved successfully");

//         // Check if we just enabled the settings and script hasn't been installed yet
//         if (generalSettings.enabled && !scriptInstalled) {
//           // Small delay to ensure first toast shows properly
//           setTimeout(() => {
//             installScriptTag();
//           }, 500);
//         }
//       } else {
//         showToast("Failed to save general settings");
//       }
//     } catch (error) {
//       console.error("Failed to save settings:", error);
//       showToast("Failed to save general settings");
//     } finally {
//       setSavingGeneral(false);
//     }
//   };

//   const handleEnableChange = (enabled: boolean) => {
//     setGeneralSettings({
//       ...generalSettings,
//       enabled: enabled,
//     });

//     // Optional: Uncomment this if you want to install script immediately when toggling (without saving)
//     // if (enabled && !scriptInstalled && shop) {
//     //   installScriptTag();
//     // }
//   };

//   const addCustomPrice = async () => {
//     if (!selectedProduct || !customPriceInput) {
//       showToast("Please select a product and enter a price");
//       return;
//     }

//     setAddingCustomPrice(true);
//     try {
//       const customPriceData = {
//         productId: selectedProduct.productId,
//         variantId: selectedVariant || null,
//         productTitle: selectedProduct.title,
//         variantTitle: selectedVariantDetails?.title,
//         title: selectedProduct.title,
//         image: selectedProduct.image,
//         originalPrice: selectedVariantDetails
//           ? parseFloat(selectedVariantDetails.price)
//           : parseFloat(selectedProduct.price),
//         customPrice: parseFloat(customPriceInput),
//         variants: selectedVariant ? undefined : productVariants,
//         productImage: selectedProduct.image,
//         productStatus: selectedProduct.status,
//       };

//       const response = await fetch(`/api/settings/custom?shop=${shop}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "custom",
//           data: customPriceData,
//         }),
//       });

//       const data = await response.json();
//       if (data.alreadyExists) {
//         showToast("Same sample price already applied");
//         closeModal();
//         return;
//       }
//       if (data.success) {
//         if (!selectedVariant) {
//           showToast("Sample price applied to all variants");
//           closeModal();
//           return;
//         }

//         const newPrice: CustomPrice = {
//           id: data.data?.id || Math.random().toString(),
//           ...customPriceData,
//         };

//         setCustomPrices([...customPrices, newPrice]);
//         closeModal();
//         showToast("Custom price added successfully");
//       }

//       if (data.success && data.appliedToAll) {
//         showToast(`Sample price applied to ${data.variantsCount} variants`);
//         closeModal();
//         return;
//       } else {
//         showToast("Failed to add custom price");
//       }
//     } catch (error) {
//       console.error("Failed to add custom price:", error);
//       showToast("Failed to add custom price");
//     } finally {
//       setAddingCustomPrice(false);
//     }
//   };

//   const closeModal = () => {
//     setShowAddModal(false);
//     setSelectedProduct(null);
//     setSelectedVariant("");
//     setCustomPriceInput("");
//     setProductVariants([]);
//     setSelectedVariantDetails(null);
//   };

//   const originalPriceNumber = parseFloat(
//     selectedVariantDetails?.price ?? selectedProduct?.price ?? "0",
//   );
//   const samplePriceNumber = parseFloat(customPriceInput || "0");
//   let discountPercent = 0;

//   if (originalPriceNumber > 0 && samplePriceNumber >= 0) {
//     discountPercent =
//       ((originalPriceNumber - samplePriceNumber) / originalPriceNumber) * 100;
//   }
//   discountPercent = Math.min(100, Math.max(0, discountPercent));

//   const storeName = shop?.replace(".myshopify.com", "");
//   const themeEditorUrl = storeName
//     ? `https://admin.shopify.com/store/${storeName}/themes/current/editor`
//     : "#";

//   if (loading || isLoading) {
//     return (
//       <Page title="Settings">
//         <Layout>
//           <Layout.Section>
//             <Card>
//               <Box padding="400">
//                 <Text as="p">Loading settings...</Text>
//               </Box>
//             </Card>
//           </Layout.Section>
//         </Layout>
//       </Page>
//     );
//   }

//   return (
//     <>
//       <Page
//         title="Settings"
//         primaryAction={
//           selectedTab === 0
//             ? {
//                 content: "Save Settings",
//                 icon: SaveIcon,
//                 onAction: saveGeneralSettings,
//                 disabled: savingGeneral,
//               }
//             : undefined
//         }
//       >
//         <Layout>
//           {/* Error State */}
//           {error && (
//             <Layout.Section>
//               <Banner
//                 title={error}
//                 tone="critical"
//                 action={{
//                   content: "Reload",
//                   onAction: () => window.location.reload(),
//                 }}
//               />
//             </Layout.Section>
//           )}

//           {/* Toast Message */}
//           {toastMessage && (
//             <Layout.Section>
//               <Banner tone="info" onDismiss={() => setToastMessage("")}>
//                 {toastMessage}
//               </Banner>
//             </Layout.Section>
//           )}

//           {/* Script Installation Message */}
//           {saveMessage && (
//             <Layout.Section>
//               <Banner
//                 title={saveMessage.message}
//                 // tone={saveMessage.type}
//                 onDismiss={() => setSaveMessage(null)}
//               />
//             </Layout.Section>
//           )}

//           {/* Tabs */}
//           <Layout.Section>
//             <Card>
//               <Tabs
//                 tabs={tabs}
//                 selected={selectedTab}
//                 onSelect={setSelectedTab}
//               >
//                 <Box padding="400">
//                   {selectedTab === 0 && (
//                     <BlockStack gap="400">
//                       <Banner
//                         title="When disabled, All the setting will be disabled"
//                         tone="info"
//                       />
//                       <Card>
//                         <BlockStack gap="100">
//                           <Text as="p" variant="headingMd" alignment="center">
//                             Follow These Steps to Use the Sample App
//                           </Text>

//                           <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
//                             <Box padding="400">
//                               <BlockStack gap="200" align="center">
//                                 <Box
//                                   background="bg-surface-brand"
//                                   padding="400"
//                                   borderRadius="300"
//                                 >
//                                   <Text
//                                     variant="headingLg"
//                                     as="h2"
//                                     alignment="center"
//                                   >
//                                     1
//                                   </Text>
//                                 </Box>
//                                 <Text
//                                   variant="headingSm"
//                                   as="h4"
//                                   alignment="center"
//                                 >
//                                   Enable Settings{" "}
//                                 </Text>
//                                 <Text
//                                   as="p"
//                                   variant="bodyMd"
//                                   tone="subdued"
//                                   alignment="center"
//                                 >
//                                   Click &quot;Enable Settings then all settings
//                                   will enabled with your entered price
//                                 </Text>
//                               </BlockStack>
//                             </Box>

//                             <Box padding="400">
//                               <BlockStack gap="200" align="center">
//                                 <Box
//                                   background="bg-surface-brand"
//                                   padding="400"
//                                   borderRadius="300"
//                                 >
//                                   <Text
//                                     variant="headingLg"
//                                     as="h2"
//                                     alignment="center"
//                                   >
//                                     2
//                                   </Text>
//                                 </Box>
//                                 <Text
//                                   variant="headingSm"
//                                   as="h4"
//                                   alignment="center"
//                                 >
//                                   Customize Theme
//                                 </Text>
//                                 <Text
//                                   as="p"
//                                   variant="bodyMd"
//                                   tone="subdued"
//                                   alignment="center"
//                                 >
//                                   Open Theme Editor to adjust colors, buttons,
//                                   and styles to match your brand.
//                                 </Text>
//                               </BlockStack>
//                             </Box>

//                             <Box padding="400">
//                               <BlockStack gap="200" align="center">
//                                 <Box
//                                   background="bg-surface-brand"
//                                   padding="400"
//                                   borderRadius="300"
//                                 >
//                                   <Text
//                                     variant="headingLg"
//                                     as="h2"
//                                     alignment="center"
//                                   >
//                                     3
//                                   </Text>
//                                 </Box>
//                                 <Text
//                                   variant="headingSm"
//                                   as="h4"
//                                   alignment="center"
//                                 >
//                                   Add Products
//                                 </Text>
//                                 <Text
//                                   as="p"
//                                   variant="bodyMd"
//                                   tone="subdued"
//                                   alignment="center"
//                                 >
//                                   Configure sample products in your theme to see
//                                   the changes in action.
//                                 </Text>
//                               </BlockStack>
//                             </Box>
//                           </InlineGrid>
//                         </BlockStack>
//                       </Card>
//                       <Card>
//                         <BlockStack gap="200">
//                           <Text as="h2" variant="headingMd">
//                             Sample Product Status
//                           </Text>
//                           <RadioButton
//                             label="Disabled – Sample product pricing is turned off"
//                             checked={generalSettings.enabled === false}
//                             name="sample-enabled"
//                             onChange={() => handleEnableChange(false)}
//                           />
//                           <RadioButton
//                             label="Enabled – Sample product pricing is active"
//                             checked={generalSettings.enabled === true}
//                             name="sample-enabled"
//                             onChange={() => handleEnableChange(true)}
//                           />
//                         </BlockStack>
//                       </Card>

//                       {generalSettings.enabled && (
//                         <Card>
//                           <Box padding="400">
//                             <BlockStack gap="400">
//                               <BlockStack gap="200">
//                                 <Text as="p" variant="headingSm">
//                                   Default Pricing Method for All Products
//                                 </Text>

//                                 <RadioButton
//                                   label="Fixed Price"
//                                   helpText="All samples will have the same price"
//                                   checked={
//                                     generalSettings.pricingType === "FIXED"
//                                   }
//                                   name="pricing-type"
//                                   onChange={() =>
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       pricingType: "FIXED",
//                                     })
//                                   }
//                                 />

//                                 <RadioButton
//                                   label="Percentage Off"
//                                   helpText="All samples will apply same discount based on original price"
//                                   checked={
//                                     generalSettings.pricingType === "PERCENTAGE"
//                                   }
//                                   name="pricing-type"
//                                   onChange={() =>
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       pricingType: "PERCENTAGE",
//                                     })
//                                   }
//                                 />
//                               </BlockStack>

//                               {generalSettings.pricingType === "FIXED" && (
//                                 <TextField
//                                   label="Fixed Sample Price"
//                                   type="number"
//                                   prefix="$"
//                                   value={generalSettings.fixedPrice.toString()}
//                                   onChange={(value) =>
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       fixedPrice: parseFloat(value) || 0,
//                                     })
//                                   }
//                                   autoComplete="off"
//                                   min={0}
//                                   step={0.01}
//                                   helpText="This price will apply to all sample products unless overridden"
//                                 />
//                               )}

//                               {generalSettings.pricingType === "PERCENTAGE" && (
//                                 <TextField
//                                   label="Discount Percentage"
//                                   type="number"
//                                   suffix="%"
//                                   value={generalSettings.percentageOff.toString()}
//                                   onChange={(value) => {
//                                     const percent = Math.min(
//                                       100,
//                                       Math.max(0, parseFloat(value) || 0),
//                                     );
//                                     setGeneralSettings({
//                                       ...generalSettings,
//                                       percentageOff: percent,
//                                     });
//                                   }}
//                                   autoComplete="off"
//                                   min={0}
//                                   max={100}
//                                   step={1}
//                                   helpText="Percentage discount applied to original product price"
//                                 />
//                               )}
//                             </BlockStack>
//                           </Box>
//                         </Card>
//                       )}

//                       {/* Custom Prices List */}
//                       {customPrices.length > 0 && (
//                         <Card>
//                           <BlockStack gap="200">
//                             <Text as="h2" variant="headingMd">
//                               Custom Sample Prices
//                             </Text>
//                             {/* Add a table or list of custom prices here */}
//                             <Text as="p" tone="subdued">
//                               {customPrices.length} custom price(s) configured
//                             </Text>
//                           </BlockStack>
//                         </Card>
//                       )}
//                     </BlockStack>
//                   )}

//                   {/* Theme Settings Tab */}
//                   {selectedTab === 1 && (
//                     <BlockStack gap="400">
//                       <Banner title="Pro Tip" tone="success">
//                         <p>
//                           Always preview changes in your theme editor before
//                           publishing. This ensures your storefront maintains a
//                           professional appearance.
//                         </p>
//                       </Banner>

//                       {/* Instructions */}

//                       {/* Action Cards */}
//                       {/* <InlineGrid columns={{ xs: 1, md: 2 }} gap="400"> */}
//                       {/* Installation Card */}
//                       {/* <Card>
//                           <BlockStack gap="400">
//                             <InlineStack align="space-between">
//                               <Text variant="headingMd" as="h3">
//                                 Script Installation
//                               </Text>
//                               {scriptInstalled ? (
//                                 <Badge tone="success">Installed</Badge>
//                               ) : (
//                                 <Badge tone="warning">Not Installed</Badge>
//                               )}
//                             </InlineStack>

//                             <Text as="p" variant="bodyMd">
//                               Install the necessary scripts to enable advanced
//                               features on your storefront.
//                             </Text>

//                             <Box
//                               padding="400"
//                               background="bg-surface-secondary"
//                               borderRadius="200"
//                             >
//                               <BlockStack gap="200">
//                                 <Text variant="headingSm" as="h4">
//                                   What gets installed:
//                                 </Text>
//                                 <BlockStack gap="100">
//                                   <InlineStack align="start" gap="200">
//                                     <Box
//                                       padding="100"
//                                       borderRadius="full"
//                                     ></Box>
//                                     <Text as="span" variant="bodyMd">
//                                       Custom button scripts
//                                     </Text>
//                                   </InlineStack>
//                                   <InlineStack align="start" gap="200">
//                                     <Box
//                                       padding="100"
//                                       borderRadius="full"
//                                     ></Box>
//                                     <Text as="span" variant="bodyMd">
//                                       Color theme controller
//                                     </Text>
//                                   </InlineStack>
//                                   <InlineStack align="start" gap="200">
//                                     <Box
//                                       padding="100"
//                                       borderRadius="full"
//                                     ></Box>
//                                     <Text as="span" variant="bodyMd">
//                                       Sample product integration
//                                     </Text>
//                                   </InlineStack>
//                                 </BlockStack>
//                               </BlockStack>
//                             </Box>

//                             <Button
//                               size="large"
//                               variant="primary"
//                               loading={isInstalling}
//                               disabled={!shop || isLoading || scriptInstalled}
//                               onClick={installScriptTag}
//                               fullWidth
//                             >
//                               {isInstalling
//                                 ? "Installing…"
//                                 : scriptInstalled
//                                   ? "Script Installed"
//                                   : "Install Storefront Script"}
//                             </Button>
//                           </BlockStack>
//                         </Card> */}

//                       {/* Theme Editor Card */}
//                       {/* <Card>
//                         <BlockStack gap="400">
//                           <InlineStack align="space-between">
//                             <Text variant="headingMd" as="h3">
//                               Theme Customization
//                             </Text>
//                             {shop && <Badge tone="info">Available</Badge>}
//                           </InlineStack>

//                           <Text as="p" variant="bodyMd">
//                             Customize button labels, colors, and tones to match
//                             your brand identity.
//                           </Text>

//                           <Box
//                             padding="400"
//                             background="bg-surface-secondary"
//                             borderRadius="200"
//                           >
//                             <BlockStack gap="200">
//                               <Text variant="headingSm" as="h4">
//                                 Customizable elements:
//                               </Text>
//                               <BlockStack gap="100">
//                                 <InlineStack gap="200" align="start">
//                                   <Badge tone="info">Button Labels</Badge>
//                                   <Text as="span" variant="bodyMd">
//                                     Customize call-to-action text
//                                   </Text>
//                                 </InlineStack>
//                                 <InlineStack gap="200" align="start">
//                                   <Badge tone="info">Color Scheme</Badge>
//                                   <Text as="span" variant="bodyMd">
//                                     Match your brand colors
//                                   </Text>
//                                 </InlineStack>
//                                 <InlineStack gap="200" align="start">
//                                   <Badge tone="info">Visual Tone</Badge>
//                                   <Text as="span" variant="bodyMd">
//                                     Set button styles and effects
//                                   </Text>
//                                 </InlineStack>
//                               </BlockStack>
//                             </BlockStack>
//                           </Box>

//                           <Button
//                             size="large"
//                             variant="primary"
//                             external
//                             url={themeEditorUrl}
//                             disabled={!shop || isLoading}
//                             fullWidth
//                           >
//                             Open Theme Editor
//                           </Button>
//                         </BlockStack>
//                       </Card> */}
//                       {/* <Card>
//                         <BlockStack gap="400">
//                           <Text as="p" variant="headingMd">
//                             Theme Customization
//                           </Text>

//                           <TextField
//                             label="Button Text"
//                             value={buttonText}
//                             onChange={setButtonText}
//                             autoComplete="off"
//                           />

//                           <InlineStack gap="300">
//                             <TextField
//                               autoComplete=""
//                               label="Background Color"
//                               value={bgColor}
//                               onChange={setBgColor}
//                             />

//                             <TextField
//                               autoComplete=""
//                               label="Text Color"
//                               value={textColor}
//                               onChange={setTextColor}
//                             />
//                           </InlineStack>

//                           <TextField
//                             autoComplete=""
//                             label="Hover Color"
//                             value={hoverColor}
//                             onChange={setHoverColor}
//                           />

//                           <TextField
//                             autoComplete=""
//                             label="Border Radius (px)"
//                             type="number"
//                             value={borderRadius}
//                             onChange={setBorderRadius}
//                           />

//                           <Select
//                             label="Button Position"
//                             options={[
//                               { label: "Bottom Right", value: "right" },
//                               { label: "Bottom Left", value: "left" },
//                             ]}
//                             value={position}
//                             onChange={setPosition}
//                           />

//                           <Button
//                             variant="primary"
//                             loading={savingUi}
//                             onClick={saveUiSettings}
//                           >
//                             Save Theme Settings
//                           </Button>

//                           <Divider />

//                           <Button
//                             size="large"
//                             variant="primary"
//                             external
//                             url={themeEditorUrl}
//                             disabled={!shop || isLoading}
//                             fullWidth
//                           >
//                             Open Theme Editor
//                           </Button>
//                         </BlockStack>
//                       </Card> */}
//                       <Card>
//                         <BlockStack gap="400">
//                           {/* Header with preview badge */}
//                           <InlineStack
//                             align="space-between"
//                             blockAlign="center"
//                           >
//                             <Text as="h2" variant="headingMd">
//                               Theme Customization
//                             </Text>
//                             <Badge tone="success">Live Preview</Badge>
//                           </InlineStack>

//                           {/* Live Button Preview */}
//                           <Box
//                             padding="400"
//                             background="bg-surface-secondary"
//                             borderRadius="200"
//                           >
//                             <BlockStack gap="300" align="center">
//                               <Text
//                                 as="p"
//                                 variant="headingSm"
//                                 alignment="center"
//                               >
//                                 Preview
//                               </Text>
//                               <Box
//                                 padding="200"
//                                 background="bg-surface"
//                                 borderRadius="200"
//                                 width="100%"
//                               >
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     justifyContent: "center",
//                                     alignItems: "center",
//                                     minHeight: "80px",
//                                   }}
//                                 >
//                                   <button
//                                     style={{
//                                       backgroundColor: bgColor,
//                                       color: textColor,
//                                       padding: "10px 20px",
//                                       border: "none",
//                                       borderRadius: `${borderRadius}px`,
//                                       cursor: "pointer",
//                                       fontSize: "14px",
//                                       fontWeight: "500",
//                                       transition: "background-color 0.3s ease",
//                                     }}
//                                     onMouseEnter={(e) => {
//                                       e.currentTarget.style.backgroundColor =
//                                         hoverColor;
//                                     }}
//                                     onMouseLeave={(e) => {
//                                       e.currentTarget.style.backgroundColor =
//                                         bgColor;
//                                     }}
//                                   >
//                                     {buttonText || "Get Sample"}
//                                   </button>
//                                 </div>
//                               </Box>
//                             </BlockStack>
//                           </Box>

//                           {/* Settings Sections */}
//                           <Box
//                             padding="400"
//                             background="bg-surface-secondary"
//                             borderRadius="200"
//                           >
//                             <BlockStack gap="400">
//                               {/* Button Text */}
//                               <BlockStack gap="200">
//                                 <InlineStack gap="200" blockAlign="center">
//                                   <Text as="h3" variant="headingSm">
//                                     Button Configuration
//                                   </Text>
//                                 </InlineStack>
//                                 <TextField
//                                   label="Button Text"
//                                   value={buttonText}
//                                   onChange={setButtonText}
//                                   autoComplete="off"
//                                   helpText="Customize the call-to-action text"
//                                 />
//                               </BlockStack>

//                               {/* Color Settings */}
//                               <BlockStack gap="200">
//                                 <InlineStack gap="200" blockAlign="center">
//                                   <Text as="h3" variant="headingSm">
//                                     Color Scheme
//                                   </Text>
//                                 </InlineStack>

//                                 <BlockStack gap="300">
//                                   {/* Background Color */}
//                                   <div style={{ position: "relative" }}>
//                                     <TextField
//                                       label="Background Color"
//                                       value={bgColor}
//                                       onChange={setBgColor}
//                                       helpText="Hex color (e.g. #000000)"
//                                       autoComplete="off"
//                                       prefix={
//                                         <div
//                                           style={{
//                                             width: "20px",
//                                             height: "20px",
//                                             backgroundColor: bgColor,
//                                             borderRadius: "4px",
//                                             border: "1px solid #ddd",
//                                           }}
//                                         />
//                                       }
//                                     />
//                                   </div>

//                                   {/* Text Color */}
//                                   <div style={{ position: "relative" }}>
//                                     <TextField
//                                       label="Text Color"
//                                       value={textColor}
//                                       onChange={setTextColor}
//                                       helpText="Hex color (e.g. #ffffff)"
//                                       autoComplete="off"
//                                       prefix={
//                                         <div
//                                           style={{
//                                             width: "20px",
//                                             height: "20px",
//                                             backgroundColor: textColor,
//                                             borderRadius: "4px",
//                                             border: "1px solid #ddd",
//                                           }}
//                                         />
//                                       }
//                                     />
//                                   </div>

//                                   {/* Hover Color */}
//                                   <div style={{ position: "relative" }}>
//                                     <TextField
//                                       label="Hover Color"
//                                       value={hoverColor}
//                                       onChange={setHoverColor}
//                                       helpText="Hex color (e.g. #333333)"
//                                       autoComplete="off"
//                                       prefix={
//                                         <div
//                                           style={{
//                                             width: "20px",
//                                             height: "20px",
//                                             backgroundColor: hoverColor,
//                                             borderRadius: "4px",
//                                             border: "1px solid #ddd",
//                                           }}
//                                         />
//                                       }
//                                     />
//                                   </div>
//                                 </BlockStack>
//                               </BlockStack>

//                               {/* Style & Position */}
//                               <BlockStack gap="200">
//                                 <InlineStack gap="200" blockAlign="center">
//                                   <Text as="h3" variant="headingSm">
//                                     Style & Position
//                                   </Text>
//                                 </InlineStack>

//                                 <InlineGrid
//                                   columns={{ xs: 1, md: 2 }}
//                                   gap="300"
//                                 >
//                                   <TextField
//                                     label="Border Radius"
//                                     type="number"
//                                     value={borderRadius}
//                                     onChange={setBorderRadius}
//                                     suffix="px"
//                                     helpText="0-20px recommended"
//                                     autoComplete="off"
//                                     min={0}
//                                     max={50}
//                                   />

//                                   <Select
//                                     label="Button Position"
//                                     options={[
//                                       { label: "Bottom Right", value: "right" },
//                                       { label: "Bottom Left", value: "left" },
//                                     ]}
//                                     value={position}
//                                     onChange={setPosition}
//                                     helpText="Where button appears on screen"
//                                   />
//                                 </InlineGrid>
//                               </BlockStack>
//                             </BlockStack>
//                           </Box>

//                           {/* Action Buttons */}
//                           <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
//                             <Button
//                               variant="primary"
//                               loading={savingUi}
//                               onClick={saveUiSettings}
//                             >
//                               Save Settings
//                             </Button>

//                             <Button
//                               variant="secondary"
//                               external
//                               url={themeEditorUrl}
//                               disabled={!shop || isLoading}
//                             >
//                               Theme Editor
//                             </Button>
//                           </InlineGrid>

//                           {/* Help Text */}
//                           <Box
//                             padding="200"
//                             background="bg-surface-secondary"
//                             borderRadius="200"
//                           >
//                             <InlineStack gap="200" blockAlign="center">
//                               <Badge tone="info">Tip</Badge>
//                               <Text as="span" variant="bodySm" tone="subdued">
//                                 Changes are saved instantly and will appear on
//                                 your storefront
//                               </Text>
//                             </InlineStack>
//                           </Box>
//                         </BlockStack>
//                       </Card>
//                       {/* </InlineGrid> */}
//                     </BlockStack>
//                   )}
//                 </Box>
//               </Tabs>
//             </Card>
//           </Layout.Section>

//           {/* Footer */}
//           <Layout.Section>
//             <Box padding="400">
//               <Text as="p" variant="bodySm" tone="subdued" alignment="center">
//                 Need help? Contact our support team or refer to the
//                 documentation.
//               </Text>
//             </Box>
//           </Layout.Section>
//         </Layout>
//       </Page>

//       {/* Add Custom Price Modal */}
//       <Modal
//         open={showAddModal}
//         onClose={closeModal}
//         title="Add Custom Sample Price"
//         size="large"
//         primaryAction={{
//           content: "Save Custom Price",
//           onAction: addCustomPrice,
//           disabled: !selectedProduct || !customPriceInput || addingCustomPrice,
//           loading: addingCustomPrice,
//         }}
//         secondaryActions={[
//           {
//             content: "Cancel",
//             onAction: closeModal,
//           },
//         ]}
//       >
//         <Modal.Section>
//           <BlockStack gap="400">
//             <Card>
//               <BlockStack gap="200">
//                 <Button onClick={selectProduct} fullWidth>
//                   {selectedProduct ? "Change Product" : "Select Product"}
//                 </Button>

//                 {selectedProduct && (
//                   <Box
//                     background="bg-surface-secondary"
//                     padding="300"
//                     borderRadius="200"
//                   >
//                     <InlineStack align="start" gap="300" blockAlign="center">
//                       {selectedProduct.image && (
//                         <Thumbnail
//                           source={selectedProduct.image}
//                           alt={selectedProduct.title}
//                           size="medium"
//                         />
//                       )}
//                       <BlockStack gap="100">
//                         <Text variant="headingSm" as="h3">
//                           {selectedProduct.title}
//                         </Text>
//                         <Text as="p" tone="subdued">
//                           Status:{" "}
//                           <Badge
//                             tone={
//                               selectedProduct.status === "active"
//                                 ? "success"
//                                 : "warning"
//                             }
//                           >
//                             {selectedProduct.status}
//                           </Badge>
//                         </Text>
//                         <Text as="p" tone="subdued">
//                           Original Price: {selectedProduct.price}
//                         </Text>
//                       </BlockStack>
//                     </InlineStack>
//                   </Box>
//                 )}
//               </BlockStack>
//             </Card>

//             {selectedProduct && productVariants.length > 1 && (
//               <Card>
//                 <Select
//                   label="Select Variant (Optional)"
//                   options={[
//                     { label: "All Variants (Apply to all)", value: "" },
//                     ...productVariants.map((variant) => ({
//                       label: `${variant.title} - $${variant.price}${variant.sku ? ` (SKU: ${variant.sku})` : ""}`,
//                       value: variant.id,
//                     })),
//                   ]}
//                   value={selectedVariant}
//                   onChange={handleVariantSelect}
//                   helpText="Leave empty to apply sample price to all variants"
//                 />
//               </Card>
//             )}

//             {selectedProduct && (
//               <Card>
//                 <BlockStack gap="200">
//                   <TextField
//                     label="Sample Price"
//                     type="number"
//                     value={customPriceInput}
//                     onChange={setCustomPriceInput}
//                     autoComplete="off"
//                     min={0}
//                     step={0.01}
//                     helpText={
//                       selectedVariantDetails
//                         ? `Original price for ${selectedVariantDetails.title}: ${selectedVariantDetails.price}`
//                         : `Original price: ${selectedProduct.price}`
//                     }
//                   />

//                   {customPriceInput && (
//                     <Box
//                       background="bg-surface-secondary"
//                       padding="300"
//                       borderRadius="200"
//                     >
//                       <BlockStack gap="100">
//                         <Text variant="headingSm" as="h3">
//                           Price Summary
//                         </Text>
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Product:
//                           </Text>
//                           <Text as="span" fontWeight="bold">
//                             {selectedProduct.title}
//                           </Text>
//                         </InlineStack>
//                         {selectedVariantDetails && (
//                           <InlineStack align="space-between">
//                             <Text as="span" tone="subdued">
//                               Variant:
//                             </Text>
//                             <Text as="span">
//                               {selectedVariantDetails.title}
//                             </Text>
//                           </InlineStack>
//                         )}
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Original Price:
//                           </Text>
//                           <Text as="span">
//                             {selectedVariantDetails
//                               ? selectedVariantDetails.price
//                               : selectedProduct.price}
//                           </Text>
//                         </InlineStack>
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Sample Price:
//                           </Text>
//                           <Text as="span" fontWeight="bold" tone="success">
//                             {parseFloat(customPriceInput).toFixed(2)}
//                           </Text>
//                         </InlineStack>
//                         <InlineStack align="space-between">
//                           <Text as="span" tone="subdued">
//                             Discount:
//                           </Text>
//                           <Text as="span" tone="success">
//                             {discountPercent.toFixed(0)}% off
//                           </Text>
//                         </InlineStack>
//                       </BlockStack>
//                     </Box>
//                   )}
//                 </BlockStack>
//               </Card>
//             )}
//           </BlockStack>
//         </Modal.Section>
//       </Modal>
//     </>
//   );
// }
"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  Modal,
  Button,
  Banner,
  Badge,
  Tabs,
  Box,
  BlockStack,
  InlineStack,
  Thumbnail,
  Select,
  InlineGrid,
  Icon,
  Popover,
  ColorPicker,
  hsbToRgb,
  rgbToHex,
} from "@shopify/polaris";
import { PlusCircleIcon, SaveIcon } from "@shopify/polaris-icons";
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

// Helper functions for color conversion
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHsb = (rgb: { r: number; g: number; b: number }) => {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  
  let hue = 0;
  if (delta !== 0) {
    if (max === rgb.r) {
      hue = ((rgb.g - rgb.b) / delta) % 6;
    } else if (max === rgb.g) {
      hue = (rgb.b - rgb.r) / delta + 2;
    } else {
      hue = (rgb.r - rgb.g) / delta + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }
  
  const saturation = max === 0 ? 0 : delta / max;
  const brightness = max;
  
  return { hue, saturation, brightness };
};

const hexToHsb = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgbToHsb(rgb);
};

const hsbToHex = (hsb: { hue: number; saturation: number; brightness: number }) => {
  const rgb = hsbToRgb(hsb);
  return rgbToHex(rgb);
};

// Color Picker Field Component
const ColorPickerField = ({ 
  label, 
  value, 
  onChange,
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
}) => {
  const [active, setActive] = useState(false);
  const [color, setColor] = useState(() => {
    try {
      return hexToHsb(value);
    } catch {
      return { hue: 0, saturation: 1, brightness: 1 };
    }
  });

  const handleColorChange = useCallback((newColor: any) => {
    setColor(newColor);
    onChange(hsbToHex(newColor));
  }, [onChange]);

  const togglePopover = useCallback(() => setActive((active) => !active), []);

  const activator = (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={togglePopover}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        autoComplete="off"
        helpText="Click swatch to open color picker"
        prefix={
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: value,
              borderRadius: "4px",
              border: "2px solid white",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
            }}
          />
        }
      />
    </div>
  );

  return (
    <Popover
      active={active}
      activator={activator}
      onClose={togglePopover}
      preferredAlignment="left"
    >
      <Box padding="400">
        <ColorPicker
          onChange={handleColorChange}
          color={color}
          allowAlpha={false}
        />
      </Box>
    </Popover>
  );
};

export default function SettingsPage() {
  const app = useAppBridge();

  // Tab State
  const [selectedTab, setSelectedTab] = useState(0);

  // Shop State
  const [shop, setShop] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string>("");

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

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  // Product Picker State
  const [selectedProduct, setSelectedProduct] = useState<ProductSelection | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [customPriceInput, setCustomPriceInput] = useState<string>("");
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [selectedVariantDetails, setSelectedVariantDetails] = useState<any>(null);
  const [addingCustomPrice, setAddingCustomPrice] = useState(false);

  // Script Installation State
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [scriptInstalled, setScriptInstalled] = useState(false);
  
  // UI Settings State
  const [buttonText, setButtonText] = useState("Get Sample");
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [hoverColor, setHoverColor] = useState("#333333");
  const [borderRadius, setBorderRadius] = useState("6");
  const [position, setPosition] = useState("right");
  const [savingUi, setSavingUi] = useState(false);

  // Tabs configuration
  const tabs = [
    {
      id: "sample-pricing",
      content: "Sample Settings",
      accessibilityLabel: "Sample pricing settings",
      panelID: "sample-pricing-panel",
    },
    {
      id: "theme-settings",
      content: "Theme Settings",
      accessibilityLabel: "Theme and script settings",
      panelID: "theme-settings-panel",
    },
  ];

  useEffect(() => {
    if (!app) return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      const shopFromConfig = (app as any)?.config?.shop;

      if (shopFromConfig) {
        setShop(shopFromConfig);
        setError(null);
      } else if (typeof window !== "undefined") {
        setShop(window.location.hostname);
      } else {
        setError("Unable to retrieve shop info. Please reload the app.");
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [app]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

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
      });

      const product = pickerResult?.selection?.[0];
      if (!product) return;

      const parsedProduct: ProductSelection = {
        productId: normalizeProductId(product.id),
        title: product.title,
        image: product.images?.[0]?.originalSrc || "",
        price: product.variants?.[0]?.price || "0",
        status: product.status || "active",
      };

      setSelectedProduct(parsedProduct);

      if (product.variants) {
        const variants = product.variants.map((variant: any) => ({
          id: normalizeVariantId(variant.id),
          title: variant.title,
          price: variant.price,
          sku: variant.sku || "",
          inventoryQuantity: variant.inventoryQuantity || 0,
        }));
        setProductVariants(variants);

        if (variants.length === 1) {
          handleVariantSelect(variants[0].id);
        } else {
          setSelectedVariant("");
          setSelectedVariantDetails(null);
        }
      }

      const originalPrice = parseFloat(parsedProduct.price);
      setCustomPriceInput((originalPrice * 0.8).toFixed(2));
    } catch (error) {
      console.error("Error in product picker:", error);
      showToast("Failed to open product picker");
    }
  };

  const saveUiSettings = async () => {
    try {
      setSavingUi(true);

      await fetch("/api/settings/ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop,
          buttonText,
          bgColor,
          textColor,
          hoverColor,
          borderRadius: Number(borderRadius),
          position,
        }),
      });

      showToast("Theme UI settings saved");
    } catch (e) {
      console.error(e);
      showToast("Failed to save UI settings");
    } finally {
      setSavingUi(false);
    }
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    const variant = productVariants.find((v) => v.id === variantId);
    setSelectedVariantDetails(variant);

    if (variant && customPriceInput) {
      const originalPrice = parseFloat(variant.price);
      const currentCustomPrice = parseFloat(customPriceInput);
      const originalProductPrice = parseFloat(selectedProduct?.price || "0");

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
      const res = await fetch(`/api/settings?shop=${shopDomain}`);
      const json = await res.json();

      if (json.success && json.data) {
        setGeneralSettings({
          enabled: json.data.enabled,
          pricingType: json.data.pricingType || "FIXED",
          fixedPrice: Number(json.data.fixedPrice || 0),
          percentageOff: Number(json.data.percentageOff || 0),
        });

        if (json.data.customPrices) {
          const transformedPrices = await transformCustomPrices(
            json.data.customPrices,
          );
          setCustomPrices(transformedPrices);
        }
      }
    } catch (e) {
      console.error("loadAllSettings error:", e);
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

  const installScriptTag = async () => {
    if (scriptInstalled) {
      showToast("Script already installed");
      return;
    }

    try {
      setIsInstalling(true);
      setSaveMessage(null);

      const shop = (app as any)?.config?.shop;

      if (!shop) {
        throw new Error("Shop not found");
      }

      const res = await fetch("/api/script-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to install script");
      }

      setSaveMessage({
        type: "success",
        message: "🎉 Storefront script installed successfully!",
      });

      setScriptInstalled(true);
      showToast("Script installed successfully!");
    } catch (error: any) {
      setSaveMessage({
        type: "error",
        message: error.message,
      });
      showToast(error.message);
    } finally {
      setIsInstalling(false);
    }
  };

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

        if (generalSettings.enabled && !scriptInstalled) {
          setTimeout(() => {
            installScriptTag();
          }, 500);
        }
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

  const handleEnableChange = (enabled: boolean) => {
    setGeneralSettings({
      ...generalSettings,
      enabled: enabled,
    });
  };

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
        if (!selectedVariant) {
          showToast("Sample price applied to all variants");
          closeModal();
          return;
        }

        const newPrice: CustomPrice = {
          id: data.data?.id || Math.random().toString(),
          ...customPriceData,
        };

        setCustomPrices([...customPrices, newPrice]);
        closeModal();
        showToast("Custom price added successfully");
      }

      if (data.success && data.appliedToAll) {
        showToast(`Sample price applied to ${data.variantsCount} variants`);
        closeModal();
        return;
      } else {
        showToast("Failed to add custom price");
      }
    } catch (error) {
      console.error("Failed to add custom price:", error);
      showToast("Failed to add custom price");
    } finally {
      setAddingCustomPrice(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedProduct(null);
    setSelectedVariant("");
    setCustomPriceInput("");
    setProductVariants([]);
    setSelectedVariantDetails(null);
  };

  const originalPriceNumber = parseFloat(
    selectedVariantDetails?.price ?? selectedProduct?.price ?? "0",
  );
  const samplePriceNumber = parseFloat(customPriceInput || "0");
  let discountPercent = 0;

  if (originalPriceNumber > 0 && samplePriceNumber >= 0) {
    discountPercent =
      ((originalPriceNumber - samplePriceNumber) / originalPriceNumber) * 100;
  }
  discountPercent = Math.min(100, Math.max(0, discountPercent));

  const storeName = shop?.replace(".myshopify.com", "");
  const themeEditorUrl = storeName
    ? `https://admin.shopify.com/store/${storeName}/themes/current/editor`
    : "#";

  if (loading || isLoading) {
    return (
      <Page title="Settings">
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
        title="Settings"
        primaryAction={
          selectedTab === 0
            ? {
                content: "Save Settings",
                icon: SaveIcon,
                onAction: saveGeneralSettings,
                disabled: savingGeneral,
              }
            : undefined
        }
      >
        <Layout>
          {/* Error State */}
          {error && (
            <Layout.Section>
              <Banner
                title={error}
                tone="critical"
                action={{
                  content: "Reload",
                  onAction: () => window.location.reload(),
                }}
              />
            </Layout.Section>
          )}

          {/* Toast Message */}
          {toastMessage && (
            <Layout.Section>
              <Banner tone="info" onDismiss={() => setToastMessage("")}>
                {toastMessage}
              </Banner>
            </Layout.Section>
          )}

          {/* Script Installation Message */}
          {saveMessage && (
            <Layout.Section>
              <Banner
                title={saveMessage.message}
                // tone={saveMessage.type}
                onDismiss={() => setSaveMessage(null)}
              />
            </Layout.Section>
          )}

          {/* Tabs */}
          <Layout.Section>
            <Card>
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
              >
                <Box padding="400">
                  {selectedTab === 0 && (
                    <BlockStack gap="400">
                      <Banner
                        title="When disabled, all settings will be disabled"
                        tone="info"
                      />
                      <Card>
                        <BlockStack gap="100">
                          <Text as="p" variant="headingMd" alignment="center">
                            Follow These Steps to Use the Sample App
                          </Text>

                          <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                            <Box padding="400">
                              <BlockStack gap="200" align="center">
                                <Box
                                  background="bg-surface-brand"
                                  padding="400"
                                  borderRadius="300"
                                >
                                  <Text
                                    variant="headingLg"
                                    as="h2"
                                    alignment="center"
                                  >
                                    1
                                  </Text>
                                </Box>
                                <Text
                                  variant="headingSm"
                                  as="h4"
                                  alignment="center"
                                >
                                  Enable Settings
                                </Text>
                                <Text
                                  as="p"
                                  variant="bodyMd"
                                  tone="subdued"
                                  alignment="center"
                                >
                                  Enable settings and configure your default pricing
                                </Text>
                              </BlockStack>
                            </Box>

                            <Box padding="400">
                              <BlockStack gap="200" align="center">
                                <Box
                                  background="bg-surface-brand"
                                  padding="400"
                                  borderRadius="300"
                                >
                                  <Text
                                    variant="headingLg"
                                    as="h2"
                                    alignment="center"
                                  >
                                    2
                                  </Text>
                                </Box>
                                <Text
                                  variant="headingSm"
                                  as="h4"
                                  alignment="center"
                                >
                                  Customize Theme
                                </Text>
                                <Text
                                  as="p"
                                  variant="bodyMd"
                                  tone="subdued"
                                  alignment="center"
                                >
                                  Use the color pickers to match your brand
                                </Text>
                              </BlockStack>
                            </Box>

                            <Box padding="400">
                              <BlockStack gap="200" align="center">
                                <Box
                                  background="bg-surface-brand"
                                  padding="400"
                                  borderRadius="300"
                                >
                                  <Text
                                    variant="headingLg"
                                    as="h2"
                                    alignment="center"
                                  >
                                    3
                                  </Text>
                                </Box>
                                <Text
                                  variant="headingSm"
                                  as="h4"
                                  alignment="center"
                                >
                                  Add Products
                                </Text>
                                <Text
                                  as="p"
                                  variant="bodyMd"
                                  tone="subdued"
                                  alignment="center"
                                >
                                  Configure sample products with custom pricing
                                </Text>
                              </BlockStack>
                            </Box>
                          </InlineGrid>
                        </BlockStack>
                      </Card>
                      <Card>
                        <BlockStack gap="200">
                          <Text as="h2" variant="headingMd">
                            Sample Product Status
                          </Text>
                          <RadioButton
                            label="Disabled – Sample product pricing is turned off"
                            checked={generalSettings.enabled === false}
                            name="sample-enabled"
                            onChange={() => handleEnableChange(false)}
                          />
                          <RadioButton
                            label="Enabled – Sample product pricing is active"
                            checked={generalSettings.enabled === true}
                            name="sample-enabled"
                            onChange={() => handleEnableChange(true)}
                          />
                        </BlockStack>
                      </Card>

                      {generalSettings.enabled && (
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
                                  checked={
                                    generalSettings.pricingType === "FIXED"
                                  }
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
                                  helpText="All samples will apply same discount based on original price"
                                  checked={
                                    generalSettings.pricingType === "PERCENTAGE"
                                  }
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
                                  helpText="This price will apply to all sample products unless overridden"
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
                      )}

                      {/* Custom Prices List */}
                      {customPrices.length > 0 && (
                        <Card>
                          <BlockStack gap="200">
                            <Text as="h2" variant="headingMd">
                              Custom Sample Prices
                            </Text>
                            <Text as="p" tone="subdued">
                              {customPrices.length} custom price(s) configured
                            </Text>
                          </BlockStack>
                        </Card>
                      )}
                    </BlockStack>
                  )}

                  {/* Theme Settings Tab */}
                  {selectedTab === 1 && (
                    <BlockStack gap="400">
                      <Banner title="Pro Tip" tone="success">
                        <p>
                          Always preview changes in your theme editor before
                          publishing. This ensures your storefront maintains a
                          professional appearance.
                        </p>
                      </Banner>

                      <Card>
                        <BlockStack gap="400">
                          {/* Header with preview badge */}
                          <InlineStack
                            align="space-between"
                            blockAlign="center"
                          >
                            <Text as="h2" variant="headingMd">
                              Theme Customization
                            </Text>
                            <Badge tone="success">Live Preview</Badge>
                          </InlineStack>

                          {/* Live Button Preview */}
                          <Box
                            padding="400"
                            background="bg-surface-secondary"
                            borderRadius="200"
                          >
                            <BlockStack gap="300" align="center">
                              <Text
                                as="p"
                                variant="headingSm"
                                alignment="center"
                              >
                                Preview
                              </Text>
                              <Box
                                padding="200"
                                background="bg-surface"
                                borderRadius="200"
                                width="100%"
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: "80px",
                                  }}
                                >
                                  <button
                                    style={{
                                      backgroundColor: bgColor,
                                      color: textColor,
                                      padding: "10px 20px",
                                      border: "none",
                                      borderRadius: `${borderRadius}px`,
                                      cursor: "pointer",
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      transition: "all 0.3s ease",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        hoverColor;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        bgColor;
                                    }}
                                  >
                                    {buttonText || "Get Sample"}
                                  </button>
                                </div>
                              </Box>
                            </BlockStack>
                          </Box>

                          {/* Settings Sections */}
                          <Box
                            padding="400"
                            background="bg-surface-secondary"
                            borderRadius="200"
                          >
                            <BlockStack gap="400">
                              {/* Button Text */}
                              <BlockStack gap="200">
                                <InlineStack gap="200" blockAlign="center">
                                  <Text as="h3" variant="headingSm">
                                    Button Configuration
                                  </Text>
                                </InlineStack>
                                <TextField
                                  label="Button Text"
                                  value={buttonText}
                                  onChange={setButtonText}
                                  autoComplete="off"
                                  helpText="Customize the call-to-action text"
                                />
                              </BlockStack>

                              {/* Color Settings with Polaris ColorPicker */}
                              <BlockStack gap="200">
                                <InlineStack gap="200" blockAlign="center">
                                  <Text as="h3" variant="headingSm">
                                    Color Scheme
                                  </Text>
                                </InlineStack>

                                <BlockStack gap="300">
                                  <ColorPickerField
                                    label="Background Color"
                                    value={bgColor}
                                    onChange={setBgColor}
                                  />
                                  
                                  <ColorPickerField
                                    label="Text Color"
                                    value={textColor}
                                    onChange={setTextColor}
                                  />
                                  
                                  <ColorPickerField
                                    label="Hover Color"
                                    value={hoverColor}
                                    onChange={setHoverColor}
                                  />
                                </BlockStack>
                              </BlockStack>

                              {/* Style & Position */}
                              <BlockStack gap="200">
                                <InlineStack gap="200" blockAlign="center">
                                  <Text as="h3" variant="headingSm">
                                    Style & Position
                                  </Text>
                                </InlineStack>

                                <InlineGrid
                                  columns={{ xs: 1, md: 2 }}
                                  gap="300"
                                >
                                  <TextField
                                    label="Border Radius"
                                    type="number"
                                    value={borderRadius}
                                    onChange={setBorderRadius}
                                    suffix="px"
                                    helpText="0-20px recommended"
                                    autoComplete="off"
                                    min={0}
                                    max={50}
                                  />

                                  <Select
                                    label="Button Position"
                                    options={[
                                      { label: "Bottom Right", value: "right" },
                                      { label: "Bottom Left", value: "left" },
                                    ]}
                                    value={position}
                                    onChange={setPosition}
                                    helpText="Where button appears on screen"
                                  />
                                </InlineGrid>
                              </BlockStack>
                            </BlockStack>
                          </Box>

                          {/* Action Buttons */}
                          <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
                            <Button
                              variant="primary"
                              loading={savingUi}
                              onClick={saveUiSettings}
                            >
                              Save Settings
                            </Button>

                            <Button
                              variant="secondary"
                              external
                              url={themeEditorUrl}
                              disabled={!shop || isLoading}
                            >
                              Theme Editor
                            </Button>
                          </InlineGrid>

                          {/* Help Text */}
                          <Box
                            padding="200"
                            background="bg-surface-secondary"
                            borderRadius="200"
                          >
                            <InlineStack gap="200" blockAlign="center">
                              <Badge tone="info">Tip</Badge>
                              <Text as="span" variant="bodySm" tone="subdued">
                                Click the color swatch to open the visual color picker
                              </Text>
                            </InlineStack>
                          </Box>
                        </BlockStack>
                      </Card>
                    </BlockStack>
                  )}
                </Box>
              </Tabs>
            </Card>
          </Layout.Section>

          {/* Footer */}
          <Layout.Section>
            <Box padding="400">
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                Need help? Contact our support team or refer to the documentation.
              </Text>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>

      {/* Add Custom Price Modal */}
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
                          Original Price: ${selectedProduct.price}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                  </Box>
                )}
              </BlockStack>
            </Card>

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

            {selectedProduct && (
              <Card>
                <BlockStack gap="200">
                  <TextField
                    label="Sample Price"
                    type="number"
                    value={customPriceInput}
                    onChange={setCustomPriceInput}
                    autoComplete="off"
                    min={0}
                    step={0.01}
                    prefix="$"
                    helpText={
                      selectedVariantDetails
                        ? `Original price for ${selectedVariantDetails.title}: $${selectedVariantDetails.price}`
                        : `Original price: $${selectedProduct.price}`
                    }
                  />

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
                            ${selectedVariantDetails
                              ? selectedVariantDetails.price
                              : selectedProduct.price}
                          </Text>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="span" tone="subdued">
                            Sample Price:
                          </Text>
                          <Text as="span" fontWeight="bold" tone="success">
                            ${parseFloat(customPriceInput).toFixed(2)}
                          </Text>
                        </InlineStack>
                        <InlineStack align="space-between">
                          <Text as="span" tone="subdued">
                            Discount:
                          </Text>
                          <Text as="span" tone="success">
                            {discountPercent.toFixed(0)}% off
                          </Text>
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