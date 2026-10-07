import { AdminNav } from '@/features/admin/components/AdminNav';
import { AdminAccessDenied } from '@/features/admin/components/AdminAccessDenied';
import { hasAdminAccess } from '@/features/auth/lib/session.server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate único: sem sessão Google @admin, mostra a tela amigável (sem flash,
  // renderizada no servidor) e não monta a área administrativa.
  if (!(await hasAdminAccess())) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
