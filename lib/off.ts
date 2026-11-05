const OFF_HEADERS = {
  'User-Agent': 'KaloriTakip/1.0 (student nutrition tracker)',
  Accept: 'application/json',
};

export type OffProduct = {
  code: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  sugarPer100g: number | null;
};

type OffNutriments = Record<string, number | undefined>;

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapOffProduct(raw: {
  code?: string;
  product_name?: string;
  product_name_tr?: string;
  brands?: string;
  nutriments?: OffNutriments;
}): OffProduct | null {
  const nutriments = raw.nutriments || {};
  const calories = num(nutriments['energy-kcal_100g']);
  const name = (raw.product_name_tr || raw.product_name || '').trim();
  const code = String(raw.code || '').replace(/\D/g, '');
  if (!name || !code || calories == null || calories < 0 || calories > 2000) return null;
  return {
    code,
    name: name.slice(0, 120),
    brand: raw.brands?.split(',')[0]?.trim().slice(0, 60) || null,
    caloriesPer100g: calories,
    proteinPer100g: Math.min(100, Math.max(0, num(nutriments.proteins_100g) ?? 0)),
    carbsPer100g: Math.min(100, Math.max(0, num(nutriments.carbohydrates_100g) ?? 0)),
    fatPer100g: Math.min(100, Math.max(0, num(nutriments.fat_100g) ?? 0)),
    fiberPer100g: num(nutriments.fiber_100g),
    sugarPer100g: num(nutriments.sugars_100g),
  };
}

async function offGet(url: string) {
  const response = await fetch(url, { headers: OFF_HEADERS, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return response.json();
}

export async function searchOffByName(query: string) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&lc=tr&fields=code,product_name,product_name_tr,brands,nutriments`;
  const data = await offGet(url);
  const products = Array.isArray(data?.products) ? data.products : [];
  return products.map(mapOffProduct).filter(Boolean) as OffProduct[];
}

export async function searchOffByBarcode(code: string) {
  const data = await offGet(
    `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=code,product_name,product_name_tr,brands,nutriments`
  );
  if (!data || data.status !== 1) return null;
  return mapOffProduct({ ...data.product, code: data.code || data.product?.code || code });
}
