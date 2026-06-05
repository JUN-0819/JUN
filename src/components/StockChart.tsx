"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
} from "lightweight-charts";
import { OHLCV, bollingerBands, sma, rsi } from "@/lib/indicators";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Props {
  ticker: string;
}

const PERIODS = ["1W", "1M", "3M", "6M", "1Y", "5Y"] as const;
const MA_COLORS = { 5: "#f59e0b", 20: "#3b82f6", 60: "#a855f7" };

interface PeriodChange {
  amount: number;
  pct: number;
}

export default function StockChart({ ticker }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [activePeriod, setActivePeriod] = useState<string>("1Y");
  const [loading, setLoading] = useState(true);
  const [periodChange, setPeriodChange] = useState<PeriodChange | null>(null);

  const { fmt, baseCurrency } = useCurrency();

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: "#0f172a" }, textColor: "#94a3b8" },
      grid: { vertLines: { color: "#1e293b" }, horzLines: { color: "#1e293b" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#1e293b" },
      timeScale: { borderColor: "#1e293b", timeVisible: true },
      height: 480,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    let cancelled = false;
    setLoading(true);
    setPeriodChange(null);

    const seriesList: ISeriesApi<"Candlestick" | "Line">[] = [];

    async function loadData(c: IChartApi) {
      const res = await fetch(`/api/history/${ticker}?period=${activePeriod}`);
      const json = await res.json();
      if (cancelled || !json.data?.length) { setLoading(false); return; }

      const data: OHLCV[] = json.data;

      seriesList.forEach((s) => { try { c.removeSeries(s); } catch { /* ignore */ } });
      seriesList.length = 0;

      // Candlestick
      const candle = c.addSeries(CandlestickSeries, {
        upColor: "#ef4444", downColor: "#3b82f6",
        borderVisible: false, wickUpColor: "#ef4444", wickDownColor: "#3b82f6",
      });
      candle.setData(data.map((d) => ({
        time: d.time as CandlestickData["time"],
        open: d.open, high: d.high, low: d.low, close: d.close,
      })));
      seriesList.push(candle);

      // Bollinger Bands
      const bb = bollingerBands(data);
      if (bb.length > 0) {
        const opts = { lineWidth: 1 as const, priceLineVisible: false, lastValueVisible: false };
        const bbU = c.addSeries(LineSeries, { ...opts, color: "rgba(148,163,184,0.5)" });
        bbU.setData(bb.map((d) => ({ time: d.time as LineData["time"], value: d.upper })));
        const bbM = c.addSeries(LineSeries, { ...opts, color: "rgba(148,163,184,0.4)", lineStyle: 2 });
        bbM.setData(bb.map((d) => ({ time: d.time as LineData["time"], value: d.middle })));
        const bbL = c.addSeries(LineSeries, { ...opts, color: "rgba(148,163,184,0.5)" });
        bbL.setData(bb.map((d) => ({ time: d.time as LineData["time"], value: d.lower })));
        seriesList.push(bbU, bbM, bbL);
      }

      // Moving Averages
      (Object.entries(MA_COLORS) as [string, string][]).forEach(([period, color]) => {
        const maData = sma(data, Number(period));
        if (maData.length < 1) return;
        const s = c.addSeries(LineSeries, { color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        s.setData(maData.map((d) => ({ time: d.time as LineData["time"], value: d.value })));
        seriesList.push(s);
      });

      // RSI (pane 1)
      const rsiData = rsi(data);
      if (rsiData.length > 0) {
        const rsiSeries = c.addSeries(
          LineSeries,
          { color: "#f97316", lineWidth: 1, priceLineVisible: false, lastValueVisible: true,
            title: "RSI(14)", priceFormat: { type: "price", precision: 1, minMove: 0.1 } },
          1
        );
        rsiSeries.setData(rsiData.map((d) => ({ time: d.time as LineData["time"], value: d.value })));
        seriesList.push(rsiSeries);
      }

      c.timeScale().fitContent();

      // ── 기간 성과 계산 ──
      const firstClose = data[0].close;
      const lastClose  = data[data.length - 1].close;
      const amount = lastClose - firstClose;
      const pct    = (amount / firstClose) * 100;
      setPeriodChange({ amount, pct });

      setLoading(false);
    }

    loadData(chart).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [ticker, activePeriod]);

  const isUp = periodChange ? periodChange.pct >= 0 : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* 기간 버튼 + 성과 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activePeriod === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* 기간 성과 표시 */}
        {periodChange && (
          <div className={`text-sm font-semibold tabular-nums ${isUp ? "text-red-600" : "text-blue-600"}`}>
            {isUp ? "▲" : "▼"}{" "}
            {fmt(Math.abs(periodChange.amount), baseCurrency)}
            {" "}
            ({isUp ? "+" : "-"}{Math.abs(periodChange.pct).toFixed(2)}%)
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        {(Object.entries(MA_COLORS) as [string, string][]).map(([p, c]) => (
          <span key={p} className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5" style={{ backgroundColor: c }} />
            <span className="text-gray-500">MA{p}</span>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-gray-400 opacity-50" />
          <span className="text-gray-500">BB</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-orange-500 opacity-80" />
          <span className="text-gray-500">RSI(14)</span>
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10 rounded">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={containerRef} style={{ height: 480 }} />
      </div>
    </div>
  );
}
