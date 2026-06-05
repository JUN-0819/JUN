import SearchBar from "@/components/SearchBar";
import MarketOverview from "@/components/MarketOverview";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 종목 분석기</h1>
          <p className="text-gray-500 text-sm">
            미국 · 한국 주식 차트, 재무제표, 뉴스를 한 곳에서
          </p>
        </div>

        <div className="mb-12">
          <SearchBar />
        </div>

        <MarketOverview />
      </div>
    </main>
  );
}
