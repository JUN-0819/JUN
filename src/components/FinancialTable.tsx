"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface IncomeStatement {
  date: string;
  revenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
}

interface BalanceSheet {
  date: string;
  totalAssets: number | null;
  totalEquity: number | null;
  totalDebt: number | null;
}

function quarterLabel(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${yy}/${q}Q`;
}

export default function FinancialTable({ ticker }: { ticker: string }) {
  const [tab, setTab] = useState<"income" | "balance">("income");
  const [income, setIncome] = useState<IncomeStatement[]>([]);
  const [balance, setBalance] = useState<BalanceSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const { fmt } = useCurrency();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/financials/${ticker}`)
      .then((r) => r.json())
      .then((d) => {
        setIncome(d.incomeStatements ?? []);
        setBalance(d.balanceSheets ?? []);
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(["income", "balance"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                tab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "income" ? "손익계산서" : "재무상태표"}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">분기별</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "income" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 pr-4 font-medium">분기</th>
                <th className="text-right py-2 pr-4 font-medium">매출액</th>
                <th className="text-right py-2 pr-4 font-medium">영업이익</th>
                <th className="text-right py-2 font-medium">순이익</th>
              </tr>
            </thead>
            <tbody>
              {income.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">데이터 없음</td></tr>
              ) : (
                income.map((r) => (
                  <tr key={r.date} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-600 font-medium">{quarterLabel(r.date)}</td>
                    <td className="py-2 pr-4 text-right text-gray-900 tabular-nums">{fmt(r.revenue)}</td>
                    <td className={`py-2 pr-4 text-right tabular-nums ${
                      r.operatingIncome !== null && r.operatingIncome >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>{fmt(r.operatingIncome)}</td>
                    <td className={`py-2 text-right tabular-nums ${
                      r.netIncome !== null && r.netIncome >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}>{fmt(r.netIncome)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 pr-4 font-medium">분기</th>
                <th className="text-right py-2 pr-4 font-medium">총자산</th>
                <th className="text-right py-2 pr-4 font-medium">자기자본</th>
                <th className="text-right py-2 font-medium">부채</th>
              </tr>
            </thead>
            <tbody>
              {balance.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">데이터 없음</td></tr>
              ) : (
                balance.map((r) => (
                  <tr key={r.date} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-600 font-medium">{quarterLabel(r.date)}</td>
                    <td className="py-2 pr-4 text-right text-gray-900 tabular-nums">{fmt(r.totalAssets)}</td>
                    <td className="py-2 pr-4 text-right text-emerald-600 tabular-nums">{fmt(r.totalEquity)}</td>
                    <td className="py-2 text-right text-red-600 tabular-nums">{fmt(r.totalDebt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
