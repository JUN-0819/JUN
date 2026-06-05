import Link from "next/link";
import CategoryTable from "@/components/CategoryTable";
import { CATEGORY_STOCKS } from "@/data/categoryStocks";

const CATEGORY_LABELS: Record<string, string> = {
  "미드스트림-파이프라인": "미드스트림·파이프라인",
  "석유-가스-메이저": "석유·가스 메이저",
  "원전-우라늄": "원전·우라늄",
  "유틸리티": "유틸리티",
  "청정에너지": "청정에너지",
  "oil-services": "Oil Services",
  "스트리밍-ott": "스트리밍·OTT",
  "게임": "게임",
  "광고-마케팅": "광고·마케팅",
  "음악-콘텐츠": "음악·콘텐츠",
  "리츠-reits": "리츠(REITs)",
  "주거용-부동산": "주거용 부동산",
  "상업용-부동산": "상업용 부동산",
  "데이터센터-리츠": "데이터센터 리츠",
  "항공우주-방산": "항공우주·방산",
  "기계-장비": "기계·장비",
  "건설-인프라": "건설·인프라",
  "물류-운송": "물류·운송",
  "은행": "은행",
  "보험": "보험",
  "자산운용": "자산운용",
  "결제-핀테크": "결제·핀테크",
  "암호화폐": "암호화폐",
  "클라우드-saas": "클라우드·SaaS",
  "보안-사이버": "보안·사이버",
  "엔터프라이즈-소프트웨어": "엔터프라이즈 소프트웨어",
  "데이터-분석": "데이터·분석",
  "이동통신": "이동통신",
  "위성-통신인프라": "위성·통신인프라",
  "네트워크-장비": "네트워크 장비",
  "gpu-npu": "GPU·NPU",
  "메모리": "메모리",
  "파운드리": "파운드리",
  "팹리스": "팹리스",
  "장비-소재": "장비·소재",
  "ai-플랫폼": "AI 플랫폼",
  "빅테크": "빅테크",
  "자율주행": "자율주행",
  "로봇-자동화": "로봇·자동화",
  "식품-음료": "식품·음료",
  "생활용품": "생활용품",
  "담배": "담배",
  "유통-슈퍼마켓": "유통·슈퍼마켓",
  "화학": "화학",
  "철강-금속": "철강·금속",
  "광업": "광업",
  "농업-비료": "농업·비료",
  "제약-신약": "제약·신약",
  "바이오텍": "바이오텍",
  "의료기기": "의료기기",
  "헬스케어-서비스": "헬스케어 서비스",
  "전자상거래": "전자상거래",
  "패션-럭셔리": "패션·럭셔리",
  "자동차": "자동차",
  "여행-레저": "여행·레저",
};

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug: rawSlug } = await props.params;
  const slug = decodeURIComponent(rawSlug);
  const label = CATEGORY_LABELS[slug] ?? slug;
  const stocks = CATEGORY_STOCKS[slug] ?? [];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 py-6">

        <Link href="/"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-4 transition-colors">
          ← 홈으로
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-900">{label}</h1>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {stocks.length > 0 ? `${stocks.length}개 종목` : "준비 중"}
          </span>
        </div>

        <CategoryTable stocks={stocks} categoryLabel={label} />
      </div>
    </main>
  );
}
