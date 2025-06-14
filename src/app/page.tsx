
import AppLayout from "@/components/layout/AppLayout";
import { AppProvider } from "@/context/AppContext";

export default function Home() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
