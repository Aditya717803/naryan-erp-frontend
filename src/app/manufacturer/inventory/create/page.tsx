"use client";

import { useRouter } from "next/navigation";
import AddProduct from "@/app/component/addproduct";

export default function CreateInventoryPage() {
  const router = useRouter();

  return (
    <AddProduct
      open={true}
      onClose={() => router.back()}
      onSuccess={() => router.push("/manufacturer/inventory")}
    />
  );
}
