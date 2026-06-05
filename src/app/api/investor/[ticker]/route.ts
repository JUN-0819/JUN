import { getNaverCode, naverFetch } from "@/lib/naver";

function n(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseInt(val.replace(/,/g, "")) || 0;
  return 0;
}

interface NaverInvestor {
  foreignerCurrentBalanceRate?: number | string;
  foreignerNetBuyQuantity?: number | string;
  instituteNetBuyQuantity?: number | string;
  individualNetBuyQuantity?: number | string;
  accumulatedForeignerNetBuyQuantity?: number | string;
  accumulatedInstituteNetBuyQuantity?: number | string;
  accumulatedIndividualNetBuyQuantity?: number | string;
}

// Naver Finance 투자자 추이 (일별 시계열)
interface NaverTrendItem {
  date?: string;
  foreigner?: { netBuyQuantity?: number };
  institute?: { netBuyQuantity?: number };
  individual?: { netBuyQuantity?: number };
  foreignerNetBuyQuantity?: number | string;
  instituteNetBuyQuantity?: number | string;
  individualNetBuyQuantity?: number | string;
}

export async function GET(_req: Request, ctx: RouteContext<"/api/investor/[ticker]">) {
  const { ticker } = await ctx.params;
  const code = getNaverCode(ticker);

  if (!code) {
    return Response.json({ available: false, message: "한국 주식만 지원됩니다." });
  }

  try {
    // 1차 시도: 투자자 요약
    const summary = await naverFetch<NaverInvestor>(
      `https://m.stock.naver.com/api/stock/${code}/investor`
    );

    const foreignerNet = n(summary.foreignerNetBuyQuantity ?? summary.accumulatedForeignerNetBuyQuantity ?? 0);
    const instituteNet = n(summary.instituteNetBuyQuantity ?? summary.accumulatedInstituteNetBuyQuantity ?? 0);
    const individualNet = n(summary.individualNetBuyQuantity ?? summary.accumulatedIndividualNetBuyQuantity ?? 0);
    const holdingRate = n(summary.foreignerCurrentBalanceRate ?? 0);

    // 2차 시도: 일별 추이 (있으면 추가 반환)
    let trend: { date: string; foreign: number; institute: number; individual: number }[] = [];
    try {
      const trendData = await naverFetch<NaverTrendItem[]>(
        `https://m.stock.naver.com/api/stock/${code}/investorTrend`
      );
      if (Array.isArray(trendData)) {
        trend = trendData.slice(0, 20).map((r) => ({
          date: r.date ?? "",
          foreign: n(r.foreigner?.netBuyQuantity ?? r.foreignerNetBuyQuantity ?? 0),
          institute: n(r.institute?.netBuyQuantity ?? r.instituteNetBuyQuantity ?? 0),
          individual: n(r.individual?.netBuyQuantity ?? r.individualNetBuyQuantity ?? 0),
        }));
      }
    } catch {
      // 추이 데이터 없어도 요약만 반환
    }

    return Response.json({
      available: true,
      foreignerNet,
      instituteNet,
      individualNet,
      holdingRate,
      trend,
      total: { foreign: foreignerNet, institute: instituteNet, individual: individualNet },
    });
  } catch (e) {
    console.error("[investor] Naver 실패:", e);
    return Response.json(
      { available: false, message: "투자자 현황을 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
