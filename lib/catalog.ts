import { prisma } from '@/lib/prisma';
import { foldTurkish } from '@/lib/text';

const extraFoods = [
  { name: 'Yulaf lapası', category: 'Kahvaltılık', caloriesPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12, fatPer100g: 1.5, fiberPer100g: 1.7, sugarPer100g: 0.3, portions: [{ label: '1 kase', grams: 250 }] },
  { name: 'SEK Quark', category: 'Süt Ürünleri', caloriesPer100g: 67, proteinPer100g: 12, carbsPer100g: 3.8, fatPer100g: 0.2, fiberPer100g: 0, sugarPer100g: 3.8, portions: [{ label: '1 kase', grams: 150 }, { label: '100 g', grams: 100 }] },
  { name: 'Nescafe (şekersiz)', category: 'İçecek', caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0.3, fatPer100g: 0, fiberPer100g: 0, sugarPer100g: 0, portions: [{ label: '1 fincan', grams: 200 }, { label: '1 kupa', grams: 250 }] },
  { name: 'Protein tozu', category: 'Takviye', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 5, fiberPer100g: 0, sugarPer100g: 4, portions: [{ label: '1 ölçek', grams: 30 }] },
  { name: 'Yeşil elma', category: 'Meyve', caloriesPer100g: 52, proteinPer100g: 0.4, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.8, sugarPer100g: 10, portions: [{ label: '1 adet', grams: 180 }] },
  { name: 'Kırmızı elma', category: 'Meyve', caloriesPer100g: 57, proteinPer100g: 0.3, carbsPer100g: 15, fatPer100g: 0.2, fiberPer100g: 2.4, sugarPer100g: 12, portions: [{ label: '1 adet', grams: 180 }] },
  { name: 'Ananas', category: 'Meyve', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1, fiberPer100g: 1.4, sugarPer100g: 10, portions: [{ label: '1 dilim', grams: 80 }, { label: '1 kase', grams: 150 }] },
  { name: 'Avokado', category: 'Meyve', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 15, fiberPer100g: 6.7, sugarPer100g: 0.7, portions: [{ label: 'yarım', grams: 70 }, { label: '1 adet', grams: 140 }], alias: 'avakado' },
  { name: 'Roka', category: 'Sebze', caloriesPer100g: 25, proteinPer100g: 2.6, carbsPer100g: 3.7, fatPer100g: 0.7, fiberPer100g: 1.6, sugarPer100g: 2.1, portions: [{ label: '1 avuç', grams: 20 }, { label: '1 kase', grams: 40 }] },
  { name: 'Şeftali', category: 'Meyve', caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.3, fiberPer100g: 1.5, sugarPer100g: 8.4, portions: [{ label: '1 adet', grams: 150 }] },
];

let ready = false;

export async function ensureCatalog() {
  if (ready) return;
  for (const food of extraFoods) {
    const nameSearch = `${foldTurkish(food.name)}${food.alias ? ` ${food.alias}` : ''}`;
    const existing = await prisma.food.findFirst({ where: { name: food.name, isCustom: false } });
    if (existing) {
      if (existing.nameSearch !== nameSearch) {
        await prisma.food.update({ where: { id: existing.id }, data: { nameSearch } });
      }
      continue;
    }
    await prisma.food.create({
      data: {
        name: food.name,
        nameSearch,
        category: food.category,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
        fiberPer100g: food.fiberPer100g,
        sugarPer100g: food.sugarPer100g,
        isCustom: false,
        portions: { create: food.portions },
      },
    });
  }
  ready = true;
}
