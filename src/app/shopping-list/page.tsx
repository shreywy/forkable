import type { Metadata } from "next";
import { ShoppingListClient } from "@/components/ShoppingListClient";

export const metadata: Metadata = {
  title: "Shopping list",
  description: "Your combined shopping list from selected recipes.",
};

export default function ShoppingListPage() {
  return <ShoppingListClient />;
}
