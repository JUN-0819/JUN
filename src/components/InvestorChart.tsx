"use client";

import { useState, useEffect } from "react";

interface TrendItem {
  date: string;
  foreign: number;
  institute: number;
  individual: number;
}

interface InvestorData {
  available: boolean;
  trend?: TrendItem[];
  total?: { foreign: number; institute: number; individual: number };
  message?: string;
}

type Category = "foreign" | "institute" | "individual";

const CATS: { key: Category; label: string; color: string; bg: string }[] = [
  { key: "foreign",    label: "외국인", color: "#3b82f6", bg: "bg-blue-500"   },
  { key: "institute",  label: "기관",   color: "#8b5cf6", bg: "bg-violet-500" },
  { key: "individual", label: "개인",   color: "#f59e0b", bg: "bg-amber-500"  },
];

function fmtShares(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(1)}백만`;
  if (abs >= 1e4) return `${Math.round(abs / 1e4)}만`;
  return abs.toLocaleString();
}

function SummaryBar({ label, bg, value, max }: { label: string; bg: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.abs(value) / max * 100, 100) : 0;
  const isUp = value >= 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-semibold tabular-nums ${isUp ? "text-emerald-600" : "text-red-600"}`}>
          {isUp ? "+" : "-"}{fmtShares(value)}주
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${isUp ? bg : "bg-red-400"} rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function InvestorChart({ ticker }: { ticker: string }) {
  const [data, setData] = useState<InvestorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chart" | "summary">("chart");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/investor/${encodeURIComponent(ticker)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ticker]);

  const trend = data?.trend ?? [];
  const total = data?.total;

  // 최대 절대값 (바 비율 계산용)
  const maxVal = trend.reduce((m, r) =>
    Math.max(m, Math.abs(r.foreign), Math.abs(r.institute), Math.abs(r.individual)), 1);

  const maxTotal = total
    ? Math.max(Math.abs(total.foreign), Math.abs(total.institute), Math.abs(total.individual), 1)
    : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-semibold">투자자 현황 (최근 20거래일)</h3>
        {data?.available && (
          <div className="flex gap-1">
            {(["chart", "summary"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                  activeTab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t === "chart" ? "일별 추이" : "누적 합계"}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.available ? (
        <p className="text-gray-400 text-sm text-center py-8">{data?.message}</p>
      ) : activeTab === "chart" ? (
        /* ── 일별 바차트 ── */
        <div>
          {/* 범례 */}
          <div className="flex gap-4 mb-3">
            {CATS.map((c) => (
              <span key={c.key} className="flex items-center gap-1 text-xs text-gray-500">
                <span className={`inline-block w-3 h-3 rounded-sm ${c.bg}`} />
                {c.label}
              </span>
            ))}
          </div>

          {/* 바 차트 */}
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1" style={{ minWidth: trend.length * 28 }}>
              {trend.map((row) => (
                <div key={row.date} className="flex flex-col items-center gap-0.5" style={{ width: 24 }}>
                  {CATS.map((cat) => {
                    const val = row[cat.key];
                    const h = maxVal > 0 ? Math.round(Math.abs(val) / maxVal * 48) : 0;
                    const isUp = val >= 0;
                    return (
                      <div
                        key={cat.key}
                        title={`${cat.label}: ${val >= 0 ? "+" : ""}${fmtShares(val)}주`}
                        className={`w-full rounded-sm ${isUp ? cat.bg : "bg-red-400"} opacity-80`}
                        style={{ height: h, minHeight: 2 }}
                      />
                    );
                  })}
                  <span className="text-gray-300 text-[9px] rotate-90 mt-1 origin-left" style={{ writingMode: "horizontal-tb" }}>
                    {row.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>매도 ↓</span>
            <span>↑ 매수</span>
          </div>
        </div>
      ) : (
        /* ── 누적 합계 ── */
        <div className="space-y-4 pt-1">
          {total && CATS.map((cat) => (
            <SummaryBar
              key={cat.key}
              label={cat.label}
              bg={cat.bg}
              value={total[cat.key]}
              max={maxTotal}
            />
          ))}
          <p className="text-xs text-gray-400 pt-1">최근 20거래일 누적 순매수 수량</p>
        </div>
      )}
    </div>
  );
}
