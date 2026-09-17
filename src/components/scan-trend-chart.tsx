"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { BarChart3 } from "lucide-react";

interface Props {
  data: { date: string; count: number }[];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-[12px] border border-border/80 bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="font-semibold text-foreground">{format(parseISO(label), "MMMM d, yyyy")}</p>
      <div className="mt-1 flex items-center gap-1.5 text-primary">
        <span className="size-2 rounded-full bg-primary" />
        <span className="font-heading text-sm font-extrabold tabular-nums">
          {payload[0].value.toLocaleString()}
        </span>
        <span className="text-muted-foreground text-[11px]">verified scans</span>
      </div>
    </div>
  );
}

export function ScanTrendChart({ data }: Props) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="h-72 w-full">
      {!hasData ? (
        <div className="flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-border/80 bg-muted/20 p-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <BarChart3 className="size-5" />
          </div>
          <p className="mt-2 text-xs font-semibold text-foreground">No scans recorded in this window</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Scans will appear dynamically as people interact with your deployed QR codes.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#06B6D4" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="currentColor" className="text-border/60" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => format(parseISO(v), "MMM d")}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#4F46E5", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4F46E5"
              strokeWidth={2.5}
              fill="url(#scanGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#4F46E5", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
