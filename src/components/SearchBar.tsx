"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
      setLoading(false);
    }, 400);
  }, [query]);

  function select(symbol: string) {
    setQuery("");
    setOpen(false);
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && query.trim()) {
      select(query.trim().toUpperCase());
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
        <svg
          className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="종목명 또는 티커 검색 (예: AAPL, 삼성전자, 005930.KS)"
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 px-3 py-3 outline-none text-sm"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-4" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl">
          {results.map((r) => (
            <li key={r.symbol}>
              <button
                onClick={() => select(r.symbol)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-gray-900 font-medium text-sm">{r.symbol}</span>
                  <span className="text-gray-500 text-sm ml-2 truncate">{r.name}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{r.exchange}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
