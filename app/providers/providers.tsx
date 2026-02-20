"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";
import Link from "next/link";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={translations}>
      <TanstackProvider>
        <ui-nav-menu>
        <Link href="/dashboard">Analytics </Link>
          <Link href="/products">Custom Products </Link>
          <Link href="/products/customers">Customers </Link>
          <Link href="/products/settings">Theme Settings</Link>
          <Link href="/products/product-settings/enable">Sample Settings</Link>
          <Link href="/help">Help</Link>
        </ui-nav-menu>
        <SessionProvider>{children}</SessionProvider>
      </TanstackProvider>
    </AppProvider>
  );
}

export function ExitProvider({ children }: { children: React.ReactNode }) {
  return <AppProvider i18n={translations}>{children}</AppProvider>;
}
