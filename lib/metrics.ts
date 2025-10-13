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

const safeAvg = (nums: number[]) =>
  nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;

const keyOf = (v: unknown) =>
  v === undefined || v === null || v === '' ? 'UNKNOWN' : String(v);

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

// -------- thresholdsFromData --------
// Simple mais robuste : moyenne avec garde pour tableaux vides.
export function thresholdsFromData(data: Customer[]): Thresholds {
  const visits = (data ?? []).map((c) => toNum(c.visit_days));
  const durs = (data ?? []).map((c) => toNum(c.avg_duration_min));
  return {
    visit_days: safeAvg(visits),
    avg_duration_min: safeAvg(durs),
  };
}

// -------- classify --------
export function classify(customer: Customer, thresholds: Thresholds): ClassifyResult {
  const v = toNum(customer.visit_days);
  const d = toNum(customer.avg_duration_min);
  const tv = toNum(thresholds.visit_days);
  const td = toNum(thresholds.avg_duration_min);

  if (v > tv && d > td) {
    return { code: 'LOYAL',  label: '충성형', desc: '자주 방문하고 체류시간이 긴 고객' };
  } else if (d > td) {
    return { code: 'BROWSER', label: '눈팅형', desc: '자주 보지만 덜 구매하는 고객' };
  } else if (v > tv) {
    return { code: 'SNIPER', label: '기습형', desc: '가끔 방문하지만 확실히 구매하는 고객' };
  } else {
    return { code: 'CHURN',  label: '이탈형', desc: '방문도 적고 체류시간도 짧은 고객' };
  }
}

// -------- KPIs de haut niveau --------
export function kpis(customers: Customer[]): KPI {
  const total = customers?.length ?? 0;
  if (!total) return { total: 0, avgVisit: 0, avgDuration: 0, repurch: 0, revenue: 0, arpu: 0 };

  const visits = customers.map((c) => toNum(c.visit_days));
  const durs = customers.map((c) => toNum(c.avg_duration_min));
  const retained = customers.filter((c) => !!c.retained_90 || !!c.retained_june_august).length;

  const revenueVals = customers.map((c) => toNum(c.payment_amount, 0));
  const revenue = revenueVals.reduce((s, n) => s + n, 0);
  const arpu = revenue / total;

  return {
    total,
    avgVisit: safeAvg(visits),
    avgDuration: safeAvg(durs),
    repurch: (retained * 100) / total,
    revenue,
    arpu,
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
