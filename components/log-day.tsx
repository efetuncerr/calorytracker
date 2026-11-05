'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { useConfirm } from '@/components/ui/confirm-dialog';

const MEALS = [
  { type: 'BREAKFAST', label: 'Kahvaltı' },
  { type: 'LUNCH', label: 'Öğle' },
  { type: 'DINNER', label: 'Akşam' },
  { type: 'SNACK', label: 'Atıştırmalık' },
];

export type LogItem = {
  id: string;
  mealType: string;
  grams: number;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
};

export default function LogDay({ initialItems }: { initialItems: LogItem[] }) {
  const router = useRouter();
  const { askConfirm, dialog } = useConfirm();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('BREAKFAST');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function openEdit(item: LogItem) {
    setEditing(item.id);
    setGrams(String(item.grams));
    setMealType(item.mealType);
    setError('');
  }

  async function save(item: LogItem) {
    const nextGrams = Number(grams);
    if (!(nextGrams > 0)) {
      setError('Miktar 0’dan büyük olmalı');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch('/api/log', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, grams: nextGrams, mealType }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Kayıt güncellenemedi');
      return;
    }
    setItems((current) =>
      current.map((row) => (row.id === item.id ? { ...row, grams: nextGrams, mealType } : row))
    );
    setEditing(null);
    router.refresh();
  }

  async function remove(item: LogItem) {
    if (!(await askConfirm({ title: 'Kaydı sil', text: `${item.name} listeden çıkarılsın mı?`, confirmLabel: 'Sil' }))) return;
    const previous = items;
    setItems((current) => current.filter((row) => row.id !== item.id));
    const res = await fetch(`/api/log?id=${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setItems(previous);
      setError('Kayıt silinemedi');
      return;
    }
    if (editing === item.id) setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-control bg-bg px-3 py-2 text-sm text-danger-text" role="alert">{error}</p>}
      {dialog}
      {MEALS.map((meal) => {
        const rows = items.filter((item) => item.mealType === meal.type);
        return (
          <section key={meal.type} className="overflow-hidden rounded-card border border-line bg-surface">
            <h2 className="border-b border-line bg-bg px-4 py-3 text-sm font-semibold">{meal.label}</h2>
            {rows.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted">Henüz eklenmedi</p>
            ) : (
              <ul>
                {rows.map((item) => {
                  const calories = Math.round((item.caloriesPer100g * item.grams) / 100);
                  const protein = ((item.proteinPer100g * item.grams) / 100).toFixed(1);
                  const open = editing === item.id;
                  return (
                    <li key={item.id} className="border-t border-line px-4 py-3 first:border-t-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{item.name}</div>
                          <div className="text-sm text-muted">{item.grams} g · {protein} g protein</div>
                        </div>
                        <div className="font-semibold">{calories} kcal</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => openEdit(item)}>
                          Düzenle
                        </Button>
                        <Button type="button" variant="ghost" className="flex-1 text-danger-text" onClick={() => remove(item)}>
                          Sil
                        </Button>
                      </div>
                      {open && (
                        <div className="mt-3 space-y-3">
                          <Field
                            id={`grams-${item.id}`}
                            label="Gram"
                            type="number"
                            min="1"
                            step="1"
                            value={grams}
                            onChange={(event) => setGrams(event.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {MEALS.map((option) => (
                              <Button
                                key={option.type}
                                type="button"
                                variant={mealType === option.type ? 'primary' : 'secondary'}
                                onClick={() => setMealType(option.type)}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                          <Button type="button" className="w-full" loading={saving} onClick={() => save(item)}>
                            Kaydet
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
