"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StockInfo } from "@/data/categoryStocks";

interface LiveData {
  price: number;
  change: number;
  changePercent: number;
  volume: number | null;
  marketCap: number | null;
  currency: string;
}

interface Props {
  stocks?: StockInfo[];
  categoryLabel?: string;
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtVolume(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

function fmtMarketCap(v: number | null, currency: string): string {
  if (v === null) return "—";
  const sym = currency === "KRW" ? "₩" : "$";
  if (v >= 1_000_000_000_000) return `${sym}${(v / 1_000_000_000_000).toFixed(2)}T`;
  if (v >= 1_000_000_000) return `${sym}${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(0)}M`;
  return `${sym}${v.toLocaleString()}`;
}

function ChangeCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-gray-300">—</span>;
  const isUp = value >= 0;
  return (
    <span className={`font-medium tabular-nums text-xs ${isUp ? "text-red-500" : "text-blue-500"}`}>
      {isUp ? "▲" : "▼"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

const SKELETON = "h-4 rounded animate-pulse bg-gray-100";

function getFlag(ticker: string): string {
  if (ticker.endsWith(".KS") || ticker.endsWith(".KQ")) return "🇰🇷";
  if (ticker.endsWith(".T"))  return "🇯🇵";
  if (ticker.endsWith(".HK")) return "🇭🇰";
  if (ticker.endsWith(".L"))  return "🇬🇧";
  if (ticker.endsWith(".PA")) return "🇫🇷";
  if (ticker.endsWith(".DE")) return "🇩🇪";
  return "🇺🇸";
}

function StockLogo({ ticker, name }: { ticker: string; name: string }) {
  const [err, setErr] = useState(false);
  const baseTicker = ticker.split(".")[0].toUpperCase();
  const flag = getFlag(ticker);
  const initial = name.replace(/[^a-zA-Z가-힣]/g, "").charAt(0).toUpperCase();

  return (
    <div className="relative flex-shrink-0 w-8 h-8">
      {!err ? (
        <img
          src={`https://assets.parqet.com/logos/symbol/${baseTicker}?format=svg`}
          alt={name}
          className="w-8 h-8 rounded-full object-contain bg-white border border-gray-100 p-0.5"
          onError={() => setErr(true)}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
          {initial}
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none">{flag}</span>
    </div>
  );
}

export default function CategoryTable({ stocks: rawStocks, categoryLabel }: Props) {
  const stocks: StockInfo[] = rawStocks ?? [];
  const [live, setLive] = useState<Record<string, LiveData | null>>({});
  const [loading, setLoading] = useState(stocks.length > 0);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    if (stocks.length === 0) { setLoading(false); return; }
    setLoading(true);
    Promise.all(
      stocks.map(async (s) => {
        try {
          const res = await fetch(`/api/quote/${encodeURIComponent(s.ticker)}`);
          const d = await res.json();
          if (d.error || d.price === undefined) return { ticker: s.ticker, data: null };
          return {
            ticker: s.ticker,
            data: {
              price: d.price,
              change: d.change,
              changePercent: d.changePercent,
              volume: d.volume ?? null,
              marketCap: d.marketCap ?? null,
              currency: d.currency ?? "USD",
            } as LiveData,
          };
        } catch {
          return { ticker: s.ticker, data: null };
        }
      })
    ).then((results) => {
      const map: Record<string, LiveData | null> = {};
      for (const r of results) map[r.ticker] = r.data;
      setLive(map);
      setLoading(false);
    });
  }, [stocks]);

  const toggleAll = () => {
    if (allChecked) {
      setChecked(new Set());
    } else {
      setChecked(new Set(stocks.map((_, i) => i)));
    }
    setAllChecked(!allChecked);
  };

  const toggleOne = (i: number) => {
    const next = new Set(checked);
    next.has(i) ? next.delete(i) : next.add(i);
    setChecked(next);
    setAllChecked(next.size === stocks.length);
  };

  const rows = stocks.length > 0 ? stocks : Array.from({ length: 9 }, () => ({
    ticker: "—",
    name: "종목명",
    description: "데이터 없음",
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="rounded border-gray-300 accent-blue-500"
                />
              </th>
              <th className="w-8 px-2 py-3 text-center font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium min-w-[150px]">종목</th>
              <th className="px-4 py-3 text-left font-medium min-w-[160px]">설명</th>
              <th className="px-4 py-3 text-left font-medium min-w-[100px]">섹터</th>
              <th className="px-4 py-3 text-right font-medium min-w-[90px]">현재가</th>
              <th className="px-4 py-3 text-right font-medium min-w-[80px]">등락</th>
              <th className="px-4 py-3 text-right font-medium min-w-[60px]">RSI</th>
              <th className="px-4 py-3 text-right font-medium min-w-[90px]">거래량</th>
              <th className="px-4 py-3 text-right font-medium min-w-[100px]">시가총액</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((stock, i) => {
              const d = live[stock.ticker];
              const isLoading = loading && stock.ticker !== "—";
              const isUp = d && (d.changePercent ?? 0) >= 0;

              return (
                <tr
                  key={`${stock.ticker}-${i}`}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {/* 체크박스 */}
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggleOne(i)}
                      className="rounded border-gray-300 accent-blue-500"
                    />
                  </td>

                  {/* # */}
                  <td className="px-2 py-3.5 text-center">
                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                      {i + 1}
                    </span>
                  </td>

                  {/* 종목 */}
                  <td className="px-4 py-3.5">
                    {stock.ticker !== "—" ? (
                      <Link
                        href={`/stock/${encodeURIComponent(stock.ticker)}`}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                      >
                        <StockLogo ticker={stock.ticker} name={stock.name} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{stock.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{stock.ticker}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                        <div>
                          <div className={`${SKELETON} w-20 mb-1`} />
                          <div className={`${SKELETON} w-10`} />
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 설명 */}
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {stock.ticker !== "—" ? stock.description : <div className={`${SKELETON} w-32`} />}
                  </td>

                  {/* 섹터 */}
                  <td className="px-4 py-3.5">
                    {stock.ticker !== "—" ? (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {categoryLabel ?? "—"}
                      </span>
                    ) : (
                      <div className={`${SKELETON} w-16`} />
                    )}
                  </td>

                  {/* 현재가 */}
                  <td className="px-4 py-3.5 text-right">
                    {isLoading ? (
                      <div className={`${SKELETON} w-16 ml-auto`} />
                    ) : d ? (
                      <span className="font-semibold tabular-nums text-sm text-gray-900">
                        {d.currency === "KRW"
                          ? d.price.toLocaleString("ko-KR")
                          : fmt(d.price)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* 등락 */}
                  <td className="px-4 py-3.5 text-right">
                    {isLoading ? (
                      <div className={`${SKELETON} w-12 ml-auto`} />
                    ) : (
                      <ChangeCell value={d?.changePercent} />
                    )}
                  </td>

                  {/* RSI */}
                  <td className="px-4 py-3.5 text-right text-gray-300 text-xs">—</td>

                  {/* 거래량 */}
                  <td className="px-4 py-3.5 text-right">
                    {isLoading ? (
                      <div className={`${SKELETON} w-14 ml-auto`} />
                    ) : d ? (
                      <span className="text-gray-700 tabular-nums text-xs">{fmtVolume(d.volume)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* 시가총액 */}
                  <td className="px-4 py-3.5 text-right">
                    {isLoading ? (
                      <div className={`${SKELETON} w-16 ml-auto`} />
                    ) : d ? (
                      <span className="text-gray-700 tabular-nums text-xs">{fmtMarketCap(d.marketCap, d.currency)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>{stocks.length > 0 ? `${stocks.length}개 종목` : "종목 데이터 없음"}</span>
        <span>RSI 연동 예정</span>
      </div>
    </div>
  );
}
