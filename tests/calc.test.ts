import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateNutrients, sumDay } from '../lib/calc.ts';
import { caloriePlan, mifflinBmr } from '../lib/nutrition.ts';

const egg = { calories: 155, protein: 13, carbs: 1.1, fat: 11 };

describe('besin değeri', () => {
  it('100 gramda taban değeri döner', () => {
    assert.deepEqual(calculateNutrients(100, egg), {
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
    });
  });

  it('gramla orantılar', () => {
    const result = calculateNutrients(50, egg);
    assert.equal(result.calories, 78);
    assert.equal(result.protein, 6.5);
    assert.equal(result.fat, 5.5);
  });

  it('geçersiz miktarı sıfır sayar', () => {
    assert.equal(calculateNutrients(0, egg).calories, 0);
    assert.equal(calculateNutrients(-10, egg).protein, 0);
  });
});

describe('günlük toplam', () => {
  it('öğünleri toplar', () => {
    const total = sumDay([
      { grams: 100, per100g: egg },
      { grams: 200, per100g: { calories: 265, protein: 9, carbs: 49, fat: 3.2 } },
    ]);
    assert.equal(Math.round(total.calories), 155 + 530);
    assert.equal(Math.round(total.protein * 10) / 10, 13 + 18);
  });
});

describe('Mifflin-St Jeor', () => {
  const body = { weight: 70, height: 175, age: 30 };

  it('erkek BMR', () => {
    const bmr = mifflinBmr({ ...body, gender: 'MALE' });
    assert.equal(bmr, 10 * 70 + 6.25 * 175 - 5 * 30 + 5);
  });

  it('kadın BMR', () => {
    const bmr = mifflinBmr({ ...body, gender: 'FEMALE' });
    assert.equal(bmr, 10 * 70 + 6.25 * 175 - 5 * 30 - 161);
  });

  it('eksik bilgide hesaplamaz', () => {
    assert.equal(mifflinBmr({ ...body, gender: null }), null);
  });

  it('koruma hedefinde kalori ve makro üretir', () => {
    const plan = caloriePlan({
      ...body,
      gender: 'MALE',
      activityLevel: 'MODERATE',
      weightGoal: 'MAINTAIN',
    });
    assert.ok(plan);
    assert.equal(plan.bmr, 1649);
    assert.equal(plan.calories, Math.round(1648.75 * 1.55));
    assert.equal(plan.protein, Math.round((plan.calories * 0.25) / 4));
    assert.equal(plan.carbs, Math.round((plan.calories * 0.45) / 4));
    assert.equal(plan.fat, Math.round((plan.calories * 0.3) / 9));
  });
});
