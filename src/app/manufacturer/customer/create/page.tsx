"use client";

import { useRouter } from "next/navigation";

import ManufactureAddCustomer from "@/app/component/manufacture-addcustomer";

export default function CreateManufactureCustomerPage() {
  const router = useRouter();

  return (
    <ManufactureAddCustomer
      open={true}
      onClose={() => router.back()}
      onSuccess={() => router.push("/manufacture/customer")}
    />
  );
}