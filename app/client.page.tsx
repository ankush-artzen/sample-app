"use client";

import React, { useState } from "react";
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
} from "@shopify/polaris";

export default function HomePage() {
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  return (
    <Page>
      <Layout>
        {saveMessage && (
          <Layout.Section>
            <Banner
              title={saveMessage.message}
              onDismiss={() => setSaveMessage(null)}
            />
          </Layout.Section>
        )}

        {/* Intro Card */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text
                variant="headingLg"
                as="h2"
                alignment="center"
                tone="success"
              >
                Welcome to Sample Products Pro
              </Text>
              <Text as="p" variant="bodyMd" tone="success" alignment="center">
                Configure how sample products work on your storefront. Follow
                the steps below to activate and control the experience.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* App Settings Card */}
        <Layout.Section>
          <Card padding="500">
            <BlockStack gap="400">
              {/* <Text variant="headingLg" as="h2" fontWeight="bold">
                App Settings
              </Text> */}

              <Text as="p" variant="bodyMd" alignment="center" tone="subdued">
                Enable the app to make sample purchasing available on your
                storefront.
              </Text>

              <Divider />

              <InlineStack gap="500" wrap>
                {/* Upload PDF */}
                <Card>
                  <BlockStack gap="300" align="center">
                    <Text
                      as="p"
                      variant="headingMd"
                      alignment="center"
                      fontWeight="medium"
                      tone="success"
                    >
                      Global Rules
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone="success"
                      alignment="center"
                    >
                      Decide sample rules apply across all products
                    </Text>
                    {/* <Button
                      size="large"
                      variant="primary"
                      url="/products/create"
                      tone="success"
                    >
                      Add specific Product{" "}
                    </Button> */}
                  </BlockStack>
                </Card>

                {/* View Products */}
                <Card>
                  <BlockStack gap="300" align="center">
                    <Text
                      as="p"
                      alignment="center"
                      variant="headingMd"
                      fontWeight="medium"
                      tone="success"
                    >
                      Default Product Settings
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone="success"
                      alignment="center"
                    >
                      These settings apply when global rules are enabled.
                    </Text>
                    {/* <Button
                      size="large"
                      variant="primary"
                      tone="success"
                      url="/products"
                      fullWidth
                    >
                      View Products
                    </Button> */}
                  </BlockStack>
                </Card>

                <Card>
                  <BlockStack gap="300" align="center">
                    <Text
                      as="p"
                      alignment="center"
                      variant="headingMd"
                      fontWeight="medium"
                      tone="success"
                    >
                      Specific Product Overrides{" "}
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone="subdued"
                      alignment="center"
                    >
                      Override global rules for selected products
                    </Text>
                    {/* <Button
                      size="large"
                      variant="primary"
                      tone="success"
                      url="/products/settings"
                      fullWidth
                    >
                      Add Product{" "}
                    </Button> */}
                  </BlockStack>
                </Card>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <BlockStack gap="500">
            <InlineGrid columns={2} gap="400">
              <Box padding="300" background="bg-surface" borderRadius="200">
                <BlockStack gap="200">
                  <Badge tone="success">Global Rules Enabled</Badge>
                  <List type="bullet">
                    <List.Item>All products support sample purchases</List.Item>
                    <List.Item>Use default settings above</List.Item>
                    <List.Item>Override per product if needed</List.Item>
                  </List>
                </BlockStack>
              </Box>
              <Box padding="300" background="bg-surface" borderRadius="200">
                <BlockStack gap="200">
                  <Badge tone="attention">Global Rules Disabled</Badge>
                  <List type="bullet">
                    <List.Item>Only selected products allow samples</List.Item>
                    <List.Item>Custom settings per product</List.Item>
                    <List.Item>More granular control</List.Item>
                  </List>
                </BlockStack>
              </Box>
            </InlineGrid>
          </BlockStack>
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
//                 <Text variant="bodyMd" as="p">
//                   App Status: <Text as="span" variant="bodyMd" fontWeight="bold">
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
//               <Text variant="headingLg" as="h2" alignment="center">
//                 Welcome to Sample Products Pro
//               </Text>
//               <Text as="p" variant="bodyMd" alignment="center" tone="subdued">
//                 Configure how sample products work on your storefront.
//                 Follow the steps below to activate and control the experience.
//               </Text>
//               {/* {!isAppActive && (
//                 <Box padding="400" background="bg-surface-warning" borderRadius="200">
//                   <Text as="p" variant="bodySm" alignment="center" tone="warning">
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
//                 <Text variant="headingMd" as="h3">
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
//                         <Text variant="bodySm" fontWeight="bold" alignment="center" color="text-on-color">
//                           1
//                         </Text>
//                       </Box>
//                       <Text as="h2" variant="headingSm">
//                         App Activation
//                       </Text>
//                     </InlineStack>
//                     <Text as="p" variant="bodyMd" tone="subdued">
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
//                     <Text as="p" variant="bodyMd" tone={isAppActive ? "subdued" : "disabled"}>
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
//                   <Text as="p" variant="bodyMd" tone={isAppActive ? "subdued" : "disabled"}>
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
//                   <Text as="p" variant="bodyMd" tone={isAppActive ? "subdued" : "disabled"}>
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
//                   <Text as="h2" variant="headingSm">
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
//                 <Text variant="headingMd" as="h3">
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

//               <Text as="p" variant="bodyMd">
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
//                       <Text variant="bodySm" fontWeight="medium" as="span">
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
//                         <Text variant="bodySm" fontWeight="medium" as="span">
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
//                           <Text as="p" variant="bodySm" tone="subdued">
//                             This is how your sample button will appear on product pages
//                           </Text>
//                         </InlineStack>
//                       </BlockStack>
//                     </Box>
//                   </BlockStack>
//                 </Box>
//               </Collapsible>

//               <Text as="p" variant="bodyMd" tone="subdued">
//                 These settings ensure visual consistency with your brand.
//               </Text>
//             </BlockStack>
//           </Card>
//         </Layout.Section>

//         {/* Footer Actions */}
//         <Layout.Section>
//           <Card>
//             <InlineStack align="space-between" blockAlign="center">
//               <Text variant="bodyMd" tone="subdued" as="p">
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
