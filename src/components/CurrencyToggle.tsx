"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

export default function CurrencyToggle() {
  const { selected, setSelected } = useCurrency();

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-sm font-semibold select-none">
      <button
        onClick={() => setSelected("USD")}
        className={`px-3 py-1.5 rounded-md transition-all ${
          selected === "USD"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        $
      </button>
      <button
        onClick={() => setSelected("KRW")}
        className={`px-3 py-1.5 rounded-md transition-all ${
          selected === "KRW"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        원
      </button>
    </div>
  );
}
