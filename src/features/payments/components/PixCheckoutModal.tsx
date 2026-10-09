"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Copy, Check, QrCode, Loader2, ShieldCheck } from "lucide-react";
import {
  paymentsService,
  type PixCharge,
} from "@/features/payments/services/payments.service";
import { useUserSession } from "@/features/auth/context/UserSessionProvider";
import { formatPrice } from "@/shared/utils/format";
import type { ApiError, Product } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

interface PixCheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

/** PIX charges created by the frontend expire in 1 hour. */
const PIX_EXPIRES_IN_SECONDS = 3600;

const FIELD =
  "flex h-11 w-full rounded-md border border-line bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:border-action";

const PRIMARY_BUTTON =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-action px-4 text-sm font-medium text-action-foreground transition-colors duration-150 ease-out hover:bg-action/90 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60";

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatExpiresAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function PixCheckoutModal({
  product,
  isOpen,
  onClose,
}: PixCheckoutModalProps) {
  const { user } = useUserSession();

  const [taxId, setTaxId] = useState("");
  const [cellphone, setCellphone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);

  const amountInCents = useMemo(
    () => Math.round(product.price * 100),
    [product.price],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user?.name || !user?.email) {
      setError("Você precisa estar logado para pagar com Pix.");
      return;
    }

    const cleanTaxId = onlyDigits(taxId);
    if (cleanTaxId.length !== 11 && cleanTaxId.length !== 14) {
      setError("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await paymentsService.createPixCharge(
        {
          amount: amountInCents,
          expiresIn: PIX_EXPIRES_IN_SECONDS,
          description: `Pedido - ${product.name}`,
          customer: {
            name: user.name,
            email: user.email,
            taxId: cleanTaxId,
            cellphone: onlyDigits(cellphone),
          },
        },
      );
      setCharge(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError?.message ||
          "Não foi possível gerar o Pix. Tente novamente em instantes.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!charge) return;
    try {
      await navigator.clipboard.writeText(charge.brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; the user can still select the code manually.
    }
  };

  const handleClose = () => {
    // Reset transient state so a reopen starts clean.
    setCharge(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pagamento via Pix"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-[fadeIn_200ms_ease-out]" />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-action" />
            <h2 className="text-base font-semibold text-foreground">
              Pagar com Pix
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-action-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {/* Summary */}
          <div className="mb-5 flex items-center justify-between rounded-md border border-line bg-action-soft px-4 py-3">
            <span className="text-sm text-muted-foreground">{product.name}</span>
            <span className="text-base font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
          </div>

          {charge ? (
            <PixResult
              charge={charge}
              copied={copied}
              onCopy={handleCopy}
            />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <p className="text-[0.8125rem] text-muted-foreground">
                Confirme seus dados para gerar o QR Code de pagamento.
              </p>

              {user?.email && (
                <div className="rounded-md border border-line px-3 py-2 text-sm">
                  {user.name && (
                    <p className="font-medium text-foreground">{user.name}</p>
                  )}
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              )}

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  CPF / CNPJ
                </span>
                <input
                  className={FIELD}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Somente números"
                  inputMode="numeric"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  Celular
                </span>
                <input
                  className={FIELD}
                  value={cellphone}
                  onChange={(e) => setCellphone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </p>
              )}

              <button type="submit" className={PRIMARY_BUTTON} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-[18px] w-[18px] animate-spin" />
                    Gerando Pix...
                  </>
                ) : (
                  <>
                    <QrCode className="h-[18px] w-[18px]" />
                    Gerar QR Code
                  </>
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[0.75rem] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Pagamento processado com segurança
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PixResult({
  charge,
  copied,
  onCopy,
}: {
  charge: PixCharge;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-muted-foreground">
        Escaneie o QR Code no app do seu banco ou copie o código abaixo.
      </p>

      <div className="rounded-lg border border-line bg-white p-3">
        <Image
          src={charge.brCodeBase64}
          alt="QR Code Pix"
          width={220}
          height={220}
          unoptimized
          className="h-[220px] w-[220px]"
        />
      </div>

      <div className="w-full">
        <span className="mb-1 block text-sm font-medium text-foreground">
          Pix Copia e Cola
        </span>
        <div className="flex items-stretch gap-2">
          <input
            readOnly
            value={charge.brCode}
            onFocus={(e) => e.currentTarget.select()}
            className={cn(FIELD, "flex-1 font-mono text-xs")}
          />
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-md border border-line px-3 text-sm font-medium text-foreground transition-colors hover:bg-action-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
            aria-label="Copiar código Pix"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-action" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between rounded-md border border-line px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">Válido até</span>
        <span className="font-medium text-foreground">
          {formatExpiresAt(charge.expiresAt)}
        </span>
      </div>

      <p className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Aguardando confirmação do pagamento...
      </p>
    </div>
  );
}
