import YahooFinance from "yahoo-finance2";
import { getNaverCode } from "@/lib/naver";
import { datagoAvailable, datagoQuote } from "@/lib/datago";

const yf = new YahooFinance();

export async function GET(_req: Request, ctx: RouteContext<"/api/quote/[ticker]">) {
  const { ticker } = await ctx.params;
  const code = getNaverCode(ticker);

  // ── 한국 주식: 금융위원회 주식시세정보 API (T+1) ─────────────────
  if (code && datagoAvailable()) {
    try {
      const item = await datagoQuote(code);
      if (item) {
        return Response.json({
          symbol: ticker.toUpperCase(),
          name: item.itmsNm ?? ticker,
          price: parseInt(item.clpr ?? "0"),
          change: parseInt(item.vs ?? "0"),
          changePercent: parseFloat(item.fltRt ?? "0"),
          marketCap: parseFloat(item.mrktTotAmt ?? "0") || null,
          sharesOutstanding: parseFloat(item.lstgStCnt ?? "0") || null,
          week52High: null,
          week52Low: null,
          volume: parseInt(item.trqu ?? "0"),
          currency: "KRW",
          exchange: item.mrktCtg ?? (ticker.includes(".KQ") ? "KOSDAQ" : "KOSPI"),
          marketState: "REGULAR",
          baseDate: item.basDt ?? null, // 기준일자 표시용
        });
      }
    } catch (e) {
      console.error("[quote] data.go.kr 실패, Yahoo로 전환:", e);
    }
  }

  // ── 미국 주식 (또는 fallback): Yahoo Finance ──────────────────
  try {
    const [q, summary] = await Promise.all([
      yf.quote(ticker),
      yf.quoteSummary(ticker, { modules: ["defaultKeyStatistics", "summaryDetail"] }).catch(() => null),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ks = (summary as any)?.defaultKeyStatistics ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sd = (summary as any)?.summaryDetail ?? {};

    return Response.json({
      symbol: q.symbol,
      name: q.longName || q.shortName || ticker,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      marketCap: q.marketCap,
      sharesOutstanding: q.sharesOutstanding,
      week52High: q.fiftyTwoWeekHigh,
      week52Low: q.fiftyTwoWeekLow,
      volume: q.regularMarketVolume,
      currency: q.currency,
      exchange: q.fullExchangeName,
      marketState: q.marketState,
      per: sd.trailingPE ?? null,
      pbr: ks.priceToBook ?? null,
      eps: ks.trailingEps ?? null,
    });
  } catch {
    return Response.json({ error: "종목을 찾을 수 없습니다." }, { status: 404 });
  }
}
