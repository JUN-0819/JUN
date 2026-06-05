"use client";

import { useState, useEffect } from "react";
import CategorySidebar from "./CategorySidebar";

interface RateItem {
  label: string;
  rate: number;
  changePercent: number;
  decimals: number;
}

export default function ExchangeRateBar() {
  const [rates, setRates] = useState<RateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/exchange")
      .then((r) => r.json())
      .then((d) => setRates(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CategorySidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 flex items-center">

        {/* 햄버거 버튼 — 화면 맨 왼쪽 */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex-shrink-0 flex flex-col justify-center gap-1 p-1.5 rounded hover:bg-slate-700 transition-colors"
          aria-label="카테고리 열기"
        >
          <span className="block w-4 h-0.5 bg-slate-300" />
          <span className="block w-4 h-0.5 bg-slate-300" />
          <span className="block w-4 h-0.5 bg-slate-300" />
        </button>

        {/* 환율 — 중앙 */}
        <div className="flex-1 flex items-center justify-center gap-6 overflow-x-auto scrollbar-none">
          <span className="text-slate-500 font-semibold flex-shrink-0 tracking-wider">환율</span>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-24 bg-slate-700 rounded animate-pulse flex-shrink-0" />
              ))
            : rates.map((r) => {
                const isUp = r.changePercent >= 0;
                return (
                  <div key={r.label} className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-white font-semibold tabular-nums">
                      {r.rate.toLocaleString("ko-KR", {
                        minimumFractionDigits: r.decimals,
                        maximumFractionDigits: r.decimals,
                      })}
                    </span>
                    <span className={`font-medium tabular-nums ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      {isUp ? "▲" : "▼"} {Math.abs(r.changePercent ?? 0).toFixed(2)}%
                    </span>
                  </div>
                );
              })}
        </div>
      </div>
    </>
  );
}
