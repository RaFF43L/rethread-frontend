import { Suspense } from 'react';
import { produtosService } from '@/features/produtos/services/produtos.service';
import { formatPrice } from '@/shared/utils/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Package, CheckCircle2, DollarSign, Plus, List, Eye, TrendingUp, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { DashboardFilters } from '@/features/admin/components/DashboardFilters';
import type { DashboardFilterParams } from '@/shared/types';

interface PageProps {
  searchParams: Promise<{ category?: string; status?: string; startDate?: string; endDate?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: DashboardFilterParams = {};
  if (params.category) filters.category = params.category;
  if (params.status) filters.status = params.status as 'available' | 'sold';
  if (params.startDate) filters.startDate = params.startDate;
  if (params.endDate) filters.endDate = params.endDate;

  const dashboard = await produtosService.getDashboard(filters);

  const stats = [
    {
      title: 'Total de Produtos',
      value: dashboard.total,
      icon: Package,
      color: 'text-coral',
      bgColor: 'bg-coral/10',
    },
    {
      title: 'Disponíveis',
      value: dashboard.available,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Vendidos',
      value: dashboard.sold,
      icon: ShoppingBag,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Preço Médio',
      value: formatPrice(dashboard.total > 0 ? dashboard.totalValue / dashboard.total : 0),
      icon: DollarSign,
      color: 'text-olive',
      bgColor: 'bg-olive/10',
    },
  ];

  const valueStats = [
    {
      title: 'Valor Total em Estoque',
      value: formatPrice(dashboard.availableValue),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Vendido',
      value: formatPrice(dashboard.soldValue),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Valor Total (Geral)',
      value: formatPrice(dashboard.totalValue),
      icon: Package,
      color: 'text-coral',
      bgColor: 'bg-coral/10',
    },
  ];

  const quickActions = [
    {
      href: '/admin/produtos/new',
      label: 'Adicionar Produto',
      icon: Plus,
      variant: 'default' as const,
    },
    {
      href: '/admin/produtos',
      label: 'Ver Todos os Produtos',
      icon: List,
      variant: 'secondary' as const,
    },
    {
      href: '/',
      label: 'Visualizar Loja',
      icon: Eye,
      variant: 'outline' as const,
      external: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Visão geral da Segunda Aura Brechó
        </p>
      </div>

      {/* Filtros */}
      <Suspense fallback={null}>
        <DashboardFilters />
      </Suspense>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 md:space-y-2 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className={`text-xl md:text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-2 md:p-3 rounded-full flex-shrink-0`}>
                    <Icon className={`w-5 h-5 md:w-8 md:h-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Valores financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {valueStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 md:space-y-2 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className={`text-lg md:text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-2 md:p-3 rounded-full flex-shrink-0`}>
                    <Icon className={`w-5 h-5 md:w-7 md:h-7 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const ButtonContent = (
                <>
                  <Icon className="w-5 h-5" />
                  {action.label}
                </>
              );

              if (action.external) {
                return (
                  <Button
                    key={action.href}
                    variant={action.variant}
                    size="lg"
                    className="w-full h-auto py-4 text-base"
                    asChild
                  >
                    <Link href={action.href} target="_blank">
                      {ButtonContent}
                    </Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={action.href}
                  variant={action.variant}
                  size="lg"
                  className="w-full h-auto py-4 text-base"
                  asChild
                >
                  <Link href={action.href}>
                    {ButtonContent}
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const revalidate = 0;
