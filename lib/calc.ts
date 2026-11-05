export type Per100g = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function calculateNutrients(grams: number, per100g: Per100g) {
  const factor = Number.isFinite(grams) && grams > 0 ? grams / 100 : 0;
  const round1 = (value: number) => Math.round(value * factor * 10) / 10;
  return {
    calories: Math.round(per100g.calories * factor),
    protein: round1(per100g.protein),
    carbs: round1(per100g.carbs),
    fat: round1(per100g.fat),
  };
}

export function sumDay(items: { grams: number; per100g: Per100g }[]) {
  return items.reduce(
    (total, item) => {
      const factor = item.grams > 0 ? item.grams / 100 : 0;
      total.calories += item.per100g.calories * factor;
      total.protein += item.per100g.protein * factor;
      total.carbs += item.per100g.carbs * factor;
      total.fat += item.per100g.fat * factor;
      return total;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
