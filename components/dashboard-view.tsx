'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, buttonClass } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Bar, BarChart, Cell, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { shiftDate, startOfDay, todayInputValue } from '@/lib/text';

type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

export type DashEntry = {
  id: string;
  mealType: string;
  grams: number;
  food: Food;
};

type Goals = { calories: number; protein: number; carbs: number; fat: number };

const MEALS = [
  { type: 'BREAKFAST', label: 'Kahvaltı' },
  { type: 'LUNCH', label: 'Öğle' },
  { type: 'DINNER', label: 'Akşam' },
  { type: 'SNACK', label: 'Atıştırmalık' },
];

function nutrients(entry: DashEntry) {
  const factor = entry.grams / 100;
  return {
    calories: entry.food.caloriesPer100g * factor,
    protein: entry.food.proteinPer100g * factor,
    carbs: entry.food.carbsPer100g * factor,
    fat: entry.food.fatPer100g * factor,
  };
}

export default function DashboardView({
  initialDate,
  initialEntries,
  goals,
}: {
  initialDate: string;
  initialEntries: DashEntry[];
  goals: Goals;
}) {
  const [date, setDate] = useState(initialDate);
  const [entries, setEntries] = useState(initialEntries);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const item = nutrients(entry);
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  const caloriePercent = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;
  const ring = [{ name: 'kcal', value: Math.min(caloriePercent, 100), fill: caloriePercent > 100 ? 'var(--macro-kcal)' : 'var(--macro-protein)' }];
  const isToday = date === todayInputValue();
  const title = startOfDay(date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  async function loadDate(nextDate: string) {
    const previousDate = date;
    const previousEntries = entries;
    setDate(nextDate);
    setError('');
    window.history.replaceState(null, '', `/dashboard?date=${nextDate}`);
    const res = await fetch(`/api/log?date=${nextDate}`);
    if (!res.ok) {
      setDate(previousDate);
      setEntries(previousEntries);
      setError('Gün yüklenemedi');
      return;
    }
    const data = await res.json();
    setEntries(data.entries);
    setDrafts({});
  }

  async function saveGrams(entry: DashEntry) {
    const raw = drafts[entry.id];
    if (raw == null) return;
    const grams = Number(raw);
    if (!(grams > 0) || grams === entry.grams) {
      setDrafts((current) => {
        const next = { ...current };
        delete next[entry.id];
        return next;
      });
      return;
    }
    const previous = entries;
    setEntries((current) => current.map((item) => (item.id === entry.id ? { ...item, grams } : item)));
    const res = await fetch('/api/log', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, grams }),
    });
    if (!res.ok) {
      setEntries(previous);
      setError('Gram güncellenemedi');
      return;
    }
    setDrafts((current) => {
      const next = { ...current };
      delete next[entry.id];
      return next;
    });
  }

  async function remove(id: string) {
    const previous = entries;
    setEntries((current) => current.filter((item) => item.id !== id));
    const res = await fetch(`/api/log?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setEntries(previous);
      setError('Kayıt silinemedi');
    }
  }

  const bars = [
    { label: 'Protein', value: totals.protein, goal: goals.protein, fill: 'var(--macro-protein)' },
    { label: 'Karb', value: totals.carbs, goal: goals.carbs, fill: 'var(--macro-carb)' },
    { label: 'Yağ', value: totals.fat, goal: goals.fat, fill: 'var(--macro-fat)' },
  ].map((item) => ({
    ...item,
    percent: item.goal > 0 ? Math.min(100, (item.value / item.goal) * 100) : 0,
  }));

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-1 rounded-card border border-line bg-surface px-2 py-2">
          <button type="button" onClick={() => loadDate(shiftDate(date, -1))} className="h-11 w-11 shrink-0 rounded-control text-lg" aria-label="Önceki gün">
            ‹
          </button>
          <div className="min-w-0 text-center">
            <div className="truncate text-sm font-semibold capitalize sm:text-base">{title}</div>
            <button type="button" onClick={() => loadDate(todayInputValue())} className="inline-flex min-h-11 items-center text-sm font-medium text-success-text">
              {isToday ? 'Bugün' : 'Bugüne dön'}
            </button>
          </div>
          <button type="button" onClick={() => loadDate(shiftDate(date, 1))} className="h-11 w-11 shrink-0 rounded-control text-lg" aria-label="Sonraki gün">
            ›
          </button>
        </div>

        <section className="min-w-0 rounded-card border border-line bg-surface p-4 sm:p-5">
          <div className="relative mx-auto h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="72%" outerRadius="100%" data={ring} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: 'var(--color-line)' }} dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold">{Math.round(totals.calories)}</span>
              <span className="text-xs text-muted">/ {goals.calories} kcal</span>
            </div>
          </div>
          <div className="h-28 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="label" width={92} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <Bar dataKey="percent" radius={8} barSize={12} background={{ fill: 'var(--color-line)' }}>
                  {bars.map((item) => (
                    <Cell key={item.label} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted">
            {bars.map((item) => (
              <div key={item.label}>{Math.round(item.value)} / {item.goal} g</div>
            ))}
          </div>
        </section>
        {error && <p className="rounded-control bg-bg px-3 py-2 text-sm text-danger-text" role="alert">{error}</p>}
      </div>

      <div className="mt-4 space-y-4 lg:mt-0">
        {entries.length === 0 ? (
          <EmptyState
            title={isToday ? 'Bugün henüz bir şey eklemedin' : 'Bu tarihte kayıt yok'}
            text="Bir besin ekleyince kalori ve makrolar burada toplanır."
            action={<Link href={`/foods?date=${date}`} className={buttonClass()}>Besin ekle</Link>}
          />
        ) : (
          MEALS.map((meal) => {
            const items = entries.filter((entry) => entry.mealType === meal.type);
            const mealCalories = items.reduce((sum, entry) => sum + nutrients(entry).calories, 0);
            return (
              <section key={meal.type} className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="flex items-center justify-between border-b bg-bg px-4 py-3">
                  <h2 className="text-sm font-semibold">{meal.label}</h2>
                  <span className="text-sm text-muted">{Math.round(mealCalories)} kcal</span>
                </div>
                {items.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">Bu öğünde kayıt yok</p>
                ) : (
                  <ul>
                    {items.map((entry) => {
                      const calories = Math.round(nutrients(entry).calories);
                      return (
                        <li key={entry.id} className="flex flex-col gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{entry.food.name}</div>
                            <div className="text-sm text-muted">{calories} kcal</div>
                          </div>
                          <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            aria-label={`${entry.food.name} gram`}
                            value={drafts[entry.id] ?? String(entry.grams)}
                            onChange={(event) => setDrafts((current) => ({ ...current, [entry.id]: event.target.value }))}
                            onBlur={() => saveGrams(entry)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
                            }}
                            className="h-11 w-20 rounded-control border border-line bg-surface px-2 text-right"
                          />
                          <span className="text-xs text-muted">g</span>
                          <Button type="button" variant="ghost" className="text-danger-text" onClick={() => remove(entry.id)}>
                            Sil
                          </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })
        )}

        {entries.length > 0 && (
          <Link href={`/foods?date=${date}`} className={buttonClass('primary', 'w-full')}>
            Besin ekle
          </Link>
        )}
      </div>
    </div>
  );
}
