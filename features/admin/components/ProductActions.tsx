'use client';

import { useState, useTransition } from 'react';
import { markAsSold, revertSale, deleteProduct } from '@/app/admin/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Loader2, Trash2, ShoppingBag, RotateCcw, Pencil } from 'lucide-react';
import Link from 'next/link';

interface ProductActionsProps {
  numericId: number;
  name: string;
  available: boolean;
}

type ActionType = 'vender' | 'reverter' | 'deletar' | null;

const DIALOG_CONFIG: Record<NonNullable<ActionType>, { title: string; description: string; confirmLabel: string; confirmClass: string }> = {
  vender: {
    title: 'Marcar como vendido?',
    description: 'O produto será marcado como vendido e ficará indisponível na loja.',
    confirmLabel: 'Confirmar venda',
    confirmClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
  reverter: {
    title: 'Reverter para disponível?',
    description: 'O produto voltará a aparecer como disponível na loja.',
    confirmLabel: 'Reverter',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  deletar: {
    title: 'Deletar produto?',
    description: 'Esta ação não pode ser desfeita. O produto será removido permanentemente.',
    confirmLabel: 'Deletar',
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
};

export function ProductActions({ numericId, name, available }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ActionType>(null);

  const handleConfirm = () => {
    if (!pendingAction) return;
    setError(null);

    const actionMap = {
      vender: () => markAsSold(numericId),
      reverter: () => revertSale(numericId),
      deletar: () => deleteProduct(numericId),
    };

    startTransition(async () => {
      try {
        await actionMap[pendingAction]();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const config = pendingAction ? DIALOG_CONFIG[pendingAction] : null;

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600 mr-2">{error}</span>}

      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      ) : (
        <AlertDialog>
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/produtos/${numericId}/edit`}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Link>

            {available ? (
              <AlertDialogTrigger asChild>
                <button
                  onClick={() => setPendingAction('vender')}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Vender
                </button>
              </AlertDialogTrigger>
            ) : (
              <AlertDialogTrigger asChild>
                <button
                  onClick={() => setPendingAction('reverter')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reverter
                </button>
              </AlertDialogTrigger>
            )}

            <AlertDialogTrigger asChild>
              <button
                onClick={() => setPendingAction('deletar')}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Deletar
              </button>
            </AlertDialogTrigger>
          </div>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{config?.title}</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium text-gray-700">&ldquo;{name}&rdquo;</span>
                {' — '}
                {config?.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingAction(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                className={config?.confirmClass}
              >
                {config?.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
