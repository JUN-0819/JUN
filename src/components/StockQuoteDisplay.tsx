"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

interface QuoteData {
  price: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  sharesOutstanding: number | null;
  volume: number | null;
  per?: string | number | null;
  pbr?: string | number | null;
}

function fmtRatio(val: string | number | null | undefined): string {
  if (val == null) return "-";
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isFinite(n) ? n.toFixed(2) : "-";
}

export default function StockQuoteDisplay({ quote }: { quote: QuoteData }) {
  const { fmt, fmtPrice } = useCurrency();
  const isUp = quote.changePercent >= 0;

  const displayPrice  = fmtPrice(quote.price);
  const displayChange = fmtPrice(Math.abs(quote.change));

  return (
    <>
      {/* 주가 */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 tabular-nums">{displayPrice}</p>
        <p className={`text-sm font-semibold mt-0.5 ${isUp ? "text-emerald-600" : "text-red-600"}`}>
          {isUp ? "▲" : "▼"} {displayChange} ({Math.abs(quote.changePercent).toFixed(2)}%)
        </p>
      </div>

      {/* 지표 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5 pt-5 border-t border-gray-100">
        <div>
          <p className="text-gray-400 text-xs">시가총액</p>
          <p className="text-gray-900 font-semibold mt-0.5 tabular-nums text-sm">{fmt(quote.marketCap)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">발행주식수</p>
          <p className="text-gray-900 font-semibold mt-0.5 tabular-nums text-sm">
            {quote.sharesOutstanding != null
              ? `${Math.round(quote.sharesOutstanding / 1e4).toLocaleString()}만주`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">PER</p>
          <p className="text-gray-900 font-semibold mt-0.5 tabular-nums text-sm">{fmtRatio(quote.per)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">PBR</p>
          <p className="text-gray-900 font-semibold mt-0.5 tabular-nums text-sm">{fmtRatio(quote.pbr)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">거래량</p>
          <p className="text-gray-900 font-semibold mt-0.5 tabular-nums text-sm">
            {quote.volume != null
              ? `${Math.round(quote.volume / 1e4).toLocaleString()}만주`
              : "-"}
          </p>
        </div>
      </div>
    </>
  );
}
