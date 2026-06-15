"use client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { wagmiConfig } from "@/lib/wagmi";
import { ToastProvider } from "@/components/ToastProvider";
import { ToastList } from "@/components/ToastList";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
          <ToastList />
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
