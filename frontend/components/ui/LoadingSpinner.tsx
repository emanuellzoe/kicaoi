export function LoadingSpinner({
  size = "md",
  label = "Loading…",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sz = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <div
      role="status"
      aria-label={label}
      className={`${sz} animate-spin rounded-full border-2 border-white/20 border-t-white`}
    />
  );
}
