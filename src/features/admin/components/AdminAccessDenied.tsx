import Link from "next/link";
import { ShieldAlert } from "lucide-react";

// Friendly screen shown when whoever accesses /admin lacks the Google session with
// the @admin group (not logged in or without permission). Theme tokens only.
export function AdminAccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-action-soft">
          <ShieldAlert className="h-6 w-6 text-action" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta área é exclusiva para administradores. Entre com uma conta Google
          autorizada para continuar.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-md bg-action text-action-foreground text-sm font-medium transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Voltar à loja
        </Link>
      </div>
    </div>
  );
}
