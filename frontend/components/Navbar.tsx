"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { activeChain } from "@/lib/chain";
import { NetworkBadge } from "@/components/ui/NetworkBadge";

type NavLinkDef = { label: string; href: string; anchor: boolean };

const NAV_LINKS: NavLinkDef[] = [
  { label: "How It Works", href: "/#how-it-works", anchor: true },
  { label: "Dashboard", href: "/farm", anchor: false },
  { label: "Leaderboard", href: "/leaderboard", anchor: false },
  { label: "FAQ", href: "/#faq", anchor: true },
];

function NavLink({ href, anchor, children }: { href: string; anchor: boolean; children: React.ReactNode }) {
  const cls =
    "px-4 py-2 text-sm font-medium text-white/80 font-body hover:text-white transition-colors no-underline";
  if (anchor) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddr = address ? address.slice(0, 6) + "…" + address.slice(-4) : "";

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-6 lg:px-12 py-3 flex items-center justify-between pointer-events-none">
      {/* Logo */}
      <Link
        href="/"
        className="pointer-events-auto h-10 px-4 flex items-center justify-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 no-underline hover:bg-white/8 transition-colors"
      >
        <span className="text-base">🌱</span>
        <span className="text-white font-body font-medium text-sm tracking-tight">Kicaoi</span>
      </Link>

      {/* Center Links (Desktop) */}
      <div className="pointer-events-auto hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1">
        {NAV_LINKS.map((l) => (
          <NavLink key={l.label} href={l.href} anchor={l.anchor}>
            {l.label}
          </NavLink>
        ))}
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="bg-white/10 hover:bg-white/15 transition-colors rounded-full px-3.5 py-1.5 text-sm font-medium text-white/80 hover:text-white flex items-center gap-1.5 ml-2 border-none cursor-pointer font-body"
          >
            {shortAddr}
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: injected(), chainId: activeChain.id })}
            className="bg-white text-black hover:bg-white/90 transition-colors rounded-full px-3.5 py-1.5 text-sm font-medium flex items-center gap-1.5 ml-2 border-none cursor-pointer font-body"
          >
            Connect
          </button>
        )}
      </div>

      {/* Right side: network badge (desktop) */}
      <div className="pointer-events-auto hidden md:flex items-center gap-2">
        {isConnected && <NetworkBadge />}
      </div>

      {/* Mobile: farm shortcut */}
      <div className="md:hidden pointer-events-auto flex items-center gap-2">
        <Link
          href="/farm"
          className="liquid-glass rounded-full px-3.5 py-2 text-sm font-medium text-white no-underline"
        >
          Farm
        </Link>
      </div>
    </nav>
  );
}


// [nav-v] 2