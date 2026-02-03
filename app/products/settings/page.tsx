// "use client";

// import React, { useState } from "react";
// import {
//   Card,
//   Layout,
//   Page,
//   Text,
//   Box,
//   Banner,
//   List,
//   BlockStack,
//   InlineGrid,
//   Badge,
//   Divider,
//   InlineStack,
//   Button,
// } from "@shopify/polaris";
// import { useAppBridge } from "@shopify/app-bridge-react";

// import { useEffect } from "react";
// export default function settings() {
//   const [saveMessage, setSaveMessage] = useState<{
//     type: "success" | "error";
//     message: string;
//   } | null>(null);
//   const [isInstalling, setIsInstalling] = useState(false);
//   const [shop, setShop] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const storeName = shop?.replace(".myshopify.com", "");
// const themeEditorUrl = storeName
//   ? `https://admin.shopify.com/store/${storeName}/themes/current/editor`
//   : undefined;
//   const app = useAppBridge();

//   const installScriptTag = async () => {
//     try {
//       setIsInstalling(true);

//       const shop = window.shopify?.config?.shop;

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
//         message: "Storefront script installed successfully 🎉",
//       });
//     } catch (error: any) {
//       setSaveMessage({
//         type: "error",
//         message: error.message || "Failed to install script",
//       });
//     } finally {
//       setIsInstalling(false);
//     }
//   };

//    useEffect(() => {
//       if (!app) return;
  
//       const shopFromConfig = (app as any)?.config?.shop;
  
//       if (shopFromConfig) {
//         setShop(shopFromConfig);
//         setError(null);
//       } else {
//         setShop(null);
//         setError("Unable to retrieve shop info. Please reload the app.");
//       }
//     }, [app]);
//   return (
//     <Page>
//       <Layout>
//         {saveMessage && (
//           <Layout.Section>
//             <Banner
//               title={saveMessage.message}
//               onDismiss={() => setSaveMessage(null)}
//             />
//           </Layout.Section>
//         )}

      
//         <Layout.Section>
//           <Card>
//             <BlockStack gap="400">
//               <Text variant="headingMd" alignment="center" as="h3">
//                 Theme Settings
//               </Text>
//               <Text as="p" alignment="center" variant="bodyMd">
//                 Button labels, colors, and tones will reflect on the storefront
//                 wherever the sample purchase option is enabled.
//               </Text>
//               <Text as="p" variant="bodyMd" alignment="center" >
//                 These settings ensure visual consistency with your brand.{"  "}By clicking on this sample-product into your live theme

//               </Text>
                
//               <Button
//                 size="large"
//                 variant="primary"
//                 tone="success"
//                 loading={isInstalling}
//                 onClick={installScriptTag}
//               >
//                 {isInstalling ? "Installing…" : "Enable Extension"}
//               </Button>
//   <Button
//     size="large"
//     variant="secondary"
//     external
//     url={themeEditorUrl}
//   >
//     Open Theme Editor
//   </Button>


//             </BlockStack>
        
//           </Card>
          
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }

"use client";

import React, { useState } from "react";
import {
  Card,
  Layout,
  Page,
  Text,
  Banner,
  BlockStack,
  InlineGrid,
  Button,
  Icon,
  Box,
  Divider,
  Badge,
  InlineStack,
  CalloutCard,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";

export default function Settings() {
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [shop, setShop] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeName = shop?.replace(".myshopify.com", "");
  const themeEditorUrl = storeName
    ? `https://admin.shopify.com/store/${storeName}/themes/current/editor`
    : "#";

  const app = useAppBridge();

  const installScriptTag = async () => {
    try {
      setIsInstalling(true);
      setSaveMessage(null);

      const shop = window.shopify?.config?.shop;

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
        message: "🎉 Storefront script installed successfully! Your theme is now enhanced with new features.",
      });
    } catch (error: any) {
      setSaveMessage({
        type: "error",
        message: `❌ ${error.message || "Failed to install script. Please try again."}`,
      });
    } finally {
      setIsInstalling(false);
    }
  };

  useEffect(() => {
    if (!app) return;
    setIsLoading(true);

    // Simulate a small delay for better UX
    const timer = setTimeout(() => {
      const shopFromConfig = (app as any)?.config?.shop;

      if (shopFromConfig) {
        setShop(shopFromConfig);
        setError(null);
      } else {
        setShop(null);
        setError("Unable to retrieve shop info. Please reload the app.");
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [app]);

  return (
    <Page 
      title="Theme Settings" 
      subtitle="Customize your store's appearance and functionality"
      primaryAction={{
        content: 'View Documentation',
        external: true,
        url: 'https://help.shopify.com',
      }}
    >
      <Layout>
        {/* Status Banner */}
        {saveMessage && (
          <Layout.Section>
            <Banner
              title={saveMessage.message}
              onDismiss={() => setSaveMessage(null)}
            />
          </Layout.Section>
        )}

        {/* Shop Info Banner */}
        {shop && (
          <Layout.Section>
            <CalloutCard
              title={`Connected to ${storeName}`}
              illustration="https://cdn.shopify.com/shopifycloud/web/assets/v1/815375b3.svg"
              primaryAction={{
                content: 'View Store',
                url: `https://${shop}`,
                external: true,
              }}
            >
              <Text as="p" variant="bodyMd">
                Your theme settings will be applied to this store.
              </Text>
            </CalloutCard>
          </Layout.Section>
        )}

        {/* Error State */}
        {error && (
          <Layout.Section>
            <Banner
              title={error}
              tone="critical"
              action={{ content: 'Reload', onAction: () => window.location.reload() }}
            />
          </Layout.Section>
        )}

        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
            {/* Installation Card */}
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h3">
                    Script Installation
                  </Text>
                  {shop && <Badge tone="success">Ready</Badge>}
                </InlineStack>
                
                <Text as="p" variant="bodyMd">
                  Install the necessary scripts to enable advanced features on your storefront. 
                  This includes custom buttons, color schemes, and interactive elements.
                </Text>

                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h4">What gets installed:</Text>
                    <BlockStack gap="100">
                      <InlineStack align="start" gap="200">
                        <Box  padding="100" borderRadius="full">
                        </Box>
                        <Text as="span" variant="bodyMd">Custom button scripts</Text>
                      </InlineStack>
                      <InlineStack align="start" gap="200">
                        <Box  padding="100" borderRadius="full">
                        </Box>
                        <Text as="span" variant="bodyMd">Color theme controller</Text>
                      </InlineStack>
                      <InlineStack align="start" gap="200">
                        <Box padding="100" borderRadius="full">
                        </Box>
                        <Text as="span" variant="bodyMd">Sample product integration</Text>
                      </InlineStack>
                    </BlockStack>
                  </BlockStack>
                </Box>

                <Button
                  size="large"
                  variant="primary"
                  // tone="success"
                  loading={isInstalling}
                  disabled={!shop || isLoading}
                  onClick={installScriptTag}
                  fullWidth
                >
                  {isInstalling ? "Installing…" : "Install Storefront Script"}
                </Button>
                
                {(!shop || isLoading) && (
                  <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                    {isLoading ? "Loading shop information..." : "Shop information is required"}
                  </Text>
                )}
              </BlockStack>
            </Card>

            {/* Theme Editor Card */}
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h3">
                    Theme Customization
                  </Text>
                  {shop && <Badge tone="info">Available</Badge>}
                </InlineStack>
                
                <Text as="p" variant="bodyMd">
                  Customize button labels, colors, and tones to match your brand identity. 
                  These settings ensure visual consistency across your storefront.You can apply this to your store 
                </Text>

                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h4">Customizable elements:</Text>
                    <BlockStack gap="100">
                      <InlineStack gap="200" align="start">
                        <Badge tone="info">Button Labels</Badge>
                        <Text as="span" variant="bodyMd">Customize call-to-action text</Text>
                      </InlineStack>
                      <InlineStack gap="200" align="start">
                        <Badge tone="info">Color Scheme</Badge>
                        <Text as="span" variant="bodyMd">Match your brand colors</Text>
                      </InlineStack>
                      <InlineStack gap="200" align="start">
                        <Badge tone="info">Visual Tone</Badge>
                        <Text as="span" variant="bodyMd">Set button styles and effects</Text>
                      </InlineStack>
                    </BlockStack>
                  </BlockStack>
                </Box>

                <Button
                  size="large"
                  variant="primary"
                  external
                  url={themeEditorUrl}
                  disabled={!shop || isLoading}
                  fullWidth
                >
                  Open Theme Editor
                </Button>
                
                {/* {shop && (
                  <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                    Will open in a new tab
                  </Text>
                )} */}
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* Instructions Section */}
        <Layout.Section>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" fontWeight="bold" as="h3" alignment="center">
                Setup Instructions
              </Text>
              
              <Divider />
              
              <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                <Box padding="400">
                  <BlockStack gap="200" align="center">
                    <Box
                      background="bg-surface-brand"
                      padding="400"
                      borderRadius="300"
                    >
                      <Text variant="headingLg" as="h2"  alignment="center">
                        1
                      </Text>
                    </Box>
                    <Text variant="headingSm" as="h4" alignment="center">
                      Install Script
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                      Click "Install Storefront Script" to add required functionality to your theme.
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
                      <Text variant="headingLg" as="h2" alignment="center">
                        2
                      </Text>
                    </Box>
                    <Text variant="headingSm" as="h4" alignment="center">
                      Customize Theme
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                      Open Theme Editor to adjust colors, buttons, and styles to match your brand.
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
                      <Text variant="headingLg" as="h2" tone="subdued" alignment="center">
                        3
                      </Text>
                    </Box>
                    <Text variant="headingSm" as="h4" alignment="center">
                      Add Products
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                      Configure sample products in your theme to see the changes in action.
                    </Text>
                  </BlockStack>
                </Box>
              </InlineGrid>

              <Box padding="400" background="bg-surface-info" borderRadius="200">
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h4">
                    💡 Pro Tip
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Always preview changes in your theme editor before publishing. 
                    This ensures your storefront maintains a professional appearance.
                  </Text>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Footer Note */}
        <Layout.Section>
          <Box padding="400">
            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
              Need help? Contact our support team or refer to the documentation.
            </Text>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}