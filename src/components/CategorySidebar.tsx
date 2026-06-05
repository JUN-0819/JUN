"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function toSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/·/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Category {
  icon: string;
  label: string;
  sub: string[];
}

const CATEGORIES: Category[] = [
  {
    icon: "⚡",
    label: "에너지",
    sub: ["미드스트림·파이프라인", "석유·가스 메이저", "원전·우라늄", "유틸리티", "청정에너지", "Oil Services"],
  },
  {
    icon: "🎮",
    label: "미디어·엔터",
    sub: ["스트리밍·OTT", "게임", "광고·마케팅", "음악·콘텐츠"],
  },
  {
    icon: "🏠",
    label: "부동산",
    sub: ["리츠 (REITs)", "주거용 부동산", "상업용 부동산", "데이터센터 리츠"],
  },
  {
    icon: "🏭",
    label: "산업재·방산",
    sub: ["항공우주·방산", "기계·장비", "건설·인프라", "물류·운송"],
  },
  {
    icon: "💰",
    label: "금융·핀테크",
    sub: ["은행", "보험", "자산운용", "결제·핀테크", "암호화폐"],
  },
  {
    icon: "💼",
    label: "비즈니스·데이터 서비스",
    sub: ["클라우드·SaaS", "보안·사이버", "엔터프라이즈 소프트웨어", "데이터·분석"],
  },
  {
    icon: "📡",
    label: "통신·5G",
    sub: ["이동통신", "위성·통신인프라", "네트워크 장비"],
  },
  {
    icon: "🔧",
    label: "AI 반도체",
    sub: ["GPU·NPU", "메모리", "파운드리", "팹리스", "장비·소재"],
  },
  {
    icon: "🤖",
    label: "AI·메가테크",
    sub: ["AI 플랫폼", "빅테크", "자율주행", "로봇·자동화"],
  },
  {
    icon: "🛒",
    label: "필수소비재",
    sub: ["식품·음료", "생활용품", "담배", "유통·슈퍼마켓"],
  },
  {
    icon: "⚗️",
    label: "소재·원자재",
    sub: ["화학", "철강·금속", "광업", "농업·비료"],
  },
  {
    icon: "🏥",
    label: "헬스케어·바이오",
    sub: ["제약·신약", "바이오텍", "의료기기", "헬스케어 서비스"],
  },
  {
    icon: "🛍️",
    label: "소비재·리테일",
    sub: ["전자상거래", "패션·럭셔리", "자동차", "여행·레저"],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CategorySidebar({ open, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  // 바깥 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggle = (label: string) =>
    setExpanded((prev) => (prev === label ? null : label));

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 사이드바 패널 */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-250 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-900">
          <span className="text-white font-bold text-sm tracking-wide">카테고리</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 카테고리 목록 */}
        <div className="overflow-y-auto flex-1 py-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <button
                onClick={() => toggle(cat.label)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base w-5 text-center">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{cat.label}</span>
                </div>
                <span
                  className={`text-gray-400 text-xs transition-transform duration-200 ${
                    expanded === cat.label ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* 서브카테고리 */}
              {expanded === cat.label && (
                <div className="bg-gray-50 border-l-2 border-blue-400 ml-5">
                  {cat.sub.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        onClose();
                        router.push(`/category/${toSlug(sub)}`);
                      }}
                      className="w-full text-left px-5 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
