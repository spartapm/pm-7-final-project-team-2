export const ITEM_META: Record<string, { linkNote?: string; deleteRate?: number }> = {
  passport: {
    linkNote: "출국일 기준 유효기간이 6개월 이상 남아 있어야 하는 나라가 많아요.",
  },
  ticket: {
    linkNote: "모바일 탑승권은 항공사 앱에서 출발 전 미리 발급해 두세요.",
  },
  esim: {
    linkNote: "현지 공항에서 개통하거나, 출발 전 QR로 설치할 수 있어요.",
  },
  insurance: {
    linkNote: "보험사 앱이나 이메일에서 증서를 미리 받아 두세요.",
  },
  strap: { deleteRate: 0.76 },
  cleaner: { deleteRate: 0.72 },
  multitool: { deleteRate: 0.81 },
  drybag: { deleteRate: 0.73 },
  salt: { deleteRate: 0.88 },
  pole: { deleteRate: 0.71 },
  tee: { deleteRate: 0.92 },
  rash: { deleteRate: 0.82 },
  goggle: { deleteRate: 0.74 },
  inner: { deleteRate: 0.77 },
  makeup: { deleteRate: 0.85 },
  tattoo: { deleteRate: 0.91 },
  goggle_w: { deleteRate: 0.73 },
  rainponcho: { deleteRate: 0.93 },
  fold: { deleteRate: 0.79 },
  light: { deleteRate: 0.71 },
  cash_t: { deleteRate: 0.75 },
};

export function overpackCopy(rate?: number) {
  if (rate == null || rate < 0.7) return null;
  if (rate < 0.8) return "10명 중 3명이 챙겼어요";
  if (rate < 0.9) return "10명 중 2명이 챙겼어요";
  return "10명 중 1명이 챙겼어요";
}
