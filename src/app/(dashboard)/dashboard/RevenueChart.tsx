"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type RevenueChartPoint = {
  month: string;
  billed: number;
  received: number;
  pending: number;
};

type RevenueChartProps = {
  data: RevenueChartPoint[];
  totals: {
    billed: number;
    received: number;
    pending: number;
  };
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  notation: "compact",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value: number) {
  return compactCurrencyFormatter.format(value);
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3 shadow-2xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-8 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-foreground">{formatCurrency(entry.value ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RevenueChart({ data, totals }: RevenueChartProps) {
  const hasRevenueData = data.some((point) => point.billed > 0 || point.received > 0);

  return (
    <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Last 6 months</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <RevenueSummary label="Billed" value={totals.billed} tone="text-sky-300" />
          <RevenueSummary label="Received" value={totals.received} tone="text-emerald-300" />
          <RevenueSummary label="Pending" value={totals.pending} tone="text-amber-300" />
        </div>
      </div>

      <div className="h-[280px]">
        {hasRevenueData ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={(value) => formatCompactCurrency(Number(value))}
                width={70}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar
                dataKey="billed"
                name="Billed"
                fill="#38bdf8"
                fillOpacity={0.35}
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />
              <Line
                type="monotone"
                dataKey="received"
                name="Received"
                stroke="#34d399"
                strokeWidth={3}
                dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#34d399", stroke: "#0a0a0a", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center">
            <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">No revenue data yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create invoices or record payments to populate this chart.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RevenueSummary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 truncate text-sm font-bold ${tone}`} title={formatCurrency(value)}>
        {formatCompactCurrency(value)}
      </p>
    </div>
  );
}
