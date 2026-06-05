export function getNaverCode(ticker: string): string | null {
  const m = ticker.match(/^(\d{6})(\.(KS|KQ))?$/);
  return m ? m[1] : null;
}

export function isKoreanStock(ticker: string): boolean {
  return getNaverCode(ticker) !== null;
}

const NAV_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://m.stock.naver.com/",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
};

export async function naverFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: NAV_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Naver ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

export function toNaverDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}
