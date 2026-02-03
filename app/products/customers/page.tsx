"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";

type SampleCustomer = {
  id: string;
  email: string;
  name?: string | null;
  totalSamples: number;
  blocked: boolean;
  lastSampleAt?: string | null;
  createdAt: string;
};

export default function CustomersPage() {
  const app = useAppBridge();

  const [shop, setShop] = useState<string | null>(null);
  const [customers, setCustomers] = useState<SampleCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- GET SHOP FROM APP BRIDGE ---------------- */
  useEffect(() => {
    if (!app) return;

    const shopFromConfig = (app as any)?.config?.shop;

    if (shopFromConfig) {
      setShop(shopFromConfig);
      setError(null);
    } else {
      setError("Unable to retrieve shop info. Please reload the app.");
      setLoading(false);
    }
  }, [app]);

  /* ---------------- FETCH CUSTOMERS ---------------- */
  useEffect(() => {
    if (!shop) return;

    const fetchCustomers = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/sample/customer?shop=${encodeURIComponent(shop)}`
        );

        if (!res.ok) throw new Error("Failed to fetch customers");

        const data = await res.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [shop]);

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return <div className="p-6 text-gray-500">Loading customers...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (customers.length === 0) {
    return <div className="p-6 text-gray-500">No customers found.</div>;
  }

  /* ---------------- TABLE ---------------- */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sample Customers</h1>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Email</th>
              {/* <th className="p-3">Name</th> */}
              <th className="p-3">Samples</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.email}</td>
                {/* <td className="p-3">{c.name || "—"}</td> */}
                <td className="p-3">{c.totalSamples}</td>
                <td className="p-3">
                  {c.blocked ? (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                      Blocked
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      Active
                    </span>
                  )}
                </td>
         
                <td className="p-3">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
