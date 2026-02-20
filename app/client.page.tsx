"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Layout,
  Page,
  Text,
  Box,
  Banner,
  List,
  BlockStack,
  InlineGrid,
  Badge,
  Divider,
  InlineStack,
  Button,
  Icon,
  Tag,
  Spinner,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

import {
  SettingsIcon,
  ProductIcon,
  GlobeIcon,
  CursorIcon,
} from "@shopify/polaris-icons";
import { useRouter } from "next/navigation";

interface Stats {
  globalEnabled: boolean;
  customProducts: number;
  overrides: number;
  lastUpdated: string | null;
}

// Add interface for detailed settings
interface DetailedSettings {
  quantityLimit?: number;
  price?: number;
  eligibility?: string;
}

interface SaveMessage {
  type: "success" | "error";
  message: string;
}

export default function HomePage() {
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);
  const [stats, setStats] = useState<Stats>({
    globalEnabled: false,
    customProducts: 0,
    overrides: 0,
    lastUpdated: null,
  });
  const [detailedSettings, setDetailedSettings] = useState<DetailedSettings>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const app = useAppBridge();

  useEffect(() => {
    const shopFromConfig = (app as any)?.config?.shop;
    if (shopFromConfig) {
      setShop(shopFromConfig);
    } else {
      setError("Unable to retrieve shop info from App Bridge config");
    }
  }, [app]);

  useEffect(() => {
    if (shop) {
      refreshStats();
      fetchDetailedSettings();
    }
  }, [shop]);

  const refreshStats = async () => {
    if (!shop) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/stats?shop=${shop}`);

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setStats(data);
      console.log("Stats data:", data);

      // setSaveMessage({
      //   type: "success",
      //   message: "Stats refreshed successfully",
      // });
    } catch (error) {
      console.error("Error refreshing stats:", error);
      setSaveMessage({
        type: "error",
        message: "Failed to refresh stats",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailedSettings = async () => {
    if (!shop) return;

    try {
      const response = await fetch(`/api/settings?shop=${shop}`);
      if (response.ok) {
        const data = await response.json();
        setDetailedSettings(data);
      }
    } catch (error) {
      console.error("Error fetching detailed settings:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const CardLoader = () => (
    <Box padding="400" minHeight="120">
      <InlineStack align="center">
        <Spinner accessibilityLabel="Loading" size="small" />
      </InlineStack>
    </Box>
  );

  return (
    <Page
      title="Sample Products Manager"
      subtitle="Control how customers purchase samples across your store"
    >
      <Layout>
        {/* Notification Banner */}
        {saveMessage && (
          <Layout.Section>
            <Banner
              title={saveMessage.message}
              // tone={saveMessage.type}
              onDismiss={() => setSaveMessage(null)}
            />
          </Layout.Section>
        )}

        {/* Welcome Banner */}
        <Layout.Section>
          <Banner title="Welcome to Sample Products Pro" tone="success">
            <p>
              Get started by configuring your sample settings or creating custom
              sample products.
            </p>
          </Banner>
        </Layout.Section>

        {/* Quick Stats */}
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 3, md: 3 }} gap="400">
            {/* <Card padding="400">
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="headingSm">
                    Global Rules
                  </Text>
                  <Badge tone={stats.globalEnabled ? "success" : "warning"}>
                    {stats.globalEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </InlineStack>
                <Text as="h2" variant="headingMd" fontWeight="bold">
                  {stats.globalEnabled ? "ON" : "OFF"}
                </Text>
                <Text as="p" tone="subdued">
                  Applied to all products
                </Text>
                {stats.lastUpdated && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Last updated: {formatDate(stats.lastUpdated)}
                  </Text>
                )}
              </BlockStack>
            </Card> */}
            <Card padding="400">
              {isLoading ? (
                <CardLoader />
              ) : (
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" variant="headingSm">
                      All Product Settings{" "}
                    </Text>
                    <Badge tone={stats.globalEnabled ? "success" : "warning"}>
                      {stats.globalEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>

                  <Text as="h2" variant="headingMd" fontWeight="bold">
                    {stats.globalEnabled ? "ON" : "OFF"}
                  </Text>

                  <Text as="p" tone="subdued">
                    Applied to all products
                  </Text>

                  {stats.lastUpdated && (
                    <Text as="p" variant="bodySm" tone="subdued">
                      Last updated: {formatDate(stats.lastUpdated)}
                    </Text>
                  )}
                </BlockStack>
              )}
            </Card>

            {/* <Card padding="400">
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="headingSm">
                    Custom Products
                  </Text>
                  <Icon source={ProductIcon} tone="base" />
                </InlineStack>
                <Text as="h2" variant="headingXl" fontWeight="bold">
                  {stats.customProducts}
                </Text>
                <Text as="p" tone="subdued">
                  Sample-enabled products
                </Text>
              </BlockStack>
            </Card> */}
            <Card padding="400">
              {isLoading ? (
                <CardLoader />
              ) : (
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" variant="headingSm">
                      Custom Products
                    </Text>
                    <Icon source={ProductIcon} />
                  </InlineStack>

                  <Text as="h2" variant="headingXl" fontWeight="bold">
                    {stats.customProducts}
                  </Text>

                  <Text as="p" tone="subdued">
                    Custom products(Here you set sample price by your choice)
                  </Text>
                </BlockStack>
              )}
            </Card>

            <Card padding="400">
              {isLoading ? (
                <CardLoader />
              ) : (
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" variant="headingSm">
                      Overrides
                    </Text>
                    <Icon source={CursorIcon} />
                  </InlineStack>

                  <Text as="h2" variant="headingXl" fontWeight="bold">
                    {stats.overrides}
                  </Text>

                  <Text as="p" tone="subdued">
                    Custom product rules
                  </Text>
                </BlockStack>
              )}
            </Card>

            {/* <Card padding="400">
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="headingSm">
                    Overrides
                  </Text>
                  <Icon source={CursorIcon} tone="base" />
                </InlineStack>
                <Text as="h2" variant="headingXl" fontWeight="bold">
                  {stats.overrides}
                </Text>
                <Text as="p" tone="subdued">
                  Custom product rules
                </Text>
              </BlockStack>
            </Card> */}
          </InlineGrid>
        </Layout.Section>

        {/* Feature Cards */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h3">
              Features & Capabilities
            </Text>

            <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack align="center">
                    {/* <Icon source={GlobeIcon} tone="primary" /> */}
                    {/* <Badge tone="info">Global</Badge> */}
                  </InlineStack>
                  <Text as="h3" alignment="center" variant="headingMd">
                    All Product Settings
                  </Text>
                  <Text as="p" tone="subdued">
                    Apply sample settings across all products instantly with
                    one-click configuration.
                  </Text>
                  <Button
                    variant="primary"
                    tone="success"
                    onClick={() =>
                      router.push("/products/product-settings/enable")
                    }
                  >
                    Configure
                  </Button>
                </BlockStack>
              </Card>

              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    {/* <Icon source={SettingsIcon} tone="primary" /> */}
                    {/* <Badge>Default</Badge> */}
                  </InlineStack>
                  <Text as="h3" alignment="center" variant="headingMd">
                    Create Products With Your Price Choice
                  </Text>
                  <Text as="p" tone="subdued">
                    Set baseline sample rules that apply when global rules are
                    enabled.
                  </Text>
                  <Button
                    variant="primary"
                    tone="success"
                    onClick={() => router.push("/products/create")}
                  >
                    Create Products
                  </Button>
                </BlockStack>
              </Card>

              <Card padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    {/* <Icon source={ProductIcon} tone="primary" /> */}
                    {/* <Badge tone="attention">Per Product</Badge> */}
                  </InlineStack>
                  <Text as="h3" alignment="center" variant="headingMd">
                    Check Orders 
                  </Text>
                  <Text as="p" tone="subdued">
                    Check all sample products order, with thie status
                  </Text>
                  <Button
                    variant="primary"
                    tone="success"
                    onClick={() => router.push("/products/orders")}
                  >
                    Check orders{" "}
                  </Button>
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>

        {/* Configuration Status */}
        <Layout.Section>
          <Card padding="500">
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h3">
                  Current Configuration
                </Text>
                {/* <Button
                  variant="primary"
                  tone="success"
                  onClick={() => router.push("/settings")}
                >
                  Edit All Settings
                </Button> */}
              </InlineStack>

              <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="300">
                    <Text variant="headingMd" alignment="center" as="h4">
                      Global Settings
                    </Text>
                    {/* <Badge tone={stats.globalEnabled ? "success" : "warning"}>
                        {stats.globalEnabled ? "Active" : "Inactive"}
                      </Badge> */}

                    {/* <Text as="p" tone="subdued">
                      Global rules are currently disabled. Enable them to
                      configure settings.
                    </Text> */}
                    <List type="bullet">
                      <List.Item>
                        <InlineStack gap="200">
                          <Text as="span">Unlimited Sample quantity limit</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200">
                          <Text as="span">Manually Set Sample price</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200">
                          <Text as="span">Enable or Disable setting </Text>
                        </InlineStack>
                      </List.Item>

                      {/* <InlineStack gap="200">
                            <Text as="span">Customer eligibility:</Text>
                          </InlineStack> */}
                    </List>

                    <Button
                      variant="primary"
                      tone="success"
                      loading={isLoading}
                      disabled={stats.globalEnabled}
                      onClick={() => router.push("/products/product-settings/enable")}
                    >
                      {stats.globalEnabled ? "Enabled" : "Enable"}
                    </Button>
                  </BlockStack>
                </Box>

                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="300">
                    <InlineStack align="center">
                      <Text variant="headingSm" as="h4">
                        Custom Products
                      </Text>
                    </InlineStack>
                      <List type="bullet">
                        <List.Item>
                          Individual pricing rules ({stats.overrides} overrides)
                        </List.Item>
                        <List.Item>Variant-level control</List.Item>
                        <List.Item>Advanced inventory tracking</List.Item>
                      </List>
                 
                    <Button
                      variant="primary"
                      tone="success"
                      onClick={() => router.push("/products")}
                    >
                      {stats.customProducts > 0
                        ? "View all custom products"
                        : "Create custom products →"}
                    </Button>
                  </BlockStack>
                </Box>
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Help Section */}
        <Layout.Section>
          <Box padding="400" background="bg-surface-info" borderRadius="200">
            <InlineStack align="space-between" wrap={false}>
              <BlockStack>
                <Text variant="headingMd" as="h3">
                  Need help getting started?
                </Text>
                <Text as="p" tone="subdued">
                  Check out our documentation or contact support for assistance.
                </Text>
              </BlockStack>
            </InlineStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
// 'use client';

// import React, { useState } from 'react';
// import {
//   Card,
//   Layout,
//   Page,
//   Text,
//   Box,
//   Banner,
//   List,
//   BlockStack,
//   InlineStack,
//   Button,
//   Icon,
//   TextField,
//   Select,
//   Badge,
//   Collapsible,
//   InlineGrid,
// } from '@shopify/polaris';

// export default function HomePage() {
//   const [saveMessage, setSaveMessage] = useState<{
//     type: 'success' | 'error';
//     message: string;
//   } | null>(null);

//   const [isAppActive, setIsAppActive] = useState(false);
//   const [isGlobalRules, setIsGlobalRules] = useState(false);
//   const [showDefaultSettings, setShowDefaultSettings] = useState(false);
//   const [showThemeSettings, setShowThemeSettings] = useState(false);

//   // Theme settings state
//   const [buttonLabel, setButtonLabel] = useState('Try Sample');
//   const [buttonColor, setButtonColor] = useState('#0077cc');
//   const [buttonStyle, setButtonStyle] = useState('primary');

//   // Default product settings
//   const [maxSamples, setMaxSamples] = useState('1');
//   const [samplePrice, setSamplePrice] = useState('0.00');
//   const [requireFullPurchase, setRequireFullPurchase] = useState(false);

//   const handleSave = () => {
//     // Simulate API call
//     setSaveMessage({
//       type: 'success',
//       message: 'Settings saved successfully! Your changes will appear on the storefront shortly.'
//     });
//   };

//   const handleReset = () => {
//     setIsAppActive(false);
//     setIsGlobalRules(false);
//     setButtonLabel('Try Sample');
//     setButtonColor('#0077cc');
//     setMaxSamples('1');
//     setSamplePrice('0.00');
//     setRequireFullPurchase(false);

//     setSaveMessage({
//       type: 'success',
//       message: 'All settings have been reset to default values.'
//     });
//   };

//   return (
//     <Page
//       title="Try Sample Products"
//       primaryAction={{
//         content: 'Save Settings',
//         onAction: handleSave,
//         disabled: !isAppActive,
//       }}
//       secondaryActions={[
//         {
//           content: 'Reset All',
//           onAction: handleReset,
//         },
//       ]}
//     >
//       <Layout>
//         {saveMessage && (
//           <Layout.Section>
//             <Banner
//               title={saveMessage.message}
//               onDismiss={() => setSaveMessage(null)}
//             />
//           </Layout.Section>
//         )}

//         {/* Status Bar */}
//         <Layout.Section>
//           <Card padding="400">
//             <InlineStack align="space-between" blockAlign="center">
//               <InlineStack gap="200" blockAlign="center">
//                 <Text as="p" variant="bodyMd" as="p">
//                   App Status: <Text as="p" as="span" variant="bodyMd" fontWeight="bold">
//                     {isAppActive ? 'Active' : 'Inactive'}
//                   </Text>
//                 </Text>
//                 {isAppActive && (
//                   <Badge tone="success" progress="complete">
//                     Ready
//                   </Badge>
//                 )}
//               </InlineStack>
//               <Button
//                 variant="primary"
//                 onClick={() => setIsAppActive(!isAppActive)}
//               >
//                 {isAppActive ? 'Deactivate App' : 'Activate App'}
//               </Button>
//             </InlineStack>
//           </Card>
//         </Layout.Section>

//         {/* Intro Card */}
//         <Layout.Section>
//           <Card >
//             <BlockStack gap="400">
//               <Text as="p" variant="headingLg" as="h2" alignment="center">
//                 Welcome to Sample Products Pro
//               </Text>
//               <Text as="p" as="p" variant="bodyMd" alignment="center" tone="subdued">
//                 Configure how sample products work on your storefront.
//                 Follow the steps below to activate and control the experience.
//               </Text>
//               {/* {!isAppActive && (
//                 <Box padding="400" background="bg-surface-warning" borderRadius="200">
//                   <Text as="p" as="p" variant="bodySm" alignment="center" tone="warning">
//                     ⚠️ Activate the app first to access all configuration options
//                   </Text>
//                 </Box>
//               )} */}
//             </BlockStack>
//           </Card>
//         </Layout.Section>

//         {/* App Settings Card */}
//         <Layout.Section>
//           <Card>
//             <BlockStack gap="600">
//               <InlineStack align="space-between" blockAlign="center">
//                 <Text as="p" variant="headingMd" as="h3">
//                   App Configuration Steps
//                 </Text>
//                 <Badge tone={isAppActive ? "success" : "attention"}>
//                   {isAppActive ? "Active" : "Setup Required"}
//                 </Badge>
//               </InlineStack>

//               {/* Step 1: App Activation */}
//               <Card padding="400">
//                 <InlineStack align="space-between" blockAlign="center">
//                   <BlockStack gap="100">
//                     <InlineStack gap="200" blockAlign="center">
//                       <Box
//                         background="bg-fill-brand"
//                         padding="100"
//                         borderRadius="200"
//                         minWidth="24px"
//                       >
//                         <Text as="p" variant="bodySm" fontWeight="bold" alignment="center" color="text-on-color">
//                           1
//                         </Text>
//                       </Box>
//                       <Text as="p" as="h2" variant="headingSm">
//                         App Activation
//                       </Text>
//                     </InlineStack>
//                     <Text as="p" as="p" variant="bodyMd" tone="subdued">
//                       Enable the app to make sample purchasing available on your storefront.
//                     </Text>
//                   </BlockStack>
//                   {/* <Switch
//                     checked={isAppActive}
//                     onChange={setIsAppActive}
//                     disabled={false}
//                   /> */}
//                 </InlineStack>
//               </Card>

//               {/* Step 2: Global Rules */}
//               <Card padding="400">
//                 <InlineStack align="space-between" blockAlign="center">
//                   <BlockStack gap="100">
//                     <InlineStack gap="200" blockAlign="center">
//                       <Box
//                         background={isAppActive ? "bg-fill-brand" : "bg-fill-disabled"}
//                         padding="100"
//                         borderRadius="200"
//                         minWidth="24px"
//                       >
//                         <Text
//                           variant="bodySm"
//                           fontWeight="bold"
//                           alignment="center"
//                           color={isAppActive ? "text-on-color" : "text-disabled"}
//                         >
//                           2
//                         </Text>
//                       </Box>
//                       <Text
//                         as="h2"
//                         variant="headingSm"
//                         tone={isAppActive ? undefined : "subdued"}
//                       >
//                         Global Rules
//                       </Text>
//                     </InlineStack>
//                     <Text as="p" as="p" variant="bodyMd" tone={isAppActive ? "subdued" : "disabled"}>
//                       Decide whether sample rules apply across all products automatically.
//                     </Text>
//                   </BlockStack>
//                   {/* <Switch
//                     checked={isGlobalRules}
//                     onChange={setIsGlobalRules}
//                     disabled={!isAppActive}
//                   /> */}
//                 </InlineStack>
//               </Card>

//               {/* Step 3: Default Product Settings */}
//               <Card padding="400">
//                 <BlockStack gap="400">
//                   <InlineStack align="space-between" blockAlign="center">
//                     <InlineStack gap="200" blockAlign="center">
//                       <Box
//                         background={isAppActive ? "bg-fill-brand" : "bg-fill-disabled"}
//                         padding="100"
//                         borderRadius="200"
//                         minWidth="24px"
//                       >
//                         <Text
//                           variant="bodySm"
//                           fontWeight="bold"
//                           alignment="center"
//                           color={isAppActive ? "text-on-color" : "text-disabled"}
//                         >
//                           3
//                         </Text>
//                       </Box>
//                       <Text
//                         as="h2"
//                         variant="headingSm"
//                         tone={isAppActive ? undefined : "subdued"}
//                       >
//                         Default Product Settings
//                       </Text>
//                     </InlineStack>
//                     <Button
//                       variant="plain"
//                       onClick={() => setShowDefaultSettings(!showDefaultSettings)}
//                       disabled={!isAppActive}
//                     >
//                       {showDefaultSettings ? 'Hide' : 'Configure'}
//                     </Button>
//                   </InlineStack>
//                   <Text as="p" as="p" variant="bodyMd" tone={isAppActive ? "subdued" : "disabled"}>
//                     These settings apply when global rules are enabled.
//                   </Text>

//                   <Collapsible open={showDefaultSettings && isAppActive}>
//                     <Box padding="400" background="bg-surface" borderRadius="200">
//                       <BlockStack gap="400">
//                         <InlineGrid columns={2} gap="400">
//                           <TextField
//                             label="Max Samples per Order"
//                             value={maxSamples}
//                             onChange={setMaxSamples}
//                             autoComplete="off"
//                             type="number"
//                             min="1"
//                             max="10"
//                             disabled={!isGlobalRules}
//                             helpText="Maximum number of sample items per customer"
//                           />
//                           <TextField
//                             label="Sample Price"
//                             value={samplePrice}
//                             onChange={setSamplePrice}
//                             autoComplete="off"
//                             type="number"
//                             prefix="$"
//                             step="0.01"
//                             disabled={!isGlobalRules}
//                             helpText="Price for each sample item"
//                           />
//                         </InlineGrid>
//                         {/* <Switch
//                           label="Require full product purchase"
//                           checked={requireFullPurchase}
//                           onChange={setRequireFullPurchase}
//                           disabled={!isGlobalRules}
//                           helpText="Customers must purchase the full product to buy samples"
//                         /> */}
//                       </BlockStack>
//                     </Box>
//                   </Collapsible>
//                 </BlockStack>
//               </Card>

//               {/* Step 4: Specific Product Overrides */}
//               <Card padding="400">
//                 <BlockStack gap="100">
//                   <InlineStack gap="200" blockAlign="center">
//                     <Box
//                       background={isAppActive ? "bg-fill-brand" : "bg-fill-disabled"}
//                       padding="100"
//                       borderRadius="200"
//                       minWidth="24px"
//                     >
//                       <Text
//                         variant="bodySm"
//                         fontWeight="bold"
//                         alignment="center"
//                         color={isAppActive ? "text-on-color" : "text-disabled"}
//                       >
//                         4
//                       </Text>
//                     </Box>
//                     <Text
//                       as="h2"
//                       variant="headingSm"
//                       tone={isAppActive ? undefined : "subdued"}
//                     >
//                       Specific Product Overrides
//                     </Text>
//                   </InlineStack>
//                   <Text as="p" as="p" variant="bodyMd" tone={isAppActive ? "subdued" : "disabled"}>
//                     Override global rules for selected products when needed.
//                   </Text>
//                   <Box paddingBlockStart="200">
//                     <Button
//                       variant="secondary"
//                       disabled={!isAppActive}
//                       onClick={() => {/* Open product selector */}}
//                     >
//                       Select Products
//                     </Button>
//                   </Box>
//                 </BlockStack>
//               </Card>

//               {/* How It Works */}
//               <Box padding="400" background="bg-surface-success-subdued" borderRadius="200">
//                 <BlockStack gap="300">
//                   <Text as="p" as="h2" variant="headingSm">
//                     How It Works
//                   </Text>
//                   <InlineGrid columns={2} gap="400">
//                     <Box padding="300" background="bg-surface" borderRadius="200">
//                       <BlockStack gap="200">
//                         <Badge tone="success">Global Rules Enabled</Badge>
//                         <List type="bullet">
//                           <List.Item>
//                             All products support sample purchases
//                           </List.Item>
//                           <List.Item>
//                             Use default settings above
//                           </List.Item>
//                           <List.Item>
//                             Override per product if needed
//                           </List.Item>
//                         </List>
//                       </BlockStack>
//                     </Box>
//                     <Box padding="300" background="bg-surface" borderRadius="200">
//                       <BlockStack gap="200">
//                         <Badge tone="attention">Global Rules Disabled</Badge>
//                         <List type="bullet">
//                           <List.Item>
//                             Only selected products allow samples
//                           </List.Item>
//                           <List.Item>
//                             Custom settings per product
//                           </List.Item>
//                           <List.Item>
//                             More granular control
//                           </List.Item>
//                         </List>
//                       </BlockStack>
//                     </Box>
//                   </InlineGrid>
//                 </BlockStack>
//               </Box>
//             </BlockStack>
//           </Card>
//         </Layout.Section>

//         {/* Theme Settings Card */}
//         <Layout.Section>
//           <Card>
//             <BlockStack gap="400">
//               <InlineStack align="space-between" blockAlign="center">
//                 <Text as="p" variant="headingMd" as="h3">
//                   Theme Settings
//                 </Text>
//                 <Button
//                   variant="plain"
//                   onClick={() => setShowThemeSettings(!showThemeSettings)}
//                   disabled={!isAppActive}
//                 >
//                   {showThemeSettings ? 'Hide Settings' : 'Show Settings'}
//                 </Button>
//               </InlineStack>

//               <Text as="p" as="p" variant="bodyMd">
//                 Button labels, colors, and tones will reflect on the storefront
//                 wherever the sample purchase option is enabled.
//               </Text>

//               <Collapsible open={showThemeSettings && isAppActive}>
//                 <Box padding="400" background="bg-surface" borderRadius="200">
//                   <BlockStack gap="400">
//                     <InlineGrid columns={2} gap="400">
//                       <TextField
//                         label="Button Label"
//                         value={buttonLabel}
//                         onChange={setButtonLabel}
//                         autoComplete="off"
//                         disabled={!isAppActive}
//                         helpText="Text displayed on the sample button"
//                       />
//                       <Select
//                         label="Button Style"
//                         options={[
//                           {label: 'Primary', value: 'primary'},
//                           {label: 'Secondary', value: 'secondary'},
//                           {label: 'Tertiary', value: 'tertiary'},
//                         ]}
//                         value={buttonStyle}
//                         onChange={setButtonStyle}
//                         disabled={!isAppActive}
//                       />
//                     </InlineGrid>

//                     <BlockStack gap="200">
//                       <Text as="p" variant="bodySm" fontWeight="medium" as="span">
//                         Button Color
//                       </Text>
//                       <InlineStack gap="200" blockAlign="center">
//                         <Box
//                           style={{
//                             width: '40px',
//                             height: '40px',
//                             backgroundColor: buttonColor,
//                             borderRadius: '4px',
//                             border: '1px solid var(--p-border-subdued)'
//                           }}
//                         />
//                         <Box width="100%">
//                           <TextField
//                             value={buttonColor}
//                             onChange={setButtonColor}
//                             autoComplete="off"
//                             disabled={!isAppActive}
//                             prefix="#"
//                             maxLength={7}
//                           />
//                         </Box>
//                       </InlineStack>
//                     </BlockStack>

//                     {/* Preview */}
//                     <Box padding="400" background="bg-surface" border="divider" borderRadius="200">
//                       <BlockStack gap="300">
//                         <Text as="p" variant="bodySm" fontWeight="medium" as="span">
//                           Preview
//                         </Text>
//                         <InlineStack gap="200">
//                           <Button
//                             variant={buttonStyle as any}
//                             tone="success"
//                             disabled
//                           >
//                             {buttonLabel}
//                           </Button>
//                           <Text as="p" as="p" variant="bodySm" tone="subdued">
//                             This is how your sample button will appear on product pages
//                           </Text>
//                         </InlineStack>
//                       </BlockStack>
//                     </Box>
//                   </BlockStack>
//                 </Box>
//               </Collapsible>

//               <Text as="p" as="p" variant="bodyMd" tone="subdued">
//                 These settings ensure visual consistency with your brand.
//               </Text>
//             </BlockStack>
//           </Card>
//         </Layout.Section>

//         {/* Footer Actions */}
//         <Layout.Section>
//           <Card>
//             <InlineStack align="space-between" blockAlign="center">
//               <Text as="p" variant="bodyMd" tone="subdued" as="p">
//                 {isAppActive
//                   ? "✓ App is active and ready to use"
//                   : "Activate the app to enable sample purchases"}
//               </Text>
//               <InlineStack gap="200">
//                 <Button onClick={handleReset} variant="plain">
//                   Reset All
//                 </Button>
//                 <Button
//                   onClick={handleSave}
//                   variant="primary"
//                   disabled={!isAppActive}
//                 >
//                   Save Settings
//                 </Button>
//               </InlineStack>
//             </InlineStack>
//           </Card>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }
