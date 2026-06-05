"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  translatedTitle: string;
  url: string;
  publishedAt: string | null;
  source: string;
  thumbnail: string | null;
}

const INITIAL_COUNT = 4;

function timeAgo(isoStr: string | null): string {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "방금 전";
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function NewsCard({ ticker }: { ticker: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    setShowAll(false);
    fetch(`/api/news/${ticker}`)
      .then((r) => r.json())
      .then((d) => setNews(d.news ?? []))
      .finally(() => setLoading(false));
  }, [ticker]);

  const visibleNews = showAll ? news : news.slice(0, INITIAL_COUNT);
  const hasMore = news.length > INITIAL_COUNT;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-gray-900 font-semibold mb-4">최근 뉴스</h3>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : news.length === 0 ? (
        <p className="text-gray-400 text-center py-8">뉴스가 없습니다.</p>
      ) : (
        <>
          <ul className="space-y-1">
            {visibleNews.map((item, i) => (
              <li key={i}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-medium leading-snug group-hover:text-blue-600 line-clamp-2">
                      {item.translatedTitle || item.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {item.source} · {timeAgo(item.publishedAt)}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 w-full text-sm text-blue-500 hover:text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {showAll ? "접기 −" : `더보기 + (${news.length - INITIAL_COUNT}개)`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
