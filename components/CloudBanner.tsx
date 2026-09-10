"use client";

import { useState } from "react";
import { CATALOG_SQL } from "@/lib/catalogSchema";
import { useStore } from "@/lib/store";

export function CloudBanner() {
  const { cloudStatus } = useStore();
  const [copied, setCopied] = useState(false);
  if (cloudStatus !== "missing-table") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 393,
        zIndex: 60,
        background: "#1F3D88",
        color: "#fff",
        padding: "12px 16px",
        fontSize: 12,
        lineHeight: "16px",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Supabase 테이블이 아직 없습니다</div>
      <div style={{ opacity: 0.9, marginBottom: 8 }}>
        <a
          href="https://supabase.com/dashboard/project/vsvlniwtfnjhqonsbldc/sql/new"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          SQL Editor 열기
        </a>
        에 SQL을 붙여넣고 Run 한 번이면 일정 공유와 아이템 어드민이 동작합니다.
      </div>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(CATALOG_SQL).catch(() => undefined);
          setCopied(true);
        }}
        style={{
          border: "none",
          background: "#368FFF",
          color: "#fff",
          height: 32,
          padding: "0 12px",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {copied ? "복사됨" : "SQL 복사"}
      </button>
    </div>
  );
}
