import YahooFinance from "yahoo-finance2";
import { getNaverCode } from "@/lib/naver";

const yf = new YahooFinance();

async function translateToKo(text: string): Promise<string | null> {
  try {
    // Google Translate 비공식 API (무료, 캐시 24h)
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text.slice(0, 2000))}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    return (data[0] as [string][]).map(([t]) => t).join("");
  } catch {
    return null;
  }
}

const SECTOR_KO: Record<string, string> = {
  "Technology": "기술",
  "Consumer Cyclical": "경기소비재",
  "Consumer Defensive": "필수소비재",
  "Healthcare": "헬스케어",
  "Financial Services": "금융",
  "Communication Services": "커뮤니케이션",
  "Industrials": "산업재",
  "Basic Materials": "소재",
  "Real Estate": "부동산",
  "Energy": "에너지",
  "Utilities": "유틸리티",
};

export async function GET(_req: Request, ctx: RouteContext<"/api/profile/[ticker]">) {
  const { ticker } = await ctx.params;
  const code = getNaverCode(ticker);
  const yahooTicker = code ? `${code}.KS` : ticker;

  try {
    const summary = await yf.quoteSummary(yahooTicker, { modules: ["assetProfile"] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (summary as any).assetProfile ?? {};

    const descEn: string = p.longBusinessSummary ?? "";
    let descKo: string | null = null;

    if (descEn) {
      descKo = await translateToKo(descEn);
    }

    // 주요사업: 첫 두 문장 (번역 우선)
    const fullDesc = descKo ?? descEn;
    const sentences = fullDesc.split(/(?<=[.。])\s+/);
    const mainBusiness = sentences.slice(0, 2).join(" ").trim();

    const sectorKo = p.sector ? (SECTOR_KO[p.sector] ?? p.sector) : null;

    return Response.json({
      description: fullDesc || null,
      mainBusiness: mainBusiness || null,
      industry: p.industry ?? null,
      sector: p.sector ?? null,
      sectorKo,
      website: p.website ?? null,
      employees: p.fullTimeEmployees ?? null,
      country: p.country ?? null,
      city: p.city ?? null,
    });
  } catch {
    return Response.json({ description: null }, { status: 500 });
  }
}
