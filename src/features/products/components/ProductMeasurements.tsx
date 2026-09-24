"use client";

import { ProductMeasurement } from "@/shared/types";

interface ProductMeasurementsProps {
  measurements?: ProductMeasurement[];
  size?: string;
  className?: string;
}

/**
 * Bloco de caimento & medidas: mostra a medida real da peça (cm) e,
 * quando existir uma faixa padrão de mercado para aquele quesito,
 * posiciona a peça dentro dessa faixa para dar noção intuitiva de caimento.
 */
export function ProductMeasurements({
  measurements,
  size,
  className,
}: ProductMeasurementsProps) {
  if (!measurements || measurements.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="text-xs font-medium uppercase tracking-wider text-foreground mb-1">
        Caimento &amp; medidas
      </h3>
      {size && (
        <p className="text-sm text-muted-foreground mb-4">
          Tamanho na etiqueta: <span className="font-medium text-foreground">{size}</span>
          {" — "}medidas reais tiradas com a peça em superfície plana.
        </p>
      )}

      <table className="w-full border-collapse">
        <caption className="sr-only">
          Medidas reais da peça em centímetros, comparadas à faixa padrão de mercado
        </caption>
        <tbody>
          {measurements.map((measurement) => (
            <tr key={measurement.label} className="border-t border-border first:border-t-0">
              <td className="py-3 pr-4 align-top">
                <span className="text-sm text-foreground">{measurement.label}</span>
              </td>
              <td className="py-3 align-top w-full">
                <MeasurementBar measurement={measurement} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MeasurementBar({ measurement }: { measurement: ProductMeasurement }) {
  const { label, valueCm, standardRangeCm } = measurement;

  if (!standardRangeCm) {
    return <span className="text-sm font-medium text-foreground">{valueCm} cm</span>;
  }

  const [min, max] = standardRangeCm;
  const span = Math.max(max - min, 1);
  const padding = span * 0.25;
  const scaleMin = min - padding;
  const scaleMax = max + padding;
  const clampedValue = Math.min(Math.max(valueCm, scaleMin), scaleMax);

  const toPercent = (value: number) =>
    ((value - scaleMin) / (scaleMax - scaleMin)) * 100;

  return (
    <div
      className="relative"
      role="img"
      aria-label={`${label}: ${valueCm} centímetros, faixa padrão de ${min} a ${max} centímetros`}
    >
      <div className="relative h-1.5 w-full rounded-full bg-muted">
        <div
          className="absolute h-1.5 rounded-full bg-border"
          style={{
            left: `${toPercent(min)}%`,
            width: `${toPercent(max) - toPercent(min)}%`,
          }}
        />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
          style={{ left: `${toPercent(clampedValue)}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{min} cm</span>
        <span className="text-xs font-semibold text-foreground">{valueCm} cm</span>
        <span>{max} cm</span>
      </div>
    </div>
  );
}
