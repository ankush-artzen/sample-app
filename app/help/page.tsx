"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  List,
  Badge,
  Divider,
  Box,
  InlineStack,
  BlockStack,
  Button,
} from "@shopify/polaris";

export default function HelpPage() {
  return (
    <Page title="Sample Products Pro – Help & Setup">
      <Layout>

        {/* Intro */}
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Welcome to Sample Products Pro
            </Text>

            <Box paddingBlockStart="200">
              <Text as="p">
                Configure how sample products work on your storefront. Follow the
                steps below to activate and control the experience.
              </Text>
            </Box>
          </Card>
        </Layout.Section>

        {/* Sample Product Settings */}
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Sample Product Settings
            </Text>

            <List>
              <List.Item>
                <strong>Disabled</strong> – Hide Sample Product Settings (original
                product price will apply)
              </List.Item>

              <List.Item>
                <strong>Enabled</strong> – Show Sample Product Settings and allow
                sample purchasing
              </List.Item>
            </List>

            <Divider />

            <Box paddingBlockStart="200">
              <Text variant="bodyMd" as="p" fontWeight="medium">
                Default Pricing Method
              </Text>

              <List>
                <List.Item>
                  <strong>Fixed Price</strong> – All samples will have the same
                  price
                </List.Item>

                <List.Item>
                  <strong>Percentage Off</strong> – All samples receive the same
                  discount based on original price
                </List.Item>
              </List>

              <Box paddingBlockStart="200">
                <Text as="p">
                  Fixed Sample Price applies globally unless overridden by custom
                  pricing.
                </Text>
              </Box>
            </Box>
          </Card>
        </Layout.Section>

        {/* Custom Pricing */}
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Custom Product Pricing
            </Text>

            <Text as="p">
              Override default pricing for specific products. Added prices are
              applied automatically
            </Text>
          </Card>
        </Layout.Section>

        {/* Theme Settings */}
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Theme Settings
            </Text>

            <Text as="p">
              Customize your store’s appearance and functionality. Your theme
              settings are connected to your current store.
            </Text>

            <Box paddingBlockStart="200">
              <Badge tone="success">Connected</Badge>
            </Box>
          </Card>
        </Layout.Section>


        {/* Full Width Setup Instructions */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2" fontWeight="medium">
                Setup Instructions
              </Text>

              <List type="number">
                <List.Item>
                  <BlockStack gap="200">
                    <Text as="p">Install Script</Text>
                    <Text as="span" variant="bodySm">
                      Click "Install Storefront Script" to add required functionality to your theme.
                    </Text>
                  </BlockStack>
                </List.Item>

                <List.Item>
                  <BlockStack gap="200">
                    <Text as="h2"  fontWeight="medium">Customize Theme</Text>
                    <Text as="span" variant="bodySm">
                      Open Theme Editor to adjust colors, buttons, and styles to match your brand.
                    </Text>
                  </BlockStack>
                </List.Item>

                <List.Item>
                  <BlockStack gap="200">
                  <Text as="p" fontWeight="medium">Add Products</Text>
                    <Text as="span" variant="bodySm">
                      Configure sample products in your theme to see the changes in action.
                    </Text>
                  </BlockStack>
                </List.Item>
              </List>

              <Box padding="400" borderRadius="200">
                <InlineStack gap="200">
                  <Badge tone="attention">Pro Tip</Badge>
                  <Text as="span" variant="bodySm">
                    Always preview changes in your theme editor before publishing
                  </Text>
                </InlineStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Theme Customization Details */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2" fontWeight="medium">
                Theme Customization
              </Text>

              <Text as="p">
                Customize button labels, colors, and tones to match your brand identity.
              </Text>

              <Box>
                <List>
                  <List.Item>
                    <InlineStack gap="200">
                      <Badge>Button Labels</Badge>
                      <Text as="span">Customize call-to-action text</Text>
                    </InlineStack>
                  </List.Item>
                  <List.Item>
                    <InlineStack gap="200">
                      <Badge>Color Scheme</Badge>
                      <Text as="span">Match your brand colors</Text>
                    </InlineStack>
                  </List.Item>
                  <List.Item>
                    <InlineStack gap="200">
                      <Badge>Visual Tone</Badge>
                      <Text as="span">Set button styles and effects</Text>
                    </InlineStack>
                  </List.Item>
                </List>
              </Box>

            </BlockStack>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
