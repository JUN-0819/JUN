"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Currency = "USD" | "KRW";

interface CurrencyCtx {
  selected: Currency;
  setSelected: (c: Currency) => void;
  rate: number;          // 1 USD = rate KRW
  baseCurrency: Currency; // 해당 종목의 원래 통화
  convert: (amount: number | null, from?: Currency) => number | null;
  fmt: (amount: number | null, from?: Currency) => string;
  fmtPrice: (amount: number | null, from?: Currency) => string; // 주가 전용 (소수점 유지)
}

const CurrencyContext = createContext<CurrencyCtx>({
  selected: "KRW",
  setSelected: () => {},
  rate: 1350,
  baseCurrency: "KRW",
  convert: (a) => a,
  fmt: () => "-",
  fmtPrice: () => "-",
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({
  children,
  baseCurrency,
}: {
  children: ReactNode;
  baseCurrency: Currency;
}) {
  const [selected, setSelected] = useState<Currency>(baseCurrency);
  const [rate, setRate] = useState(1350);

  useEffect(() => {
    fetch("/api/exchange")
      .then((r) => r.json())
      .then((d) => {
        const row = (d.data ?? []).find(
          (r: { label: string; rate: number }) => r.label === "달러/원"
        );
        if (row?.rate) setRate(row.rate);
      })
      .catch(() => {});
  }, []);

  const convert = useCallback(
    (amount: number | null, from: Currency = baseCurrency): number | null => {
      if (amount === null) return null;
      if (from === selected) return amount;
      return from === "KRW" ? amount / rate : amount * rate;
    },
    [selected, rate, baseCurrency]
  );

  const fmt = useCallback(
    (amount: number | null, from: Currency = baseCurrency): string => {
      const v = convert(amount, from);
      if (v === null) return "-";
      const abs = Math.abs(v);
      const sign = v < 0 ? "-" : "";
      if (selected === "USD") {
        if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
        if (abs >= 1e9)  return `${sign}$${(abs / 1e9).toFixed(2)}B`;
        if (abs >= 1e6)  return `${sign}$${(abs / 1e6).toFixed(2)}M`;
        return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
      } else {
        if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}조`;
        if (abs >= 1e8)  return `${sign}${(abs / 1e8).toFixed(0)}억`;
        if (abs >= 1e6)  return `${sign}${(abs / 1e6).toFixed(0)}백만`;
        return `${sign}${Math.round(abs).toLocaleString()}원`;
      }
    },
    [convert, selected, baseCurrency]
  );

  const fmtPrice = useCallback(
    (amount: number | null, from: Currency = baseCurrency): string => {
      const v = convert(amount, from);
      if (v === null) return "-";
      if (selected === "USD") {
        return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        return `${Math.round(v).toLocaleString("ko-KR")}원`;
      }
    },
    [convert, selected, baseCurrency]
  );

  return (
    <CurrencyContext.Provider value={{ selected, setSelected, rate, baseCurrency, convert, fmt, fmtPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}
