// lib/metrics.ts

// -------- Types --------
export type Code = 'LOYAL' | 'BROWSER' | 'SNIPER' | 'CHURN';

export type Customer = {
  id?: string;
  name?: string;
  region?: string;
  age_group?: string;
  month?: string | number;

  visit_days: number;
  avg_duration_min: number;

  retained_june_august?: boolean;
  retained_90?: boolean;

  payment_amount?: number; // chiffre d’affaires individuel (optionnel)
};

export type Thresholds = {
  visit_days: number;
  avg_duration_min: number;
};

export type ClassifyResult = {
  code: Code;
  label: string;
  desc: string;
};

export type KPI = {
  total: number;        // nb de clients
  avgVisit: number;     // moyenne visit_days
  avgDuration: number;  // moyenne durée (min)
  repurch: number;      // % retenus (0–100)
  revenue?: number;     // CA total si payment_amount présent
  arpu?: number;        // CA moyen par client
};

// -------- Helpers internes --------
const toNum = (v: unknown, fallback = 0) =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;

const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);

const safeAvg = (nums: number[]) =>
  nums.length ? sum(nums) / nums.length : 0;

const keyOf = (v: unknown) =>
  v === undefined || v === null || v === '' ? 'UNKNOWN' : String(v);

const round = (n: number, d = 2) =>
  Number.isFinite(n) ? Number(n.toFixed(d)) : 0;

const median = (arr: number[]) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const mad = (arr: number[]) => {
  if (!arr.length) return 1;
  const m = median(arr);
  const dev = arr.map((x) => Math.abs(x - m));
  // renvoie au moins 1 pour éviter division par zéro
  return Math.max(median(dev), 1);
};

// -------- groupBy (clé ou fonction de prédicat) --------
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number | undefined | null)
): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of arr ?? []) {
    const raw =
      typeof key === 'function' ? key(item) : (item as any)[key];
    const k = keyOf(raw);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}

// -------- thresholdsFromData (moyenne) --------
// Simple et compatible : moyenne, avec garde pour tableaux vides.
export function thresholdsFromData(data: Customer[]): Thresholds {
  const visits = (data ?? []).map((c) => toNum(c.visit_days));
  const durs = (data ?? []).map((c) => toNum(c.avg_duration_min));
  return {
    visit_days: safeAvg(visits),
    avg_duration_min: safeAvg(durs),
  };
}

// -------- robustThresholdsFromData (médiane) --------
// Plus robuste aux valeurs extrêmes (outliers).
export function robustThresholdsFromData(data: Customer[]): Thresholds {
  const visits = (data ?? []).map((c) => toNum(c.visit_days));
  const durs = (data ?? []).map((c) => toNum(c.avg_duration_min));
  return {
    visit_days: median(visits),
    avg_duration_min: median(durs),
  };
}

// -------- classify (version moyenne – rétrocompat) --------
export function classify(customer: Customer, thresholds: Thresholds): ClassifyResult {
  const v = toNum(customer.visit_days);
  const d = toNum(customer.avg_duration_min);
  const tv = toNum(thresholds.visit_days);
  const td = toNum(thresholds.avg_duration_min);

  if (v > tv && d > td) {
    return { code: 'LOYAL',  label: '충성형', desc: '자주 방문하고 체류시간이 긴 고객' };
  } else if (d > td) {
    return { code: 'BROWSER', label: '눈팅형', desc: '많이 보지만 덜 구매하는 고객' };
  } else if (v > tv) {
    return { code: 'SNIPER', label: '기습형', desc: '가끔 방문하지만 확실히 구매하는 고객' };
  } else {
    return { code: 'CHURN',  label: '이탈형', desc: '방문도 적고 체류시간도 짧은 고객' };
  }
}

// -------- classifyRobust (médiane + MAD, avec raisonnement) --------
export function classifyRobust(customer: Customer, cohort: Customer[]): ClassifyResult & {
  why: string;
  scores: { attendanceZ: number; repurchaseZ?: number };
} {
  const vd = (cohort ?? []).map((x) => toNum(x.visit_days));
  const dur = (cohort ?? []).map((x) => toNum(x.avg_duration_min));

  const vZ = (toNum(customer.visit_days) - median(vd)) / mad(vd);
  const dZ = (toNum(customer.avg_duration_min) - median(dur)) / mad(dur);

  // score de présence = moyenne des z-scores de visite et durée
  const attendanceZ = (vZ + dZ) / 2;

  // Rachat récent (si dispo) -> boost implicite
  const repurchaseFlag = customer.retained_90 || customer.retained_june_august;
  const repurchaseZ = repurchaseFlag ? 0.5 : -0.25; // heuristique douce

  const attendanceHigh = attendanceZ >= 0;
  const repHigh = repurchaseZ >= 0;

  let res: ClassifyResult;
  if (attendanceHigh && repHigh) {
    res = { code: 'LOYAL',  label: '충성형', desc: '자주 방문 + 재구매 가능성 높음' };
  } else if (attendanceHigh && !repHigh) {
    res = { code: 'BROWSER', label: '눈팅형', desc: '체류/방문은 높지만 재구매 신호는 약함' };
  } else if (!attendanceHigh && repHigh) {
    res = { code: 'SNIPER', label: '기습형', desc: '방문 빈도는 낮지만 구매 전환이 있음' };
  } else {
    res = { code: 'CHURN',  label: '이탈형', desc: '방문/체류 및 재구매 신호 모두 약함' };
  }

  const why =
    `attendanceZ=${round(attendanceZ, 2)} ` +
    `(visitZ=${round(vZ, 2)}, durZ=${round(dZ, 2)}), ` +
    `repurchaseBias=${round(repurchaseZ, 2)}`;

  return { ...res, why, scores: { attendanceZ, repurchaseZ } };
}

// -------- KPIs de haut niveau --------
export function kpis(customers: Customer[]): KPI {
  const total = customers?.length ?? 0;
  if (!total) return { total: 0, avgVisit: 0, avgDuration: 0, repurch: 0, revenue: 0, arpu: 0 };

  const visits = customers.map((c) => toNum(c.visit_days));
  const durs = customers.map((c) => toNum(c.avg_duration_min));
  const retained = customers.filter((c) => !!c.retained_90 || !!c.retained_june_august).length;

  const revenueVals = customers.map((c) => toNum(c.payment_amount, 0));
  const revenue = sum(revenueVals);
  const arpu = total ? revenue / total : 0;

  return {
    total,
    avgVisit: round(safeAvg(visits), 2),
    avgDuration: round(safeAvg(durs), 2),
    repurch: round((retained * 100) / total, 1),
    revenue: round(revenue, 2),
    arpu: round(arpu, 2),
  };
}

// -------- Estimation simple d’ETA de rachat --------
// Heuristique basique : ajuste à ta logique métier si besoin.
export function nextRepurchaseEtaDays(c: Customer, th?: Thresholds): number {
  // Fidélité récente -> retour rapide
  if (c.retained_90) return 14;
  if (c.retained_june_august) return 21;

  const tv = toNum(th?.visit_days ?? 0);
  const td = toNum(th?.avg_duration_min ?? 0);
  const v = toNum(c.visit_days);
  const d = toNum(c.avg_duration_min);

  if (v > tv && d > td) return 21; // loyal
  if (d > td) return 28;           // browser
  if (v > tv) return 35;           // sniper
  return 45;                       // churn-ish
}
