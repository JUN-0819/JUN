import Link from "next/link";
import StockChart from "@/components/StockChart";
import FinancialTable from "@/components/FinancialTable";
import NewsCard from "@/components/NewsCard";
import InvestorChart from "@/components/InvestorChart";
import ProfitabilityChart from "@/components/ProfitabilityChart";
import CurrencyToggle from "@/components/CurrencyToggle";
import CompanyProfile from "@/components/CompanyProfile";
import StockQuoteDisplay from "@/components/StockQuoteDisplay";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { isKoreanStock } from "@/lib/naver";

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  sharesOutstanding: number | null;
  week52High: number | null;
  week52Low: number | null;
  volume: number | null;
  currency: string;
  exchange: string;
  marketState: string;
  per?: string | number | null;
  pbr?: string | number | null;
  eps?: string | number | null;
  industry?: string | null;
  baseDate?: string | null;
}


async function getQuote(ticker: string): Promise<QuoteData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/quote/${encodeURIComponent(ticker)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function StockPage(props: PageProps<"/stock/[ticker]">) {
  const { ticker } = await props.params;
  const decodedTicker = decodeURIComponent(ticker);
  const quote = await getQuote(decodedTicker);
  const isKorean = isKoreanStock(decodedTicker);
  const baseCurrency = quote?.currency === "USD" ? "USD" : "KRW";

  return (
    <CurrencyProvider baseCurrency={baseCurrency}>
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-6">

          <Link href="/"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors">
            ← 홈으로
          </Link>

          {/* ── 종목 헤더 ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            {quote ? (
              <>
                {/* 이름 행 + 통화 토글 */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{quote.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-gray-500 text-sm">{quote.symbol} · {quote.exchange}</span>
                      {quote.industry && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{quote.industry}</span>
                      )}
                      {quote.marketState !== "REGULAR" && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{quote.marketState}</span>
                      )}
                    </div>
                    {quote.baseDate && (
                      <p className="text-gray-400 text-xs mt-1">
                        기준일: {quote.baseDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}
                      </p>
                    )}
                  </div>

                  {/* $ / 원 토글 */}
                  <CurrencyToggle />
                </div>

                {/* 주가 + 지표 (토글 반응형) */}
                <StockQuoteDisplay quote={{
                  price: quote.price,
                  change: quote.change,
                  changePercent: quote.changePercent,
                  marketCap: quote.marketCap,
                  sharesOutstanding: quote.sharesOutstanding,
                  volume: quote.volume,
                  per: quote.per,
                  pbr: quote.pbr,
                }} />
              </>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{decodedTicker}</h1>
                  <p className="text-gray-500 text-sm mt-1">시세를 불러올 수 없습니다.</p>
                </div>
                <CurrencyToggle />
              </div>
            )}
          </div>

          {/* ── 차트 (RSI + 기간 성과 포함) ── */}
          <div className="mb-6">
            <StockChart ticker={decodedTicker} />
          </div>

          {/* ── 기업 정보 ── */}
          <div className="mb-6">
            <CompanyProfile ticker={decodedTicker} />
          </div>

          {/* ── 수익성 차트 ── */}
          <div className="mb-6">
            <ProfitabilityChart ticker={decodedTicker} name={quote?.name} />
          </div>

          {/* ── 재무제표 + 뉴스 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <FinancialTable ticker={decodedTicker} />
            <NewsCard ticker={decodedTicker} />
          </div>

          {/* ── 투자자 현황 (한국 주식만) ── */}
          {isKorean && (
            <div className="mb-6">
              <InvestorChart ticker={decodedTicker} />
            </div>
          )}

        </div>
      </main>
    </CurrencyProvider>
  );
}
