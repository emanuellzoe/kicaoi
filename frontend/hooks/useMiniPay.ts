"use client";
import { useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

// Detect MiniPay and auto-connect. Inside MiniPay there is no Connect button:
// the wallet is already there, so we just connect the injected provider.
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { connect } = useConnect();

  useEffect(() => {
    const eth = typeof window !== "undefined" ? (window as any).ethereum : undefined;
    if (eth?.isMiniPay) {
      setIsMiniPay(true);
      connect({ connector: injected() });
    }
  }, [connect]);

  return { isMiniPay };
}
