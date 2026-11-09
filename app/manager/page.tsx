import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Manager View | Capacity Estimating Dashboard",
};

export default function ManagerPage() {
  return <Dashboard mode="manager" />;
}
