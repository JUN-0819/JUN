import YahooFinance from "yahoo-finance2";
import { NextRequest } from "next/server";

const yf = new YahooFinance();

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) return Response.json({ results: [] });

  try {
    const result = await yf.search(q, { newsCount: 0, quotesCount: 8 });
    const quotes = (result.quotes || [])
      .filter((item: { quoteType?: string }) =>
        ["EQUITY", "ETF", "MUTUALFUND", "INDEX"].includes(item.quoteType ?? "")
      )
      .map((item: {
        symbol?: string;
        shortname?: string;
        longname?: string;
        quoteType?: string;
        exchDisp?: string;
      }) => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        type: item.quoteType,
        exchange: item.exchDisp,
      }));
    return Response.json({ results: quotes });
  } catch {
    return Response.json({ results: [] }, { status: 500 });
  }
}
