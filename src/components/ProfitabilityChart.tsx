"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Quarter {
  date: string;
  revenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
}

const PERIOD_OPTIONS = [
  { label: "1년", q: 4 },
  { label: "3년", q: 12 },
  { label: "5년", q: 20 },
] as const;

// 데이터 열 너비(px) — 바와 셀이 같은 너비를 공유하므로 정렬 보장
const COL_W = 80;
const CHART_H = 180;
const LEFT_W = 96;

function qLabel(dateStr: string) {
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const m = d.getMonth() + 1;
  return `${yy}년 ${m}월`;
}

function calcGrowth(curr: number | null, prev: number | null) {
  if (curr == null || prev == null || prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export default function ProfitabilityChart({
  ticker,
  name,
}: {
  ticker: string;
  name?: string;
}) {
  const { fmt } = useCurrency();
  const [allData, setAllData] = useState<Quarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<4 | 12 | 20>(12);

  useEffect(() => {
    fetch(`/api/financials/${ticker}`)
      .then((r) => r.json())
      .then((d) => {
        const sorted = [...(d.incomeStatements ?? [])]
          .filter((r: Quarter) => r.revenue != null)
          .sort((a: Quarter, b: Quarter) => a.date.localeCompare(b.date));
        setAllData(sorted);
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading)
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (allData.length === 0)
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <p className="text-gray-400 text-center py-8">재무 데이터 없음</p>
      </div>
    );

  const data = allData.slice(-period);
  const latest = data[data.length - 1];
  const prev   = data[data.length - 2];

  // ── 스케일 계산 ──────────────────────────────────────────
  const revs = data.map((d) => d.revenue ?? 0);
  const nets = data.map((d) => d.netIncome ?? 0);
  const yMax = Math.max(...revs, ...nets.filter((v) => v > 0)) * 1.15 || 1;
  const yMin = Math.min(...nets.filter((v) => v < 0), 0) * 1.15;
  const yRange = yMax - yMin;

  const toY   = (v: number) => CHART_H - ((v - yMin) / yRange) * CHART_H;
  const baseY = toY(0);

  const margins = data.map((d) =>
    d.revenue && d.revenue !== 0 && d.netIncome != null
      ? (d.netIncome / d.revenue) * 100
      : null
  );
  const validM = margins.filter((m): m is number => m !== null);
  const mMin  = validM.length ? Math.min(...validM) : 0;
  const mMax  = validM.length ? Math.max(...validM) : 10;
  const mPad  = Math.max((mMax - mMin) * 0.15, 2);
  const mLow  = mMin - mPad;
  const mHigh = mMax + mPad;
  const toMY = (pct: number) => CHART_H - ((pct - mLow) / (mHigh - mLow)) * CHART_H;

  // Y축 눈금 (4단계)
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (yRange * i) / 4);

  // 순이익률 선 포인트 (열 중앙 X = (i + 0.5) * COL_W 로 바와 동일)
  const linePoints = data
    .map((_, i) => {
      const m = margins[i];
      return m !== null ? `${(i + 0.5) * COL_W},${toMY(m)}` : null;
    })
    .filter(Boolean)
    .join(" ");

  // 요약 문장
  const latestNetGrowth = calcGrowth(latest?.netIncome ?? null, prev?.netIncome ?? null);
  const summaryLine = (() => {
    if (!latest?.netIncome) return "";
    const label = qLabel(latest.date);
    const co    = name ?? ticker;
    const dir   = latestNetGrowth != null
      ? `직전 분기 대비 ${Math.abs(latestNetGrowth).toFixed(2)}% ${latestNetGrowth >= 0 ? "높아요" : "낮아요"}`
      : "";
    return `${label} ${co}의 순이익은 ${fmt(latest.netIncome)}으로${dir ? " " + dir : ""}.`;
  })();

  const totalDataW = data.length * COL_W;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* ── 헤더 ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900">수익성</h3>
          <span className="text-xs text-gray-400">매출·순이익 성장률</span>
        </div>
        {summaryLine && <p className="text-sm text-gray-600 mb-4">{summaryLine}</p>}
        <div className="flex items-center gap-2 mb-3">
          {PERIOD_OPTIONS.map(({ label, q }) => (
            <button
              key={q}
              onClick={() => setPeriod(q as 4 | 12 | 20)}
              className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                period === q
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-1">분기</span>
        </div>
        {/* 범례 */}
        <div className="flex gap-5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-200" />매출</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" />순이익</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-amber-400" />순이익률</span>
        </div>
      </div>

      {/* ── 통합 바차트 + 테이블 (단일 가로 스크롤) ── */}
      <div className="overflow-x-auto border-t border-gray-100">
        <div className="flex" style={{ minWidth: LEFT_W + totalDataW }}>

          {/* 왼쪽 고정 라벨 열 */}
          <div
            className="sticky left-0 z-10 bg-white border-r border-gray-100 flex-shrink-0"
            style={{ width: LEFT_W }}
          >
            {/* 차트 영역 — Y축 눈금 */}
            <div className="relative border-b border-gray-100" style={{ height: CHART_H }}>
              {yTicks.map((v, i) => (
                <div
                  key={i}
                  className="absolute right-1 text-[9px] text-gray-400 tabular-nums"
                  style={{ top: toY(v) - 6 }}
                >
                  {fmt(v) === "-" ? "0" : fmt(v)}
                </div>
              ))}
            </div>
            {/* 열 헤더 */}
            <div className="text-xs font-semibold text-gray-500 py-2 px-3 border-b border-gray-100">항목</div>
            {/* 행 라벨 */}
            {[
              { el: <><span className="w-2 h-2 rounded-full bg-blue-300 inline-block mr-1" />매출</>, key: "rev" },
              { el: <><span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1" />순이익</>, key: "net" },
              { el: <><span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1" />순이익률</>, key: "mar" },
              { el: <span className="whitespace-nowrap">순이익 성장률</span>, key: "grow" },
            ].map(({ el, key }) => (
              <div key={key} className="text-xs font-medium text-gray-700 py-2 px-3 border-b border-gray-50 flex items-center">
                {el}
              </div>
            ))}
          </div>

          {/* 데이터 열 영역 (바 + 데이터가 같은 COL_W를 공유) */}
          <div className="relative flex-shrink-0" style={{ width: totalDataW }}>
            {/* SVG 선: COL_W 기반으로 계산하므로 바와 정확히 일치 */}
            <svg
              style={{ position: "absolute", top: 0, left: 0, width: totalDataW, height: CHART_H, pointerEvents: "none", zIndex: 5 }}
            >
              {/* 기준선 */}
              <line x1={0} x2={totalDataW} y1={baseY} y2={baseY} stroke="#e5e7eb" strokeWidth={1} />
              {/* Y 격자선 */}
              {yTicks.map((v, i) => (
                <line key={i} x1={0} x2={totalDataW} y1={toY(v)} y2={toY(v)} stroke="#f3f4f6" strokeWidth={1} />
              ))}
              {/* 순이익률 선 */}
              {linePoints && (
                <polyline points={linePoints} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeLinejoin="round" />
              )}
              {/* 순이익률 점 */}
              {data.map((d, i) => {
                const m = margins[i];
                if (m === null) return null;
                const cx = (i + 0.5) * COL_W;
                return (
                  <g key={d.date}>
                    <circle cx={cx} cy={toMY(m)} r={3} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} />
                    {/* 우측 라벨 (마지막/최대값에만) */}
                    {(i === data.length - 1 || m === Math.max(...validM) || m === Math.min(...validM)) && (
                      <text x={cx + 5} y={toMY(m) + 4} fontSize={9} fill="#f59e0b" fontWeight="600">
                        {m.toFixed(1)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 각 데이터 열 (바 + 셀) */}
            <div className="flex border-b border-gray-100">
              {data.map((d, i) => {
                const rev = d.revenue ?? 0;
                const net = d.netIncome ?? 0;
                const netIsNeg = net < 0;

                // SVG y 좌표(top 기준) → CSS top 값으로 직접 사용
                const revTop = Math.min(toY(rev), baseY);
                const revH   = Math.max(Math.abs(baseY - toY(rev)), 1);

                // 음수 순이익: baseline 에서 아래로
                const netTop = netIsNeg ? baseY : Math.min(toY(net), baseY);
                const netH   = Math.max(Math.abs(baseY - toY(net)), 1);

                return (
                  <div
                    key={d.date}
                    className="flex-shrink-0 relative border-l border-gray-50"
                    style={{ width: COL_W, height: CHART_H }}
                  >
                    {/* 매출 막대 (연한 파랑, 뒤) */}
                    <div
                      className="absolute bg-blue-200 rounded-sm"
                      style={{ left: 10, right: 10, top: revTop, height: revH }}
                    />
                    {/* 순이익 막대 (진한/빨강, 앞) */}
                    <div
                      className={`absolute rounded-sm ${netIsNeg ? "bg-red-400" : "bg-blue-500"}`}
                      style={{ left: 10, right: 10, top: netTop, height: netH }}
                    />
                  </div>
                );
              })}
            </div>

            {/* 분기 라벨 행 */}
            <div className="flex border-b border-gray-100">
              {data.map((d) => (
                <div
                  key={d.date}
                  className="flex-shrink-0 text-center text-[10px] text-gray-500 font-medium py-2 border-l border-gray-50"
                  style={{ width: COL_W }}
                >
                  {qLabel(d.date)}
                </div>
              ))}
            </div>

            {/* 매출 행 */}
            <div className="flex border-b border-gray-50">
              {data.map((d) => (
                <div
                  key={d.date}
                  className="flex-shrink-0 text-right text-xs tabular-nums py-2 pr-2 text-gray-800 border-l border-gray-50"
                  style={{ width: COL_W }}
                >
                  {fmt(d.revenue)}
                </div>
              ))}
            </div>

            {/* 순이익 행 */}
            <div className="flex border-b border-gray-50">
              {data.map((d) => (
                <div
                  key={d.date}
                  className={`flex-shrink-0 text-right text-xs tabular-nums py-2 pr-2 font-medium border-l border-gray-50 ${
                    (d.netIncome ?? 0) < 0 ? "text-red-600" : "text-gray-800"
                  }`}
                  style={{ width: COL_W }}
                >
                  {fmt(d.netIncome)}
                </div>
              ))}
            </div>

            {/* 순이익률 행 */}
            <div className="flex border-b border-gray-50">
              {data.map((d, i) => {
                const m = margins[i];
                return (
                  <div
                    key={d.date}
                    className="flex-shrink-0 text-right text-xs tabular-nums py-2 pr-2 text-gray-600 border-l border-gray-50"
                    style={{ width: COL_W }}
                  >
                    {m !== null ? `${m.toFixed(2)}%` : "-"}
                  </div>
                );
              })}
            </div>

            {/* 순이익 성장률 행 */}
            <div className="flex">
              {data.map((d, i) => {
                const g = i === 0 ? null : calcGrowth(d.netIncome, data[i - 1].netIncome);
                return (
                  <div
                    key={d.date}
                    className={`flex-shrink-0 text-right text-xs tabular-nums py-2 pr-2 font-medium border-l border-gray-50 ${
                      g === null ? "text-gray-400" : g >= 0 ? "text-blue-600" : "text-red-500"
                    }`}
                    style={{ width: COL_W }}
                  >
                    {i === 0 ? "-" : g !== null ? `${g >= 0 ? "+" : ""}${g.toFixed(2)}%` : "-"}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
