import { useEffect, useRef, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { activeChain } from "../lib/chain";

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { connect } = useConnect();
  const attempted = useRef(false);

  useEffect(() => {
    const tryConnect = () => {
      if (attempted.current) return;
      const eth = window.ethereum;
      if (eth?.isMiniPay) {
        attempted.current = true;
        setIsMiniPay(true);
        connect({ connector: injected(), chainId: activeChain.id });
      }
    };
    tryConnect();
    const t = setTimeout(tryConnect, 500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isMiniPay };
}
