import type {
  BillingLocation,
  LoginCredentials,
  TokenResponse,
  User,
} from "@/types/auth";

import type {
  Customer,
  CreateCustomerDTO,
} from "@/types/customer";

import type {
  Product,
  CreateProductDTO,
} from "@/types/product";

import type {
  Invoice,
  CreateInvoiceDTO,
} from "@/types/invoice";

import type {
  Inventory,
  InventoryAdjustment,
  InventoryTransaction,
} from "@/types/inventory";

import type { Notification } from "@/types/notification";

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
|
| Browser:
|   Browser
|      ↓
|   /api/proxy
|      ↓
|   HttpOnly JWT cookie
|      ↓
|   Railway FastAPI
|
| Server Component:
|   Next.js Server
|      ↓
|   HttpOnly JWT cookie
|      ↓
|   Railway FastAPI
|
*/

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

const PROXY_BASE = "/api/proxy";

/*
|--------------------------------------------------------------------------
| Error
|--------------------------------------------------------------------------
*/

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/*
|--------------------------------------------------------------------------
| Error parser
|--------------------------------------------------------------------------
*/

async function parseError(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return (
        data.detail[0]?.msg ??
        "Request failed"
      );
    }

    return "Request failed";
  } catch {
    return "Request failed";
  }
}

/*
|--------------------------------------------------------------------------
| Request helper
|--------------------------------------------------------------------------
|
| Client:
|   Uses /api/proxy so the browser automatically
|   sends the HttpOnly cookie.
|
| Server:
|   Uses Railway directly and forwards the
|   HttpOnly access token.
|
*/

async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  /*
   * SERVER
   *
   * Server Components cannot fetch:
   *
   * fetch("/api/proxy/...")
   *
   * because there is no browser origin.
   *
   * We therefore read the cookie and call
   * Railway directly.
   */

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");

    const cookieStore = await cookies();

    const token = cookieStore.get(
      "naryan_access_token",
    )?.value;

    if (!token) {
      return new Response(
        JSON.stringify({
          detail: "Not authenticated",
        }),
        {
          status: 401,
          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    const headers = new Headers(
      options.headers,
    );

    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );

    return fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers,
        cache: "no-store",
      },
    );
  }

  /*
   * BROWSER
   *
   * Go through Next.js proxy.
   */

  return fetch(
    `${PROXY_BASE}${path}`,
    {
      ...options,
      cache: "no-store",
    },
  );
}

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export async function login(
  credentials: LoginCredentials,
): Promise<TokenResponse> {
  const response = await fetch(
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(credentials),
    },
  );

  if (!response.ok) {
    throw new ApiError(
      await parseError(response),
      response.status,
    );
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch(
    "/auth/me",
  );

  if (!response.ok) {
    throw new ApiError(
      await parseError(response),
      response.status,
    );
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export async function logout(): Promise<void> {
  const response = await fetch(
    "/api/auth/logout",
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new ApiError(
      await parseError(response),
      response.status,
    );
  }
}

/*
|--------------------------------------------------------------------------
| Customers
|--------------------------------------------------------------------------
*/

export async function getCustomers(
  search?: string,
): Promise<Customer[]> {
  const q = search
    ? `?search=${encodeURIComponent(search)}`
    : "";

  const res = await apiFetch(
    `/customers/${q}`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function getCustomer(
  customerId: number,
): Promise<Customer> {
  const res = await apiFetch(
    `/customers/${customerId}`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function createCustomer(
  data: CreateCustomerDTO,
): Promise<Customer> {
  const res = await apiFetch(
    "/customers/",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function getCustomerInvoices(
  customerId: number,
): Promise<Invoice[]> {
  const res = await apiFetch(
    `/customers/${customerId}/invoices`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

export async function getProducts(
  search?: string,
): Promise<Product[]> {
  const q = search
    ? `?search=${encodeURIComponent(search)}`
    : "";

  const res = await apiFetch(
    `/products/${q}`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function getProduct(
  productId: number,
): Promise<Product> {
  const res = await apiFetch(
    `/products/${productId}`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function createProduct(
  data: CreateProductDTO,
): Promise<Product> {
  const res = await apiFetch(
    "/products/",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Inventory
|--------------------------------------------------------------------------
*/

export async function getInventory(): Promise<Inventory[]> {
  const res = await apiFetch(
    "/inventory/",
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function getProductInventory(
  productId: number,
): Promise<Inventory> {
  const res = await apiFetch(
    `/inventory/${productId}`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function addStock(
  productId: number,
  data: InventoryAdjustment,
): Promise<Inventory> {
  const res = await apiFetch(
    `/inventory/${productId}/add`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function removeStock(
  productId: number,
  data: InventoryAdjustment,
): Promise<Inventory> {
  const res = await apiFetch(
    `/inventory/${productId}/remove`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function getInventoryTransactions(
  productId: number,
): Promise<InventoryTransaction[]> {
  const res = await apiFetch(
    `/inventory/${productId}/transactions`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Invoices
|--------------------------------------------------------------------------
*/

export async function getInvoices(
  search?: string,
): Promise<Invoice[]> {
  const q = search
    ? `?search=${encodeURIComponent(search)}`
    : "";

  const res = await apiFetch(
    `/invoices/${q}`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function getInvoice(
  invoiceId: number,
): Promise<Invoice> {
  const res = await apiFetch(
    `/invoices/${invoiceId}`,
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function createInvoice(
  data: CreateInvoiceDTO,
): Promise<Invoice> {
  const res = await apiFetch(
    "/invoices/",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

/*
|--------------------------------------------------------------------------
| States
|--------------------------------------------------------------------------
*/

export interface State {
  id: number;
  name: string;
}

export async function getStates(): Promise<State[]> {
  const res = await apiFetch(
    "/states/",
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

export async function getNotifications(): Promise<Notification[]> {
  const res = await apiFetch(
    "/notifications/",
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<Notification> {
  const res = await apiFetch(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await apiFetch(
    "/notifications/read-all",
    {
      method: "PATCH",
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }
}

export async function deleteNotification(
  notificationId: number,
): Promise<void> {
  const res = await apiFetch(
    `/notifications/${notificationId}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }
}

export async function deleteAllNotifications(): Promise<void> {
  const res = await apiFetch(
    "/notifications/",
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }
}

/*
|--------------------------------------------------------------------------
| Billing Locations
|--------------------------------------------------------------------------
*/

export const billingLocations: BillingLocation[] = [
  {
    id: "store",
    name: "Store",
    subtitle: "Retail counter billing",
    address: "Andheri East, Mumbai, MH",
    gstin: "27AABCS4567K1Z2",
    features: [
      "Point-of-sale invoices",
      "Walk-in customer GSTIN",
      "Daily sales register",
    ],
  },
  {
    id: "plant",
    name: "Plant",
    subtitle: "Factory dispatch billing",
    address: "Peenya Industrial Area, Bangalore, KA",
    gstin: "29AABCT1234F1Z5",
    features: [
      "E-way bill & vehicle details",
      "HSN-coded bulk items",
      "Dispatch destination notes",
    ],
  },
];

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export interface DashboardSummary {
  today_sales: number;
  today_invoice_count: number;
  total_customers: number;
  total_products: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface DashboardInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  grand_total: number;
  customer_name: string;
}

export interface DashboardLowStockProduct {
  id: number;
  product_code: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface DashboardSalesTrend {
  date: string;
  sales: number;
  invoice_count: number;
}

export interface DashboardTopProduct {
  id: number;
  product_code: string;
  name: string;
  quantity_sold: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recent_invoices: DashboardInvoice[];
  low_stock_products: DashboardLowStockProduct[];
  sales_trend: DashboardSalesTrend[];
  top_products: DashboardTopProduct[];
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await apiFetch(
    "/dashboard/",
  );

  if (!res.ok) {
    throw new ApiError(
      await parseError(res),
      res.status,
    );
  }

  return res.json();
}