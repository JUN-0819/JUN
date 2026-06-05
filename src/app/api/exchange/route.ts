import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

const PAIRS = [
  { symbol: "USDKRW=X", label: "달러/원", unit: 1, decimals: 0 },
  { symbol: "EURKRW=X", label: "유로/원", unit: 1, decimals: 0 },
  { symbol: "JPYKRW=X", label: "100엔/원", unit: 100, decimals: 2 },
  { symbol: "CNYKRW=X", label: "위안/원", unit: 1, decimals: 2 },
  { symbol: "GBPKRW=X", label: "파운드/원", unit: 1, decimals: 0 },
];

export async function GET() {
  const results = await Promise.allSettled(
    PAIRS.map(async ({ symbol, label, unit, decimals }) => {
      const q = await yf.quote(symbol);
      return {
        label,
        rate: (q.regularMarketPrice ?? 0) * unit,
        changePercent: q.regularMarketChangePercent ?? 0,
        decimals,
      };
    })
  );

  const data = results
    .filter((r): r is PromiseFulfilledResult<{ label: string; rate: number; changePercent: number; decimals: number }> => r.status === "fulfilled")
    .map((r) => r.value);

  return NextResponse.json({ data });
}
