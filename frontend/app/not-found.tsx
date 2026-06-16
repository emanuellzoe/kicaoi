import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <div className="text-7xl mb-6">🌾</div>
      <h1 className="text-5xl font-heading italic text-white mb-4">404</h1>
      <p className="text-white/50 text-base font-body mb-8">This plot doesn&apos;t exist. Back to the farm?</p>
      <Link
        href="/"
        className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-semibold text-white no-underline hover:scale-105 transition-transform"
      >
        ← Go Home
      </Link>
    </div>
  );
}
