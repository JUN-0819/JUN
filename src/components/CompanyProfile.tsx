"use client";

import { useState, useEffect } from "react";

interface ProfileData {
  description: string | null;
  mainBusiness: string | null;
  industry: string | null;
  sector: string | null;
  sectorKo: string | null;
  website: string | null;
  employees: number | null;
  country: string | null;
  city: string | null;
}

export default function CompanyProfile({ ticker }: { ticker: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${encodeURIComponent(ticker)}`)
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🏢</span>
          <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  if (!profile?.description && !profile?.mainBusiness) return null;

  const desc = profile.description ?? "";
  const LIMIT = 350;
  const isLong = desc.length > LIMIT;
  const displayDesc = expanded || !isLong ? desc : desc.slice(0, LIMIT) + "…";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="text-lg">🏢</span>
        <h3 className="font-semibold text-gray-900">기업 정보</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* 칩 */}
        <div className="flex flex-wrap gap-2">
          {profile.sectorKo && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
              📊 {profile.sectorKo}
            </span>
          )}
          {profile.industry && (
            <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1 rounded-full">
              🔧 {profile.industry}
            </span>
          )}
          {profile.employees && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
              👥 임직원 {profile.employees.toLocaleString()}명
            </span>
          )}
          {profile.country && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              🌏 {profile.city ? `${profile.city}, ` : ""}{profile.country}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              🔗 공식 웹사이트
            </a>
          )}
        </div>

        {/* 주요사업 */}
        {profile.mainBusiness && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">주요사업</p>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              {profile.mainBusiness}
            </p>
          </div>
        )}

        {/* 회사 소개 전문 */}
        {desc && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">회사 소개</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {displayDesc}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-blue-500 hover:text-blue-600 text-xs font-medium transition-colors"
              >
                {expanded ? "접기 ▲" : "전체 보기 ▼"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
