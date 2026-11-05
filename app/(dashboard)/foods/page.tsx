'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { todayInputValue } from '@/lib/text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

type Portion = { id: string; label: string; grams: number };
type Food = {
  id: string;
  name: string;
  category: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  isCustom?: boolean;
  barcode?: string | null;
  portions: Portion[];
};

const MEALS = [
  { value: 'BREAKFAST', label: 'Kahvaltı' },
  { value: 'LUNCH', label: 'Öğle' },
  { value: 'DINNER', label: 'Akşam' },
  { value: 'SNACK', label: 'Atıştırmalık' },
];

function scaled(per100: number, grams: number) {
  if (!Number.isFinite(grams) || grams <= 0) return 0;
  return (per100 / 100) * grams;
}

export default function FoodsPage() {
  return (
    <Suspense>
      <FoodsScreen />
    </Suspense>
  );
}

function FoodsScreen() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const presetDate = params.get('date');
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState('100');
  const [portionId, setPortionId] = useState('');
  const [mealType, setMealType] = useState('BREAKFAST');
  const [date, setDate] = useState(presetDate && /^\d{4}-\d{2}-\d{2}$/.test(presetDate) ? presetDate : todayInputValue());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 1) {
        setFoods([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/foods?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const gramsNumber = Number(grams);
  const totals = useMemo(() => {
    if (!selected) return null;
    return {
      calories: scaled(selected.caloriesPer100g, gramsNumber),
      protein: scaled(selected.proteinPer100g, gramsNumber),
      carbs: scaled(selected.carbsPer100g, gramsNumber),
      fat: scaled(selected.fatPer100g, gramsNumber),
    };
  }, [selected, gramsNumber]);

  function openFood(food: Food) {
    setSelected(food);
    setPortionId('');
    setGrams('100');
    setError('');
  }

  function pickPortion(portion: Portion) {
    setPortionId(portion.id);
    setGrams(String(portion.grams));
  }

  async function saveLog() {
    if (!selected) return;
    setError('');
    setSaving(true);
    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        foodId: selected.id,
        grams: gramsNumber,
        mealType,
        date,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    router.push(`/log?date=${date}`);
    router.refresh();
    toast(`${selected.name} eklendi`);
  }

  async function createCustom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError('');
    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        caloriesPer100g: form.get('calories'),
        proteinPer100g: form.get('protein'),
        carbsPer100g: form.get('carbs'),
        fatPer100g: form.get('fat'),
        portionLabel: form.get('portionLabel'),
        portionGrams: form.get('portionGrams'),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Besin eklenemedi');
      return;
    }
    setFoods((current) => [data, ...current.filter((item) => item.id !== data.id)]);
    setShowCustom(false);
    openFood(data);
  }

  const noResults = query.trim().length > 0 && !loading && foods.length === 0;

  return (
    <div>
      <Field
        id="food-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="yoğurt, yogurt, ekmek..."
        autoFocus
        icon={<Search size={18} />}
        aria-label="Besin ara"
      />
      <p className="mt-2 text-xs text-muted">Türkçe karakter gerekmez. yogurt, yoğurt yazar.</p>

      <div className="mt-4 space-y-2">
        {loading && (
          <div className="space-y-2" aria-hidden="true">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
          {foods.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => openFood(food)}
              className="flex w-full min-w-0 items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{food.name}</span>
                <span className="text-sm text-muted">
                  Protein {food.proteinPer100g} g / 100 g
                  {food.isCustom ? ' · özel' : ''}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-semibold text-success-text">{food.caloriesPer100g}</span>
                <span className="text-xs text-muted">kcal / 100 g</span>
              </span>
            </button>
          ))}
          {noResults && (
            <EmptyState
              mark="search"
              title={`“${query.trim()}” bulunamadı`}
              text="Listede yoksa kendi besinini ekleyebilirsin. Sadece sen görürsün."
              action={<Button type="button" onClick={() => setShowCustom(true)}>Kendi besinini ekle</Button>}
            />
          )}
        </div>

        {showCustom && (
          <form onSubmit={createCustom} className="mt-4 space-y-3 rounded-card border border-line bg-surface p-4">
            <h2 className="font-semibold">Özel besin</h2>
            <p className="text-xs text-muted">Değerler 100 gram içindir. Sadece sen görürsün.</p>
            <input name="name" required placeholder="Besin adı" aria-label="Besin adı" className="h-11 w-full rounded-control border border-line bg-surface px-3" />
            <div className="grid grid-cols-2 gap-2">
              <input name="calories" required type="number" min="0" step="0.1" placeholder="Kalori" aria-label="Kalori" className="h-11 rounded-control border border-line bg-surface px-3" />
              <input name="protein" required type="number" min="0" step="0.1" placeholder="Protein" aria-label="Protein" className="h-11 rounded-control border border-line bg-surface px-3" />
              <input name="carbs" required type="number" min="0" step="0.1" placeholder="Karbonhidrat" aria-label="Karbonhidrat" className="h-11 rounded-control border border-line bg-surface px-3" />
              <input name="fat" required type="number" min="0" step="0.1" placeholder="Yağ" aria-label="Yağ" className="h-11 rounded-control border border-line bg-surface px-3" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input name="portionLabel" placeholder="Porsiyon, örn. 1 dilim" aria-label="Porsiyon adı" className="h-11 rounded-control border border-line bg-surface px-3" />
              <input name="portionGrams" type="number" min="1" step="1" placeholder="Gram" aria-label="Porsiyon gramı" className="h-11 rounded-control border border-line bg-surface px-3" />
            </div>
            {error && <p className="text-sm text-danger-text">{error}</p>}
            <Button className="w-full">Besini kaydet</Button>
          </form>
        )}

      <Sheet open={Boolean(selected && totals)} title={selected?.name || 'Besin'} onClose={() => setSelected(null)}>
        {selected && totals && (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-h3">{selected.name}</h2>
                <p className="text-sm text-muted">{selected.caloriesPer100g} kcal · {selected.proteinPer100g} g protein / 100 g</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setSelected(null)}>Kapat</Button>
            </div>

            <Field
              id="grams"
              label="Gram"
              type="number"
              min="1"
              step="1"
              value={grams}
              onChange={(e) => {
                setGrams(e.target.value);
                setPortionId('');
              }}
            />

            {selected.portions.length > 0 && (
              <div className="mb-4 mt-3 flex flex-wrap gap-2">
                {selected.portions.map((portion) => (
                  <Button
                    key={portion.id}
                    type="button"
                    variant={portionId === portion.id ? 'primary' : 'secondary'}
                    onClick={() => pickPortion(portion)}
                  >
                    {portion.label} · {portion.grams} g
                  </Button>
                ))}
              </div>
            )}

            <div className="mb-4 mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ['Kalori', Math.round(totals.calories), 'kcal', 'text-muted'],
                ['Protein', totals.protein.toFixed(1), 'g', 'text-muted'],
                ['Karb', totals.carbs.toFixed(1), 'g', 'text-muted'],
                ['Yağ', totals.fat.toFixed(1), 'g', 'text-muted'],
              ].map(([label, value, unit, color]) => (
                <div key={label} className="rounded-control bg-bg px-1 py-2">
                  <div className={`text-[11px] ${color}`}>{label}</div>
                  <div className="font-semibold">{value}</div>
                  <div className="text-[11px] text-muted">{unit}</div>
                </div>
              ))}
            </div>

            <p className="mb-1 text-sm text-muted">Öğün</p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {MEALS.map((meal) => (
                <Button
                  key={meal.value}
                  type="button"
                  variant={mealType === meal.value ? 'primary' : 'secondary'}
                  onClick={() => setMealType(meal.value)}
                >
                  {meal.label}
                </Button>
              ))}
            </div>

            <div className="mb-4">
              <Field id="log-date" label="Tarih" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {error && <p className="mb-3 text-sm text-danger-text">{error}</p>}
            <Button type="button" className="w-full" onClick={saveLog} disabled={!(gramsNumber > 0)} loading={saving}>
              {saving ? 'Kaydediliyor' : 'Kaydet'}
            </Button>
          </>
        )}
      </Sheet>
    </div>
  );
}
