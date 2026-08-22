import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

import InvoicePrint from "@/app/component/InvoicePrint";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getAuthenticatedData(
  endpoint: string,
  token: string,
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/");
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${endpoint}: ${response.status}`,
    );
  }

  return response.json();
}

export default async function InvoicePrintPage({
  params,
}: PageProps) {
  const { id } = await params;

  const invoiceId = Number(id);

  if (Number.isNaN(invoiceId)) {
    notFound();
  }

  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("naryan_access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const invoice = await getAuthenticatedData(
    `/invoices/${invoiceId}`,
    accessToken,
  );

  const customer = await getAuthenticatedData(
    `/customers/${invoice.customer_id}`,
    accessToken,
  );

  return (
    <InvoicePrint
      invoice={invoice}
      customer={customer}
    />
  );
}