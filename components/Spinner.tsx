export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-ink" />
      {label}
    </div>
  );
}
export function FullLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud">
      <Spinner label="Preparing your workspace…" />
    </div>
  );
}
