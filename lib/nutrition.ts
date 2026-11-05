export const ACTIVITIES = [
  { value: 'SEDENTARY', label: 'Hareketsiz', detail: 'Masa başı, egzersiz yok', factor: 1.2 },
  { value: 'LIGHT', label: 'Hafif aktif', detail: 'Haftada 1-3 gün', factor: 1.375 },
  { value: 'MODERATE', label: 'Orta aktif', detail: 'Haftada 3-5 gün', factor: 1.55 },
  { value: 'ACTIVE', label: 'Aktif', detail: 'Haftada 6-7 gün', factor: 1.725 },
  { value: 'VERY_ACTIVE', label: 'Çok aktif', detail: 'Ağır iş veya günde iki antrenman', factor: 1.9 },
] as const;

export const WEIGHT_GOALS = [
  { value: 'LOSE', label: 'Kilo ver', adjust: -400 },
  { value: 'MAINTAIN', label: 'Koru', adjust: 0 },
  { value: 'GAIN', label: 'Kilo al', adjust: 300 },
] as const;

const SPLITS = {
  LOSE: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  MAINTAIN: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  GAIN: { protein: 0.2, carbs: 0.5, fat: 0.3 },
} as const;

export type BodyInput = {
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  gender?: string | null;
  activityLevel?: string | null;
  weightGoal?: string | null;
};

export function mifflinBmr(input: BodyInput) {
  const { weight, height, age, gender } = input;
  if (!weight || !height || !age || !gender) return null;
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'MALE') return base + 5;
  if (gender === 'FEMALE') return base - 161;
  return base - 78;
}

export function caloriePlan(input: BodyInput) {
  const bmr = mifflinBmr(input);
  const activity = ACTIVITIES.find((item) => item.value === input.activityLevel);
  const goal = WEIGHT_GOALS.find((item) => item.value === input.weightGoal);
  if (bmr == null || !activity || !goal) return null;

  const tdee = bmr * activity.factor;
  const calories = Math.max(1200, Math.round(tdee + goal.adjust));
  const split = SPLITS[goal.value];
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    protein: Math.round((calories * split.protein) / 4),
    carbs: Math.round((calories * split.carbs) / 4),
    fat: Math.round((calories * split.fat) / 9),
    split,
  };
}
