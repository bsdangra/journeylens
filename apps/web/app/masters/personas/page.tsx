import type { Metadata } from "next";
import { PersonasScreen } from "@/components/masters/personas-screen";

export const metadata: Metadata = {
  title: "Personas",
};

export default function PersonasPage() {
  return <PersonasScreen />;
}
