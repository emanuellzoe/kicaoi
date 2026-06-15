"use client";
import { useEffect, useRef, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

// Detect MiniPay and auto-connect. Inside MiniPay there is no Connect button:
// the wallet is already there, so we just connect the injected provider.
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { connect } = useConnect();
  const attempted = useRef(false);

  useEffect(() => {
    const tryConnect = () => {
      if (attempted.current) return;
      const eth = (window as any).ethereum;
      if (eth?.isMiniPay) {
        attempted.current = true;
        setIsMiniPay(true);
        connect({ connector: injected() });
      }
    };

    // Try immediately, then retry once after a short delay in case
    // MiniPay injects window.ethereum slightly after mount.
    tryConnect();
    const t = setTimeout(tryConnect, 500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isMiniPay };
}
