'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { shiftDate, startOfDay, todayInputValue } from '@/lib/text';

export type StatEntry = {
  date: string;
  foodId: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const COLORS = ['var(--macro-protein)', 'var(--macro-carb)', 'var(--macro-fat)'];

export default function StatsView({
  entries,
  calorieGoal,
}: {
  entries: StatEntry[];
  calorieGoal: number;
}) {
  const [days, setDays] = useState<7 | 30>(7);
  const today = todayInputValue();

  const series = useMemo(() => {
    const start = shiftDate(today, -(days - 1));
    const byDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();
    for (let i = 0; i < days; i += 1) {
      byDay.set(shiftDate(start, i), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
    for (const entry of entries) {
      const bucket = byDay.get(entry.date);
      if (!bucket) continue;
      bucket.calories += entry.calories;
      bucket.protein += entry.protein;
      bucket.carbs += entry.carbs;
      bucket.fat += entry.fat;
    }
    return [...byDay.entries()].map(([date, totals]) => ({
      date,
      label: startOfDay(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: totals.carbs,
      fat: totals.fat,
    }));
  }, [days, entries, today]);

  const logged = series.filter((day) => day.calories > 0);
  const avgCalories = series.reduce((sum, day) => sum + day.calories, 0) / series.length;
  const avgProtein = series.reduce((sum, day) => sum + day.protein, 0) / series.length;
  const hitDays = series.filter(
    (day) => day.calories > 0 && day.calories >= calorieGoal * 0.9 && day.calories <= calorieGoal * 1.1
  ).length;

  const foods = useMemo(() => {
    const start = shiftDate(today, -(days - 1));
    const map = new Map<string, { id: string; name: string; grams: number; count: number; calories: number }>();
    for (const entry of entries) {
      if (entry.date < start || entry.date > today) continue;
      const current = map.get(entry.foodId) || { id: entry.foodId, name: entry.name, grams: 0, count: 0, calories: 0 };
      current.grams += entry.grams;
      current.count += 1;
      current.calories += entry.calories;
      map.set(entry.foodId, current);
    }
    return [...map.values()].sort((a, b) => b.grams - a.grams).slice(0, 10);
  }, [days, entries, today]);

  const macroKcal = series.reduce(
    (acc, day) => {
      acc.protein += day.protein * 4;
      acc.carbs += day.carbs * 4;
      acc.fat += day.fat * 9;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );
  const pie = [
    { name: 'Protein', kcal: Math.round(macroKcal.protein) },
    { name: 'Karbonhidrat', kcal: Math.round(macroKcal.carbs) },
    { name: 'Yağ', kcal: Math.round(macroKcal.fat) },
  ].filter((item) => item.kcal > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-card bg-surface p-1 shadow-soft">
        {([7, 30] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setDays(value)}
            className={`h-11 rounded-control text-sm font-semibold ${days === value ? 'bg-primary-fill text-on-primary' : 'text-muted'}`}
          >
            Son {value} gün
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
        <div className="rounded-card bg-surface p-4 text-center shadow-soft">
          <div className="text-xs text-muted">Ort. kalori</div>
          <div className="font-display text-h2">{Math.round(avgCalories)}</div>
        </div>
        <div className="rounded-card bg-surface p-4 text-center shadow-soft">
          <div className="text-xs text-muted">Ort. protein</div>
          <div className="font-display text-h2">{avgProtein.toFixed(0)} g</div>
        </div>
        <div className="rounded-card bg-surface p-4 text-center shadow-soft">
          <div className="text-xs text-muted">Hedef tutan</div>
          <div className="font-display text-h2">{hitDays}/{days}</div>
        </div>
      </section>
      <p className="px-1 text-xs text-muted">
        Hedef tutan gün: kalori, {calorieGoal} kcal hedefin %90 ile %110 arasında. Ortalama, kayıtsız günleri de 0 sayar.
      </p>

      {logged.length === 0 ? (
        <EmptyState
          mark="chart"
          title="Bu aralıkta öğün yok"
          text="Günlükten bir besin ekleyince ortalama, grafik ve en çok yediklerin burada görünür."
          action={<Link href="/foods" className={buttonClass()}>Besin ekle</Link>}
        />
      ) : (
        <>
      <section className="min-w-0 rounded-card bg-surface p-4 shadow-soft sm:p-5">
        <h2 className="mb-3 font-display text-h3">Kalori ve protein</h2>
        <div className="h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} interval={days === 30 ? 4 : 0} axisLine={false} tickLine={false} />
              <YAxis yAxisId="cal" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} width={36} axisLine={false} tickLine={false} />
              <YAxis yAxisId="pro" orientation="right" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} width={28} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 12, color: 'var(--color-ink)' }}
              />
              <Legend />
              <Line yAxisId="cal" type="monotone" dataKey="calories" name="Kalori" stroke="var(--macro-kcal)" strokeWidth={2} dot={days === 7} />
              <Line yAxisId="pro" type="monotone" dataKey="protein" name="Protein (g)" stroke="var(--macro-protein)" strokeWidth={2} dot={days === 7} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-card bg-surface p-5 shadow-soft">
        <h2 className="mb-3 font-display text-h3">Makro dağılımı</h2>
        {pie.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Makro için öğün gerekli</p>
        ) : (
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="kcal" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                  {pie.map((item, index) => (
                    <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} kcal`, '']}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 12, color: 'var(--color-ink)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-card bg-surface shadow-soft">
        <h2 className="border-b border-line px-5 py-4 font-display text-h3">En çok yenen 10 besin</h2>
        {foods.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">Liste için öğün gerekli</p>
        ) : (
          <ol>
            {foods.map((food, index) => (
              <li key={food.id} className="flex items-center justify-between border-t border-line px-5 py-3 first:border-t-0">
                <div>
                  <div className="font-medium">{index + 1}. {food.name}</div>
                  <div className="text-xs text-muted">{food.count} kez</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold">{Math.round(food.grams)} g</div>
                  <div className="text-xs text-muted">{Math.round(food.calories)} kcal</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
        </>
      )}
    </div>
  );
}
