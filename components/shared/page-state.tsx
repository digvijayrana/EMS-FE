import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

export function PageLoader({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="glass-card grid min-h-64 place-items-center p-8">
      <div className="text-center text-muted-foreground">
        <LoaderCircle className="mx-auto mb-3 size-7 animate-spin text-primary" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message = "We could not load this data." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
      <AlertCircle className="mx-auto mb-2 size-6" />
      <p className="font-medium">{message}</p>
      <p className="mt-1 text-sm opacity-80">Check that the API server is running and try again.</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-52 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"><Inbox /></span>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
