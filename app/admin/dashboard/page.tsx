import { produtosService } from '@/features/produtos/services/produtos.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Package, CheckCircle2, XCircle, DollarSign, Plus, List, Eye } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const { data: produtos, pagination } = await produtosService.getProdutos({ limit: 100 });
  
  const totalProdutos = pagination.total;
  const produtosDisponiveis = produtos.filter(p => p.disponivel).length;
  const produtosIndisponiveis = produtos.filter(p => !p.disponivel).length;
  
  const valorTotal = produtos.reduce((acc, p) => acc + p.preco, 0);
  const valorMedio = totalProdutos > 0 ? valorTotal / totalProdutos : 0;

  const stats = [
    {
      title: 'Total de Produtos',
      value: totalProdutos,
      icon: Package,
      color: 'text-coral',
      bgColor: 'bg-coral/10',
    },
    {
      title: 'Disponíveis',
      value: produtosDisponiveis,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Indisponíveis',
      value: produtosIndisponiveis,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Preço Médio',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valorMedio),
      icon: DollarSign,
      color: 'text-olive',
      bgColor: 'bg-olive/10',
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
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

export const revalidate = 0; // Sempre buscar dados atualizados
