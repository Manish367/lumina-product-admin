import { AlertTriangle, Inbox, RotateCcw } from "lucide-react";
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle size={21} />
      </div>
      <h3 className="font-display text-lg font-bold">
        Couldn’t load this view
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{message}</p>
      <button onClick={onRetry} className="btn-secondary mt-6">
        <RotateCcw size={15} />
        Retry
      </button>
    </div>
  );
}
export function EmptyState({ text = "No products found." }: { text?: string }) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-500">
        <Inbox size={21} />
      </div>
      <h3 className="font-display text-lg font-bold">Nothing here yet</h3>
      <p className="mt-2 text-sm text-gray-500">{text}</p>
    </div>
  );
}
