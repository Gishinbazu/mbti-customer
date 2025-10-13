// lib/classifier.ts
export type Code = 'LOYAL' | 'BROWSER' | 'SNIPER' | 'CHURN';
export type ClassifyResult = { code: Code; label: string; desc: string };

export type CustomerLike = {
  visit_days: number;
  avg_duration_min: number;
  retained_june_august?: boolean;
  retained_90?: boolean;
};

export type Thresholds = {
  presence_med: number; // médiane de présence (jours + heures)
  repurchase_cut: number; // seuil de repurchase (0..1)
};

// -------- utils
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const median = (arr: number[]) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const presenceScore = (c: CustomerLike) =>
  (Number(c.visit_days) || 0) + (Number(c.avg_duration_min) || 0) / 60;

const repurchaseScore = (c: CustomerLike) => {
  const a = c.retained_june_august ? 1 : 0;
  const b = c.retained_90 ? 1 : 0;
  // moyenne simple de 2 flags; si un seul flag existe on prend sa valeur
  const n = [a, b].filter((x) => x === 0 || x === 1).length || 1;
  return (a + b) / n;
};

// -------- thresholds à partir de la data
export function thresholdsFromData(data: CustomerLike[]): Thresholds {
  const presences = data.map(presenceScore).filter((x) => Number.isFinite(x));
  const presence_med = median(presences.length ? presences : [4, 8, 12]); // fallback
  // coupe repurchase à 0.5 par défaut (majorité)
  const repurchase_cut = 0.5;
  return { presence_med, repurchase_cut };
}

// -------- classification
export function classify(c: CustomerLike, th: Thresholds): ClassifyResult {
  const pHigh = presenceScore(c) >= th.presence_med;
  const rHigh = repurchaseScore(c) >= th.repurchase_cut;

  if (pHigh && rHigh)
    return {
      code: 'LOYAL',
      label: '충성형',
      desc: '꾸준히 방문하고 재구매가 높은 찐팬 고객',
    };
  if (pHigh && !rHigh)
    return {
      code: 'BROWSER',
      label: '눈팅형',
      desc: '방문은 많지만 구매 전환이 낮음 — 장바구니/첫구매 유도 필요',
    };
  if (!pHigh && rHigh)
    return {
      code: 'SNIPER',
      label: '기습형',
      desc: '가끔 오지만 구매로 이어지는 효율형 — 리마인더/번들 제안',
    };
  return {
    code: 'CHURN',
    label: '이탈형',
    desc: '방문·구매 모두 낮음 — 복귀 쿠폰/관심사 맞춤 콘텐츠',
  };
}

// -------- ETA (heuristique simple et stable)
export function nextRepurchaseEtaDays(c: CustomerLike): number {
  // base 90 jours, modulé par présence et flags récents
  let eta = 90;

  const pres = presenceScore(c);   // typiquement 0..~20
  const boost = clamp(pres / 12, 0, 1); // 0..1
  // plus la présence est haute, plus on avance la date (réduction d’ETA)
  eta = eta * (1 - 0.45 * boost); // jusqu’à -45%

  if (c.retained_90) eta *= 0.75; // récent achat → plus tôt
  if (c.retained_june_august) eta *= 0.9;

  // bornes raisonnables
  return Math.round(clamp(eta, 7, 120));
}
