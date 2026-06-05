import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

async function translateToKorean(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ko`,
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    const translated: string = data.responseData?.translatedText ?? text;
    // MyMemory가 번역 실패 시 원문 반환하는 경우 처리
    if (translated.toUpperCase() === translated && translated.length > 20) return text;
    return translated;
  } catch {
    return text;
  }
}

export async function GET(_req: Request, ctx: RouteContext<"/api/news/[ticker]">) {
  const { ticker } = await ctx.params;

  try {
    const result = await yf.search(ticker, { newsCount: 10, quotesCount: 0 });
    const rawNews = (result.news || []).map((item: {
      title?: string;
      link?: string;
      providerPublishTime?: Date | number;
      publisher?: string;
      thumbnail?: { resolutions?: { url?: string }[] };
    }) => ({
      title: item.title ?? "",
      url: item.link ?? "",
      publishedAt:
        item.providerPublishTime instanceof Date
          ? item.providerPublishTime.toISOString()
          : typeof item.providerPublishTime === "number"
          ? new Date(item.providerPublishTime * 1000).toISOString()
          : null,
      source: item.publisher ?? "",
      thumbnail: item.thumbnail?.resolutions?.[0]?.url ?? null,
    }));

    const translatedTitles = await Promise.all(
      rawNews.map((item) => translateToKorean(item.title))
    );

    const news = rawNews.map((item, i) => ({
      ...item,
      translatedTitle: translatedTitles[i],
    }));

    return Response.json({ news });
  } catch {
    return Response.json({ news: [] }, { status: 500 });
  }
}
