import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ExchangeRateBar from "@/components/ExchangeRateBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "주식 분석기 — 미국·한국 주식 차트 & 재무제표",
  description: "미국 · 한국 주식 차트(볼린저밴드, 이동평균선, RSI), 재무제표, 뉴스를 한 곳에서 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <ExchangeRateBar />
        {children}
      </body>
    </html>
  );
}
