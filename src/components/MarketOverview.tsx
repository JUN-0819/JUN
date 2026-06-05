"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const POPULAR = [
  { symbol: "AAPL", label: "애플" },
  { symbol: "NVDA", label: "엔비디아" },
  { symbol: "TSLA", label: "테슬라" },
  { symbol: "MSFT", label: "마이크로소프트" },
  { symbol: "005930.KS", label: "삼성전자" },
  { symbol: "000660.KS", label: "SK하이닉스" },
  { symbol: "035720.KS", label: "카카오" },
  { symbol: "035420.KS", label: "NAVER" },
];

const INDICES = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^KS11", label: "KOSPI" },
  { symbol: "^KQ11", label: "KOSDAQ" },
];

function QuoteCard({ symbol, label }: { symbol: string; label: string }) {
  const [data, setData] = useState<QuoteData | null>(null);

  useEffect(() => {
    fetch(`/api/quote/${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [symbol]);

  const isUp = data && data.changePercent >= 0;

  return (
    <Link
      href={`/stock/${encodeURIComponent(symbol)}`}
      className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-colors block shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-xs">{symbol}</p>
          <p className="text-gray-800 text-sm font-medium mt-0.5">{label}</p>
        </div>
        {data && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              isUp ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            {isUp ? "+" : ""}
            {(data.changePercent ?? 0).toFixed(2)}%
          </span>
        )}
      </div>
      {data ? (
        <p className="text-gray-900 font-semibold mt-2 text-lg tabular-nums">
          {data.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      ) : (
        <div className="h-7 mt-2 bg-gray-100 rounded animate-pulse" />
      )}
    </Link>
  );
}

export default function MarketOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gray-500 font-semibold mb-3 text-xs uppercase tracking-wider">주요 지수</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {INDICES.map((item) => (
            <QuoteCard key={item.symbol} {...item} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-gray-500 font-semibold mb-3 text-xs uppercase tracking-wider">인기 종목</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR.map((item) => (
            <QuoteCard key={item.symbol} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
