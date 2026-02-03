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
  Button,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

import { useEffect } from "react";
export default function settings() {
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [shop, setShop] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storeName = shop?.replace(".myshopify.com", "");
const themeEditorUrl = storeName
  ? `https://admin.shopify.com/store/${storeName}/themes/current/editor`
  : undefined;
  const app = useAppBridge();

  const installScriptTag = async () => {
    try {
      setIsInstalling(true);

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
        message: "Storefront script installed successfully 🎉",
      });
    } catch (error: any) {
      setSaveMessage({
        type: "error",
        message: error.message || "Failed to install script",
      });
    } finally {
      setIsInstalling(false);
    }
  };

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

      
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" alignment="center" as="h3">
                Theme Settings
              </Text>
              <Text as="p" alignment="center" variant="bodyMd">
                Button labels, colors, and tones will reflect on the storefront
                wherever the sample purchase option is enabled.
              </Text>
              <Text as="p" variant="bodyMd" alignment="center" >
                These settings ensure visual consistency with your brand.{"  "}By clicking on this sample-product into your live theme

              </Text>
                
              <Button
                size="large"
                variant="primary"
                tone="success"
                loading={isInstalling}
                onClick={installScriptTag}
              >
                {isInstalling ? "Installing…" : "Enable Extension"}
              </Button>
  <Button
    size="large"
    variant="secondary"
    external
    url={themeEditorUrl}
  >
    Open Theme Editor
  </Button>


            </BlockStack>
        
          </Card>
          
        </Layout.Section>
      </Layout>
    </Page>
  );
}