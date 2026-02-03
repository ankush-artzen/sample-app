"use client";

import {
  Page,
  Card,
  Button,
  Checkbox,
  TextField,
  Layout,
} from "@shopify/polaris";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function ProductSampleSettings() {
  const app = useAppBridge(); 

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSampleProduct, setSelectedSampleProduct] = useState<any>(null);
  const [enabled, setEnabled] = useState(false);
  const [limit, setLimit] = useState("1");
  const [onePerCustomer, setOnePerCustomer] = useState(true);
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, isError = false) => {
    console.log(isError ? `❌ ${message}` : `✅ ${message}`);
  };

  const selectProduct = async () => {
    const pickerResult = await window.shopify?.resourcePicker({
      type: "product",
      multiple: false,
    });

    const product = pickerResult?.selection?.[0];
    if (!product) return showToast("No product selected", true);

    setSelectedProduct({
      id: product.id.split("/").pop(),
      title: product.title,
    });
  };

  const selectSampleProduct = async () => {
    const pickerResult = await window.shopify?.resourcePicker({
      type: "product",
      multiple: false,
    });

    const product = pickerResult?.selection?.[0];
    if (!product) return showToast("No sample product selected", true);

    setSelectedSampleProduct({
      id: product.id.split("/").pop(),
      title: product.title,
    });
  };

  const saveSettings = async () => {
    if (!selectedProduct || !selectedSampleProduct) return;

    setLoading(true);

    const shop = app?.config?.shop;

    const res = await fetch("/api/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop,
        productId: selectedProduct.id,
        sampleProductId: selectedSampleProduct.id,
        enabled,
        limit,
        onePerCustomer,
      }),
    });

    setLoading(false);

    res.ok
      ? showToast("Settings saved successfully")
      : showToast("Failed to save settings", true);
  };

  return (
    <Page title="Sample Product Settings">
      <Card>
        <Layout>
          <Layout.Section>
            <Button onClick={selectProduct}>
              {selectedProduct ? selectedProduct.title : "Select Product"}
            </Button>
          </Layout.Section>

          <Layout.Section>
            <Checkbox
              label="Enable sample for this product"
              checked={enabled}
              onChange={setEnabled}
            />
          </Layout.Section>

          {enabled && (
            <>
              <Layout.Section>
                <Button onClick={selectSampleProduct}>
                  {selectedSampleProduct
                    ? selectedSampleProduct.title
                    : "Select Sample Product"}
                </Button>
              </Layout.Section>

              <Layout.Section>
                <TextField
                  label="Sample limit"
                  type="number"
                  value={limit}
                  onChange={setLimit}
                  autoComplete="off"
                />
              </Layout.Section>

              <Layout.Section>
                <Checkbox
                  label="Allow only one sample per customer"
                  checked={onePerCustomer}
                  onChange={setOnePerCustomer}
                />
              </Layout.Section>
            </>
          )}

          <Layout.Section>
            <Button
              variant="primary"
              loading={loading}
              disabled={!enabled || !selectedProduct || !selectedSampleProduct}
              onClick={saveSettings}
            >
              Save Settings
            </Button>
          </Layout.Section>
        </Layout>
      </Card>
    </Page>
  );
}
// "use client";

// import {
//   Page,
//   Card,
//   Button,
//   Checkbox,
//   TextField,
//   Layout,
//   DataTable,
//   IndexTable,
//   Text,
//   Box,
//   Badge,
//   IndexFilters,
//   useSetIndexFiltersMode,
//   useIndexResourceState,
//   LegacyCard,
//   EmptyState,
//   Spinner,
//   Modal,
// } from "@shopify/polaris";
// import { useState, useEffect, useCallback } from "react";
// import { useAppBridge } from "@shopify/app-bridge-react";

// interface ProductSetting {
//   id: string;
//   productId: string;
//   productTitle: string;
//   sampleProductId: string;
//   sampleProductTitle: string;
//   enabled: boolean;
//   limit: string;
//   onePerCustomer: boolean;
//   createdAt: string;
// }

// export default function ProductSampleSettings() {
//   const app = useAppBridge();
//   const [selectedProduct, setSelectedProduct] = useState<any>(null);
//   const [selectedSampleProduct, setSelectedSampleProduct] = useState<any>(null);
//   const [enabled, setEnabled] = useState(false);
//   const [limit, setLimit] = useState("1");
//   const [onePerCustomer, setOnePerCustomer] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [enableAll, setEnableAll] = useState(false);
//   const [settings, setSettings] = useState<ProductSetting[]>([]);
//   const [loadingSettings, setLoadingSettings] = useState(true);
//   const [bulkLoading, setBulkLoading] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState<string | null>(null);

//   // Fetch existing settings
//   const fetchSettings = useCallback(async () => {
//     setLoadingSettings(true);
//     try {
//       const shop = app?.config?.shop;
//       const res = await fetch(`/api/products/settings?shop=${shop}`);
//       if (res.ok) {
//         const data = await res.json();
//         setSettings(data);
//       }
//     } catch (error) {
//       console.error("Error fetching settings:", error);
//     } finally {
//       setLoadingSettings(false);
//     }
//   }, [app]);

//   useEffect(() => {
//     fetchSettings();
//   }, [fetchSettings]);

//   const showToast = (message: string, isError = false) => {
//     console.log(isError ? `❌ ${message}` : `✅ ${message}`);
//   };

//   const selectProduct = async () => {
//     const pickerResult = await window.shopify?.resourcePicker({
//       type: "product",
//       multiple: false,
//     });

//     const product = pickerResult?.selection?.[0];
//     if (!product) return showToast("No product selected", true);

//     setSelectedProduct({
//       id: product.id.split("/").pop(),
//       title: product.title,
//     });
//   };

//   const selectSampleProduct = async () => {
//     const pickerResult = await window.shopify?.resourcePicker({
//       type: "product",
//       multiple: false,
//     });

//     const product = pickerResult?.selection?.[0];
//     if (!product) return showToast("No sample product selected", true);

//     setSelectedSampleProduct({
//       id: product.id.split("/").pop(),
//       title: product.title,
//     });
//   };

//   const saveSettings = async () => {
//     if (!selectedProduct || !selectedSampleProduct) return;

//     setLoading(true);

//     const shop = app?.config?.shop;

//     try {
//       const res = await fetch("/api/products/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           productId: selectedProduct.id,
//           productTitle: selectedProduct.title,
//           sampleProductId: selectedSampleProduct.id,
//           sampleProductTitle: selectedSampleProduct.title,
//           enabled,
//           limit,
//           onePerCustomer,
//         }),
//       });

//       if (res.ok) {
//         showToast("Settings saved successfully");
//         // Reset form
//         setSelectedProduct(null);
//         setSelectedSampleProduct(null);
//         setEnabled(false);
//         setLimit("1");
//         setOnePerCustomer(true);
//         // Refresh settings list
//         fetchSettings();
//       } else {
//         showToast("Failed to save settings", true);
//       }
//     } catch (error) {
//       showToast("Error saving settings", true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleAllSettings = async () => {
//     setBulkLoading(true);
//     try {
//       const shop = app?.config?.shop;
//       const res = await fetch("/api/products/bulk-enable", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           enable: enableAll,
//         }),
//       });

//       if (res.ok) {
//         showToast(`All settings ${enableAll ? "enabled" : "disabled"} successfully`);
//         fetchSettings();
//         setEnableAll(!enableAll);
//       } else {
//         showToast("Failed to update settings", true);
//       }
//     } catch (error) {
//       showToast("Error updating settings", true);
//     } finally {
//       setBulkLoading(false);
//     }
//   };

//   const toggleSetting = async (id: string, currentStatus: boolean) => {
//     try {
//       const shop = app?.config?.shop;
//       const res = await fetch("/api/products/toggle", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           id,
//           enabled: !currentStatus,
//         }),
//       });

//       if (res.ok) {
//         showToast(`Setting ${!currentStatus ? "enabled" : "disabled"}`);
//         fetchSettings();
//       } else {
//         showToast("Failed to update setting", true);
//       }
//     } catch (error) {
//       showToast("Error updating setting", true);
//     }
//   };

//   const deleteSetting = async (id: string) => {
//     try {
//       const shop = app?.config?.shop;
//       const res = await fetch("/api/products/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           id,
//         }),
//       });

//       if (res.ok) {
//         showToast("Setting deleted successfully");
//         fetchSettings();
//         setDeleteModalOpen(false);
//         setItemToDelete(null);
//       } else {
//         showToast("Failed to delete setting", true);
//       }
//     } catch (error) {
//       showToast("Error deleting setting", true);
//     }
//   };

//   const handleDeleteClick = (id: string) => {
//     setItemToDelete(id);
//     setDeleteModalOpen(true);
//   };

//   const resourceName = {
//     singular: "product setting",
//     plural: "product settings",
//   };

//   const rowMarkup = settings.map(
//     (setting, index) => (
//       <IndexTable.Row
//         id={setting.id}
//         key={setting.id}
//         position={index}
//       >
//         <IndexTable.Cell>
//           <Text fontWeight="bold" as="span">
//             {setting.productTitle}
//           </Text>
//         </IndexTable.Cell>
//         <IndexTable.Cell>
//           <Text as="span">{setting.sampleProductTitle}</Text>
//         </IndexTable.Cell>
//         <IndexTable.Cell>
//           <Badge tone={setting.enabled ? "success" : "critical"}>
//             {setting.enabled ? "Enabled" : "Disabled"}
//           </Badge>
//         </IndexTable.Cell>
//         <IndexTable.Cell>
//           <Text as="span">{setting.limit}</Text>
//         </IndexTable.Cell>
//         <IndexTable.Cell>
//           <Badge tone={setting.onePerCustomer ? "success" : "critical"}>
//             {setting.onePerCustomer ? "Yes" : "No"}
//           </Badge>
//         </IndexTable.Cell>
//         <IndexTable.Cell>
//           <Box >
//             <Button
//               size="slim"
//               onClick={() => toggleSetting(setting.id, setting.enabled)}
//             >
//               {setting.enabled ? "Disable" : "Enable"}
//             </Button>
//             <Button
//               size="slim"
//               tone="critical"
//               onClick={() => handleDeleteClick(setting.id)}
//             >
//               Delete
//             </Button>
//           </Box>
//         </IndexTable.Cell>
//       </IndexTable.Row>
//     )
//   );

//   return (
//     <Page
//       title="Sample Product Settings"
//       primaryAction={{
//         content: "Save Settings",
//         loading: loading,
//         disabled: !enabled || !selectedProduct || !selectedSampleProduct,
//         onAction: saveSettings,
//       }}
//       // secondaryActions={[
//       //   {
//       //     content: enableAll ? "Disable All" : "Enable All",
//       //     loading: bulkLoading,
//       //     onAction: toggleAllSettings,
//       //   },
//       // ]}
//     >
//       <Layout>
//         {/* Add New Setting Card */}
//         <Layout.Section>
//           <Card>
//             <Card>
//               <Layout>
//                 <Layout.Section>
//                   <Button onClick={selectProduct}>
//                     {selectedProduct ? selectedProduct.title : "Select Main Product"}
//                   </Button>
//                 </Layout.Section>

//                 <Layout.Section>
//                   <Checkbox
//                     label="Enable sample for this product"
//                     checked={enabled}
//                     onChange={setEnabled}
//                   />
//                 </Layout.Section>

//                 {enabled && (
//                   <>
//                     <Layout.Section>
//                       <Button onClick={selectSampleProduct}>
//                         {selectedSampleProduct
//                           ? selectedSampleProduct.title
//                           : "Select Sample Product"}
//                       </Button>
//                     </Layout.Section>

//                     <Layout.Section>
//                       <TextField
//                         label="Sample limit per order"
//                         type="number"
//                         value={limit}
//                         onChange={setLimit}
//                         autoComplete="off"
//                         min={1}
//                         helpText="Maximum number of samples allowed per order"
//                       />
//                     </Layout.Section>

//                     <Layout.Section>
//                       <Checkbox
//                         label="Allow only one sample per customer"
//                         checked={onePerCustomer}
//                         onChange={setOnePerCustomer}
//                         helpText="Prevents customers from ordering multiple samples"
//                       />
//                     </Layout.Section>
//                   </>
//                 )}
//               </Layout>
//             </Card>
//           </Card>
//         </Layout.Section>

//         {/* Existing Settings Card */}
//         {/* <Layout.Section>
//           <LegacyCard>
//             <LegacyCard.Header title="Existing Settings">
//               <Button
//                 loading={loadingSettings}
//                 onClick={fetchSettings}
//               >
//                 Refresh
//               </Button>
//             </LegacyCard.Header>
//             <LegacyCard.Section>
//               {loadingSettings ? (
//                 <Box padding="4">
//                   <Spinner size="large" />
//                 </Box>
//               ) : settings.length === 0 ? (
//                 <EmptyState
//                   heading="No product settings yet"
//                   image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
//                 >
//                   <p>Add your first product setting above.</p>
//                 </EmptyState>
//               ) : (
//                 <IndexTable
//                   resourceName={resourceName}
//                   itemCount={settings.length}
//                   headings={[
//                     { title: "Product" },
//                     { title: "Sample Product" },
//                     { title: "Status" },
//                     { title: "Limit" },
//                     { title: "One per Customer" },
//                     { title: "Actions" },
//                   ]}
//                   selectable={false}
//                 >
//                   {rowMarkup}
//                 </IndexTable>
//               )}
//             </LegacyCard.Section>
//           </LegacyCard>
//         </Layout.Section> */}
//       </Layout>

//       {/* Delete Confirmation Modal */}
//       <Modal
//         open={deleteModalOpen}
//         onClose={() => {
//           setDeleteModalOpen(false);
//           setItemToDelete(null);
//         }}
//         title="Delete Setting"
//         primaryAction={{
//           content: "Delete",
//           onAction: () => itemToDelete && deleteSetting(itemToDelete),
//         }}
//         secondaryActions={[
//           {
//             content: "Cancel",
//             onAction: () => {
//               setDeleteModalOpen(false);
//               setItemToDelete(null);
//             },
//           },
//         ]}
//       >
//         <Modal.Section>
//           <Text as="p">
//             Are you sure you want to delete this product setting? This action cannot be undone.
//           </Text>
//         </Modal.Section>
//       </Modal>
//     </Page>
//   );
// }
// "use client";

// import {
//   Page,
//   Card,
//   Button,
//   Checkbox,
//   TextField,
//   Layout,
//   DataTable,
//   IndexTable,
//   Text,
//   Box,
//   Badge,
//   IndexFilters,
//   useSetIndexFiltersMode,
//   useIndexResourceState,
//   LegacyCard,
//   EmptyState,
//   Spinner,
//   Modal,
//   Form,
//   FormLayout,
//   Select,
//   Thumbnail,
//   Toast,
//   Frame,
// } from "@shopify/polaris";
// import { useState, useEffect, useCallback } from "react";
// import { useAppBridge } from "@shopify/app-bridge-react";

// interface ProductSetting {
//   id: string;
//   productId: string;
//   productTitle: string;
//   sampleProductId: string;
//   sampleProductTitle: string;
//   enabled: boolean;
//   limit: string;
//   onePerCustomer: boolean;
//   createdAt: string;
// }

// export default function ProductSampleSettings() {
//   const app = useAppBridge();
//   const [selectedProduct, setSelectedProduct] = useState<any>(null);
//   const [selectedSampleProduct, setSelectedSampleProduct] = useState<any>(null);
//   const [enabled, setEnabled] = useState(false);
//   const [limit, setLimit] = useState("1");
//   const [onePerCustomer, setOnePerCustomer] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [enableAll, setEnableAll] = useState(false);
//   const [settings, setSettings] = useState<ProductSetting[]>([]);
//   const [loadingSettings, setLoadingSettings] = useState(true);
//   const [bulkLoading, setBulkLoading] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState<string | null>(null);
//   const [activeToast, setActiveToast] = useState<{
//     show: boolean;
//     content: string;
//     error?: boolean;
//   }>({
//     show: false,
//     content: "",
//   });

//   // Toast management
//   const showToast = (message: string, isError = false) => {
//     setActiveToast({
//       show: true,
//       content: message,
//       error: isError,
//     });
//   };

//   const toggleToastMarkup = activeToast.show ? (
//     <Toast
//       content={activeToast.content}
//       error={activeToast.error}
//       onDismiss={() => setActiveToast({ show: false, content: "" })}
//     />
//   ) : null;

//   // Fetch existing settings
//   const fetchSettings = useCallback(async () => {
//     setLoadingSettings(true);
//     try {
//       const shop = app?.config?.shop;
//       const res = await fetch(`/api/products/settings?shop=${shop}`);
//       if (res.ok) {
//         const data = await res.json();
//         setSettings(data);
//       } else {
//         showToast("Failed to fetch settings", true);
//       }
//     } catch (error) {
//       console.error("Error fetching settings:", error);
//       showToast("Error fetching settings", true);
//     } finally {
//       setLoadingSettings(false);
//     }
//   }, [app]);

//   useEffect(() => {
//     fetchSettings();
//   }, [fetchSettings]);

//   const selectProduct = async () => {
//     const pickerResult = await window.shopify?.resourcePicker({
//       type: "product",
//       multiple: false,
//     });

//     const product = pickerResult?.selection?.[0];
//     if (!product) {
//       showToast("No product selected", true);
//       return;
//     }

//     setSelectedProduct({
//       id: product.id.split("/").pop(),
//       title: product.title,
//       image: product.images?.[0]?.src,
//     });
//   };

//   const selectSampleProduct = async () => {
//     const pickerResult = await window.shopify?.resourcePicker({
//       type: "product",
//       multiple: false,
//     });

//     const product = pickerResult?.selection?.[0];
//     if (!product) {
//       showToast("No sample product selected", true);
//       return;
//     }

//     setSelectedSampleProduct({
//       id: product.id.split("/").pop(),
//       title: product.title,
//       image: product.images?.[0]?.src,
//     });
//   };

//   const saveSettings = async () => {
//     if (!selectedProduct || !selectedSampleProduct) {
//       showToast("Please select both main and sample products", true);
//       return;
//     }

//     setLoading(true);
//     const shop = app?.config?.shop;

//     try {
//       const res = await fetch("/api/products/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           productId: selectedProduct.id,
//           productTitle: selectedProduct.title,
//           sampleProductId: selectedSampleProduct.id,
//           sampleProductTitle: selectedSampleProduct.title,
//           enabled,
//           limit,
//           onePerCustomer,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         showToast("Settings saved successfully");
//         // Reset form
//         setSelectedProduct(null);
//         setSelectedSampleProduct(null);
//         setEnabled(false);
//         setLimit("1");
//         setOnePerCustomer(true);
//         // Refresh settings list
//         fetchSettings();
//       } else {
//         showToast(data.error || "Failed to save settings", true);
//       }
//     } catch (error) {
//       showToast("Error saving settings", true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Bulk Enable for All Products
//   const applyToAllProducts = async () => {
//     if (!selectedSampleProduct) {
//       showToast("Please select a sample product first", true);
//       return;
//     }

//     setBulkLoading(true);
//     try {
//       const shop = app?.config?.shop;
      
//       const requestBody = {
//         shop,
//         enabled: true,
//         enableAll: true,
//         sampleProductId: selectedSampleProduct?.id,
//         limit: parseInt(limit) || 1,
//         onePerCustomer,
//       };
      
//       console.log("Sending request body:", requestBody);
      
//       const res = await fetch("/api/products/bulk-enable", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       const responseData = await res.json();
//       console.log("API Response:", responseData);
      
//       if (res.ok) {
//         showToast("Sample enabled for all products");
//         fetchSettings();
//         setEnableAll(false);
//       } else {
//         showToast(`Failed: ${responseData.error || "Unknown error"}`, true);
//       }
//     } catch (err) {
//       console.error("Error:", err);
//       showToast("Error enabling all products", true);
//     } finally {
//       setBulkLoading(false);
//     }
//   };

//   const toggleSetting = async (id: string, currentStatus: boolean) => {
//     try {
//       const shop = app?.config?.shop;
//       const res = await fetch("/api/products/toggle", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           id,
//           enabled: !currentStatus,
//         }),
//       });

//       if (res.ok) {
//         showToast(`Setting ${!currentStatus ? "enabled" : "disabled"}`);
//         fetchSettings();
//       } else {
//         showToast("Failed to update setting", true);
//       }
//     } catch (error) {
//       showToast("Error updating setting", true);
//     }
//   };

//   const deleteSetting = async (id: string) => {
//     try {
//       const shop = app?.config?.shop;
//       const res = await fetch("/api/products/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shop,
//           id,
//         }),
//       });

//       if (res.ok) {
//         showToast("Setting deleted successfully");
//         fetchSettings();
//         setDeleteModalOpen(false);
//         setItemToDelete(null);
//       } else {
//         showToast("Failed to delete setting", true);
//       }
//     } catch (error) {
//       showToast("Error deleting setting", true);
//     }
//   };

//   const handleDeleteClick = (id: string) => {
//     setItemToDelete(id);
//     setDeleteModalOpen(true);
//   };

//   const resourceName = {
//     singular: "product setting",
//     plural: "product settings",
//   };

//   const rowMarkup = settings.map((setting, index) => (
//     <IndexTable.Row id={setting.id} key={setting.id} position={index}>
//       <IndexTable.Cell>
//         <Text fontWeight="bold" as="span">
//           {setting.productTitle}
//         </Text>
//       </IndexTable.Cell>
//       <IndexTable.Cell>
//         <Text as="span">{setting.sampleProductTitle}</Text>
//       </IndexTable.Cell>
//       <IndexTable.Cell>
//         <Badge tone={setting.enabled ? "success" : "critical"}>
//           {setting.enabled ? "Enabled" : "Disabled"}
//         </Badge>
//       </IndexTable.Cell>
//       <IndexTable.Cell>
//         <Text as="span">{setting.limit}</Text>
//       </IndexTable.Cell>
//       <IndexTable.Cell>
//         <Badge tone={setting.onePerCustomer ? "success" : "critical"}>
//           {setting.onePerCustomer ? "Yes" : "No"}
//         </Badge>
//       </IndexTable.Cell>
//       <IndexTable.Cell>
//         <Box >
//           <Button
//             size="slim"
//             onClick={() => toggleSetting(setting.id, setting.enabled)}
//           >
//             {setting.enabled ? "Disable" : "Enable"}
//           </Button>
//           <Button
//             size="slim"
//             tone="critical"
//             onClick={() => handleDeleteClick(setting.id)}
//           >
//             Delete
//           </Button>
//         </Box>
//       </IndexTable.Cell>
//     </IndexTable.Row>
//   ));

//   return (
//     <Frame>
//     <Layout>
//       <Layout.Section>
//         <Page
//           title="Sample Product Settings"
//           primaryAction={{
//             content: "Save Settings",
//             loading: loading,
//             disabled: !selectedProduct || !selectedSampleProduct || !enabled,
//             onAction: saveSettings,
//           }}
//         >
//           <Layout>
//             {/* Section 1: Bulk Settings */}
//             <Layout.Section>
//               <Card>
//                 <Text as="p" variant="bodyMd">
//                   Apply the same sample product settings to all products in your store.
//                 </Text>
//                 <FormLayout>
//                   {/* Sample Product Selection */}
//                   <FormLayout.Group>
//                     <div>
//                       <Text as="p" variant="bodyMd" fontWeight="bold">
//                         Sample Product
//                       </Text>
//                       {selectedSampleProduct ? (
//                         <Box padding="200" background="bg-surface" borderRadius="200" display="flex" alignItems="center" gap="2">
//                           <Thumbnail
//                             source={selectedSampleProduct.image || ""}
//                             alt={selectedSampleProduct.title}
//                           />
//                           <Text as="p" variant="bodyMd">
//                             {selectedSampleProduct.title}
//                           </Text>
//                           <Button onClick={selectSampleProduct} size="slim">
//                             Change
//                           </Button>
//                         </Box>
//                       ) : (
//                         <Button onClick={selectSampleProduct} fullWidth>
//                           Select Sample Product
//                         </Button>
//                       )}
//                     </div>
//                   </FormLayout.Group>

//                   {/* Settings Configuration */}
//                   <FormLayout.Group>
//                     <TextField
//                       label="Sample limit per order"
//                       type="number"
//                       value={limit}
//                       onChange={setLimit}
//                       autoComplete="off"
//                       min={1}
//                       helpText="Maximum number of samples allowed per order"
//                     />
//                   </FormLayout.Group>

//                   <FormLayout.Group>
//                     <Checkbox
//                       label="Allow only one sample per customer"
//                       checked={onePerCustomer}
//                       onChange={setOnePerCustomer}
//                       helpText="Prevents customers from ordering multiple samples"
//                     />
//                   </FormLayout.Group>

//                   {/* Apply to All Button */}
//                   <FormLayout.Group>
//                     <Button
//                       variant="primary"  
//                       loading={bulkLoading}
//                       onClick={applyToAllProducts}
//                       disabled={!selectedSampleProduct}
//                       fullWidth
//                     >
//                       Apply to All Products
//                     </Button>
//                   </FormLayout.Group>
//                 </FormLayout>
//               </Card>
//             </Layout.Section>

//             {/* Section 2: Single Product Settings */}
//             <Layout.Section>
//               <Card>
//                 <FormLayout>
//                   {/* Main Product Selection */}
//                   <FormLayout.Group>
//                     <div>
//                       <Text as="p" variant="bodyMd" fontWeight="bold">
//                         Main Product
//                       </Text>
//                       {selectedProduct ? (
//                         <Box padding="200" background="bg-surface" borderRadius="200" display="flex" alignItems="center" gap="2">
//                           <Thumbnail
//                             source={selectedProduct.image || ""}
//                             alt={selectedProduct.title}
//                           />
//                           <Text as="p" variant="bodyMd">
//                             {selectedProduct.title}
//                           </Text>
//                           <Button onClick={selectProduct} size="slim">
//                             Change
//                           </Button>
//                         </Box>
//                       ) : (
//                         <Button onClick={selectProduct} fullWidth>
//                           Select Main Product
//                         </Button>
//                       )}
//                     </div>
//                   </FormLayout.Group>

//                   {/* Enable Checkbox */}
//                   <FormLayout.Group>
//                     <Checkbox
//                       label="Enable sample for this product"
//                       checked={enabled}
//                       onChange={setEnabled}
//                     />
//                   </FormLayout.Group>

//                   {/* Sample Product Selection (for single product) */}
//                   {enabled && (
//                     <FormLayout.Group>
//                       <div>
//                         <Text as="p" variant="bodyMd" fontWeight="bold">
//                           Sample Product
//                         </Text>
//                         {selectedSampleProduct ? (
//                           <Box padding="200" background="bg-surface" borderRadius="200" >
//                             <Thumbnail
//                               source={selectedSampleProduct.image || ""}
//                               alt={selectedSampleProduct.title}
//                             />
//                             <Text as="p" variant="bodyMd">
//                               {selectedSampleProduct.title}
//                             </Text>
//                             <Button onClick={selectSampleProduct} size="slim">
//                               Change
//                             </Button>
//                           </Box>
//                         ) : (
//                           <Button onClick={selectSampleProduct} fullWidth>
//                             Select Sample Product
//                           </Button>
//                         )}
//                       </div>
//                     </FormLayout.Group>
//                   )}
//                 </FormLayout>
//               </Card>
//             </Layout.Section>

        
//           </Layout>

//           {/* Delete Confirmation Modal */}
//           <Modal
//             open={deleteModalOpen}
//             onClose={() => {
//               setDeleteModalOpen(false);
//               setItemToDelete(null);
//             }}
//             title="Delete Setting"
//             primaryAction={{
//               content: "Delete",
//               onAction: () => itemToDelete && deleteSetting(itemToDelete),
//               destructive: true,
//             }}
//             secondaryActions={[
//               {
//                 content: "Cancel",
//                 onAction: () => {
//                   setDeleteModalOpen(false);
//                   setItemToDelete(null);
//                 },
//               },
//             ]}
//           >
//             <Modal.Section>
//               <Text as="p">
//                 Are you sure you want to delete this product setting? This action cannot be undone.
//               </Text>
//             </Modal.Section>
//           </Modal>
//         </Page>
//         {toggleToastMarkup}
//       </Layout.Section>
//     </Layout>
//     </Frame>
//   );
// }