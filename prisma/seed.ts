import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Aksansız küçük harf dönüşümü
function toSearchName(name: string): string {
  return name
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/ç/g, 'c')
    .toLowerCase()
    .replace(/i̇/g, 'i')
    .trim();
}

const foods = [
  // Kahvaltılık
  { name: 'Yumurta (haşlanmış)', category: 'Kahvaltılık', caloriesPer100g: 155, proteinPer100g: 13.0, carbsPer100g: 1.1, fatPer100g: 11.0, fiberPer100g: 0, sugarPer100g: 1.1 },
  { name: 'Beyaz Ekmek', category: 'Tahıl', caloriesPer100g: 265, proteinPer100g: 9.0, carbsPer100g: 49.0, fatPer100g: 3.2, fiberPer100g: 2.7, sugarPer100g: 5.0 },
  { name: 'Tam Buğday Ekmeği', category: 'Tahıl', caloriesPer100g: 247, proteinPer100g: 13.0, carbsPer100g: 41.0, fatPer100g: 4.2, fiberPer100g: 7.0, sugarPer100g: 6.0 },
  { name: 'Simit', category: 'Kahvaltılık', caloriesPer100g: 300, proteinPer100g: 10.0, carbsPer100g: 55.0, fatPer100g: 6.0, fiberPer100g: 2.5, sugarPer100g: 4.0 },
  { name: 'Beyaz Peynir', category: 'Süt Ürünleri', caloriesPer100g: 264, proteinPer100g: 14.0, carbsPer100g: 1.5, fatPer100g: 21.0, fiberPer100g: 0, sugarPer100g: 1.0 },
  { name: 'Kaşar Peyniri', category: 'Süt Ürünleri', caloriesPer100g: 404, proteinPer100g: 27.0, carbsPer100g: 1.4, fatPer100g: 31.7, fiberPer100g: 0, sugarPer100g: 1.0 },
  { name: 'Yoğurt (tam yağlı)', category: 'Süt Ürünleri', caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3, fiberPer100g: 0, sugarPer100g: 4.7 },
  { name: 'Süt (tam yağlı)', category: 'Süt Ürünleri', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, fiberPer100g: 0, sugarPer100g: 5.0 },
  { name: 'Ayran', category: 'Süt Ürünleri', caloriesPer100g: 36, proteinPer100g: 1.7, carbsPer100g: 2.5, fatPer100g: 1.5, fiberPer100g: 0, sugarPer100g: 2.5 },
  { name: 'Zeytin (siyah)', category: 'Kahvaltılık', caloriesPer100g: 115, proteinPer100g: 0.8, carbsPer100g: 6.0, fatPer100g: 11.0, fiberPer100g: 3.2, sugarPer100g: 0 },
  { name: 'Bal', category: 'Kahvaltılık', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82.0, fatPer100g: 0, fiberPer100g: 0.2, sugarPer100g: 82.0 },
  { name: 'Reçel (çilek)', category: 'Kahvaltılık', caloriesPer100g: 250, proteinPer100g: 0.4, carbsPer100g: 65.0, fatPer100g: 0.1, fiberPer100g: 1.0, sugarPer100g: 60.0 },
  { name: 'Tereyağı', category: 'Yağ', caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81.0, fiberPer100g: 0, sugarPer100g: 0.1 },
  { name: 'Menemen', category: 'Kahvaltılık', caloriesPer100g: 95, proteinPer100g: 6.0, carbsPer100g: 4.0, fatPer100g: 7.0, fiberPer100g: 1.0, sugarPer100g: 2.0 },

  // Ana yemekler & pilavlar
  { name: 'Pirinç Pilavı', category: 'Tahıl', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28.0, fatPer100g: 0.3, fiberPer100g: 0.4, sugarPer100g: 0.1 },
  { name: 'Bulgur Pilavı', category: 'Tahıl', caloriesPer100g: 115, proteinPer100g: 3.5, carbsPer100g: 20.0, fatPer100g: 2.5, fiberPer100g: 3.0, sugarPer100g: 0.5 },
  { name: 'Tavuk Göğsü (ızgara)', category: 'Et', caloriesPer100g: 165, proteinPer100g: 31.0, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, sugarPer100g: 0 },
  { name: 'Mercimek Çorbası', category: 'Çorba', caloriesPer100g: 60, proteinPer100g: 3.5, carbsPer100g: 8.0, fatPer100g: 1.5, fiberPer100g: 2.0, sugarPer100g: 1.0 },
  { name: 'Ezogelin Çorbası', category: 'Çorba', caloriesPer100g: 70, proteinPer100g: 3.0, carbsPer100g: 9.0, fatPer100g: 2.0, fiberPer100g: 1.5, sugarPer100g: 1.2 },
  { name: 'Döner (et)', category: 'Et', caloriesPer100g: 215, proteinPer100g: 20.0, carbsPer100g: 3.0, fatPer100g: 14.0, fiberPer100g: 0, sugarPer100g: 0 },
  { name: 'Köfte (ızgara)', category: 'Et', caloriesPer100g: 240, proteinPer100g: 18.0, carbsPer100g: 5.0, fatPer100g: 16.0, fiberPer100g: 0.5, sugarPer100g: 1.0 },
  { name: 'Kuru Fasulye', category: 'Baklagil', caloriesPer100g: 110, proteinPer100g: 6.5, carbsPer100g: 15.0, fatPer100g: 3.0, fiberPer100g: 5.0, sugarPer100g: 1.5 },
  { name: 'Nohut Yemeği', category: 'Baklagil', caloriesPer100g: 120, proteinPer100g: 6.0, carbsPer100g: 16.0, fatPer100g: 3.5, fiberPer100g: 4.5, sugarPer100g: 2.0 },
  { name: 'Makarna (haşlanmış)', category: 'Tahıl', caloriesPer100g: 131, proteinPer100g: 5.0, carbsPer100g: 25.0, fatPer100g: 1.1, fiberPer100g: 1.8, sugarPer100g: 0.6 },
  { name: 'Lahmacun', category: 'Fast Food', caloriesPer100g: 230, proteinPer100g: 10.0, carbsPer100g: 30.0, fatPer100g: 8.0, fiberPer100g: 2.0, sugarPer100g: 2.0 },
  { name: 'Pide (kaşarlı)', category: 'Fast Food', caloriesPer100g: 280, proteinPer100g: 12.0, carbsPer100g: 35.0, fatPer100g: 10.0, fiberPer100g: 2.0, sugarPer100g: 2.5 },

  // Sebzeler
  { name: 'Domates', category: 'Sebze', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, fiberPer100g: 1.2, sugarPer100g: 2.6 },
  { name: 'Salatalık', category: 'Sebze', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, fiberPer100g: 0.5, sugarPer100g: 1.7 },
  { name: 'Ispanak (pişmiş)', category: 'Sebze', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, sugarPer100g: 0.4 },
  { name: 'Patates (haşlanmış)', category: 'Sebze', caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20.0, fatPer100g: 0.1, fiberPer100g: 1.8, sugarPer100g: 0.9 },
  { name: 'Havuç', category: 'Sebze', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10.0, fatPer100g: 0.2, fiberPer100g: 2.8, sugarPer100g: 4.7 },
  { name: 'Soğan', category: 'Sebze', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1, fiberPer100g: 1.7, sugarPer100g: 4.2 },
  { name: 'Marul', category: 'Sebze', caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, fiberPer100g: 1.3, sugarPer100g: 0.8 },
  { name: 'Biber (yeşil)', category: 'Sebze', caloriesPer100g: 20, proteinPer100g: 0.9, carbsPer100g: 4.6, fatPer100g: 0.2, fiberPer100g: 1.7, sugarPer100g: 2.4 },

  // Meyveler
  { name: 'Elma', category: 'Meyve', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14.0, fatPer100g: 0.2, fiberPer100g: 2.4, sugarPer100g: 10.0 },
  { name: 'Portakal', category: 'Meyve', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12.0, fatPer100g: 0.1, fiberPer100g: 2.4, sugarPer100g: 9.0 },
  { name: 'Muz', category: 'Meyve', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23.0, fatPer100g: 0.3, fiberPer100g: 2.6, sugarPer100g: 12.0 },
  { name: 'Üzüm', category: 'Meyve', caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18.0, fatPer100g: 0.2, fiberPer100g: 0.9, sugarPer100g: 15.0 },
  { name: 'Çilek', category: 'Meyve', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, fiberPer100g: 2.0, sugarPer100g: 4.9 },
  { name: 'Karpuz', category: 'Meyve', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2, fiberPer100g: 0.4, sugarPer100g: 6.2 },

  // Kuruyemiş & diğer
  { name: 'Fındık', category: 'Kuruyemiş', caloriesPer100g: 628, proteinPer100g: 15.0, carbsPer100g: 17.0, fatPer100g: 61.0, fiberPer100g: 10.0, sugarPer100g: 4.0 },
  { name: 'Ceviz', category: 'Kuruyemiş', caloriesPer100g: 654, proteinPer100g: 15.2, carbsPer100g: 13.7, fatPer100g: 65.2, fiberPer100g: 6.7, sugarPer100g: 2.6 },
  { name: 'Badem', category: 'Kuruyemiş', caloriesPer100g: 579, proteinPer100g: 21.0, carbsPer100g: 22.0, fatPer100g: 50.0, fiberPer100g: 12.5, sugarPer100g: 4.4 },
  { name: 'Zeytinyağı', category: 'Yağ', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100.0, fiberPer100g: 0, sugarPer100g: 0 },
  { name: 'Çay (şekersiz)', category: 'İçecek', caloriesPer100g: 1, proteinPer100g: 0, carbsPer100g: 0.3, fatPer100g: 0, fiberPer100g: 0, sugarPer100g: 0 },
  { name: 'Türk Kahvesi', category: 'İçecek', caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0, sugarPer100g: 0 },
  { name: 'Sucuk (ızgara)', category: 'Et', caloriesPer100g: 430, proteinPer100g: 20.0, carbsPer100g: 2.0, fatPer100g: 38.0, fiberPer100g: 0, sugarPer100g: 1.0 },
  { name: 'Börek (peynirli)', category: 'Hamur İşi', caloriesPer100g: 290, proteinPer100g: 9.0, carbsPer100g: 30.0, fatPer100g: 15.0, fiberPer100g: 1.5, sugarPer100g: 2.0 },
  { name: 'Baklava', category: 'Tatlı', caloriesPer100g: 430, proteinPer100g: 6.0, carbsPer100g: 50.0, fatPer100g: 22.0, fiberPer100g: 2.0, sugarPer100g: 30.0 },
  { name: 'Sütlaç', category: 'Tatlı', caloriesPer100g: 120, proteinPer100g: 3.5, carbsPer100g: 20.0, fatPer100g: 3.0, fiberPer100g: 0.3, sugarPer100g: 12.0 },
  { name: 'Cacık', category: 'Meze', caloriesPer100g: 45, proteinPer100g: 2.0, carbsPer100g: 3.5, fatPer100g: 2.5, fiberPer100g: 0.3, sugarPer100g: 2.0 },
  { name: 'Humus', category: 'Meze', caloriesPer100g: 166, proteinPer100g: 8.0, carbsPer100g: 14.0, fatPer100g: 9.6, fiberPer100g: 6.0, sugarPer100g: 0.3 },
  { name: 'Turşu', category: 'Meze', caloriesPer100g: 12, proteinPer100g: 0.5, carbsPer100g: 2.5, fatPer100g: 0.1, fiberPer100g: 1.0, sugarPer100g: 1.0 },
  { name: 'Pilav (şehriyeli)', category: 'Tahıl', caloriesPer100g: 140, proteinPer100g: 3.0, carbsPer100g: 26.0, fatPer100g: 2.0, fiberPer100g: 0.5, sugarPer100g: 0.2 },
  { name: 'Mantı (yoğurtlu)', category: 'Ana Yemek', caloriesPer100g: 185, proteinPer100g: 8.0, carbsPer100g: 22.0, fatPer100g: 7.0, fiberPer100g: 1.0, sugarPer100g: 2.0 },

  { name: 'Yulaf lapası', category: 'Kahvaltılık', caloriesPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12.0, fatPer100g: 1.5, fiberPer100g: 1.7, sugarPer100g: 0.3 },
  { name: 'SEK Quark', category: 'Süt Ürünleri', caloriesPer100g: 67, proteinPer100g: 12.0, carbsPer100g: 3.8, fatPer100g: 0.2, fiberPer100g: 0, sugarPer100g: 3.8 },
  { name: 'Nescafe (şekersiz)', category: 'İçecek', caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0.3, fatPer100g: 0, fiberPer100g: 0, sugarPer100g: 0 },
  { name: 'Protein tozu', category: 'Takviye', caloriesPer100g: 400, proteinPer100g: 80.0, carbsPer100g: 8.0, fatPer100g: 5.0, fiberPer100g: 0, sugarPer100g: 4.0 },
  { name: 'Yeşil elma', category: 'Meyve', caloriesPer100g: 52, proteinPer100g: 0.4, carbsPer100g: 14.0, fatPer100g: 0.2, fiberPer100g: 2.8, sugarPer100g: 10.0 },
  { name: 'Kırmızı elma', category: 'Meyve', caloriesPer100g: 57, proteinPer100g: 0.3, carbsPer100g: 15.0, fatPer100g: 0.2, fiberPer100g: 2.4, sugarPer100g: 12.0 },
  { name: 'Ananas', category: 'Meyve', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13.0, fatPer100g: 0.1, fiberPer100g: 1.4, sugarPer100g: 10.0 },
  { name: 'Avokado', category: 'Meyve', caloriesPer100g: 160, proteinPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 15.0, fiberPer100g: 6.7, sugarPer100g: 0.7 },
  { name: 'Roka', category: 'Sebze', caloriesPer100g: 25, proteinPer100g: 2.6, carbsPer100g: 3.7, fatPer100g: 0.7, fiberPer100g: 1.6, sugarPer100g: 2.1 },
  { name: 'Şeftali', category: 'Meyve', caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 10.0, fatPer100g: 0.3, fiberPer100g: 1.5, sugarPer100g: 8.4 },
];

const portions: Record<string, { label: string; grams: number }[]> = {
  'Yumurta (haşlanmış)': [{ label: '1 adet', grams: 50 }, { label: '2 adet', grams: 100 }],
  'Beyaz Ekmek': [{ label: '1 dilim', grams: 25 }, { label: '2 dilim', grams: 50 }],
  'Tam Buğday Ekmeği': [{ label: '1 dilim', grams: 30 }, { label: '2 dilim', grams: 60 }],
  'Simit': [{ label: '1 adet', grams: 100 }, { label: 'yarım', grams: 50 }],
  'Beyaz Peynir': [{ label: '1 dilim', grams: 30 }, { label: '1 kibrit kutusu', grams: 25 }],
  'Kaşar Peyniri': [{ label: '1 dilim', grams: 20 }, { label: '1 kibrit kutusu', grams: 25 }],
  'Yoğurt (tam yağlı)': [{ label: '1 kase', grams: 200 }, { label: '1 su bardağı', grams: 200 }],
  'Süt (tam yağlı)': [{ label: '1 su bardağı', grams: 200 }, { label: '1 çay bardağı', grams: 100 }],
  'Ayran': [{ label: '1 su bardağı', grams: 200 }, { label: '1 şişe', grams: 250 }],
  'Zeytin (siyah)': [{ label: '5 adet', grams: 20 }, { label: '10 adet', grams: 40 }],
  'Bal': [{ label: '1 tatlı kaşığı', grams: 10 }, { label: '1 yemek kaşığı', grams: 20 }],
  'Reçel (çilek)': [{ label: '1 tatlı kaşığı', grams: 10 }, { label: '1 yemek kaşığı', grams: 20 }],
  'Tereyağı': [{ label: '1 tatlı kaşığı', grams: 5 }, { label: '1 yemek kaşığı', grams: 10 }],
  'Pirinç Pilavı': [{ label: '1 porsiyon', grams: 150 }, { label: '1 yemek kaşığı', grams: 20 }],
  'Bulgur Pilavı': [{ label: '1 porsiyon', grams: 150 }, { label: '1 yemek kaşığı', grams: 20 }],
  'Tavuk Göğsü (ızgara)': [{ label: '1 porsiyon', grams: 120 }, { label: '100 g', grams: 100 }],
  'Mercimek Çorbası': [{ label: '1 kase', grams: 250 }, { label: '1 kepçe', grams: 150 }],
  'Döner (et)': [{ label: '1 porsiyon', grams: 150 }, { label: '1 dürüm', grams: 200 }],
  'Köfte (ızgara)': [{ label: '4 adet', grams: 100 }, { label: '1 porsiyon', grams: 150 }],
  'Elma': [{ label: '1 adet (orta)', grams: 180 }, { label: '1 dilim', grams: 50 }],
  'Portakal': [{ label: '1 adet', grams: 130 }, { label: '1 dilim', grams: 40 }],
  'Muz': [{ label: '1 adet', grams: 120 }, { label: 'yarım', grams: 60 }],
  'Fındık': [{ label: '1 avuç', grams: 30 }, { label: '10 adet', grams: 10 }],
  'Zeytinyağı': [{ label: '1 yemek kaşığı', grams: 10 }, { label: '1 tatlı kaşığı', grams: 5 }],
  'Menemen': [{ label: '1 porsiyon', grams: 200 }],
  'Kuru Fasulye': [{ label: '1 porsiyon', grams: 250 }],
  'Lahmacun': [{ label: '1 adet', grams: 130 }],
  'Börek (peynirli)': [{ label: '1 dilim', grams: 80 }, { label: '1 porsiyon', grams: 150 }],
  'Baklava': [{ label: '1 dilim', grams: 50 }, { label: '2 dilim', grams: 100 }],
  'Yulaf lapası': [{ label: '1 kase', grams: 250 }],
  'SEK Quark': [{ label: '1 kase', grams: 150 }, { label: '100 g', grams: 100 }],
  'Nescafe (şekersiz)': [{ label: '1 fincan', grams: 200 }, { label: '1 kupa', grams: 250 }],
  'Protein tozu': [{ label: '1 ölçek', grams: 30 }],
  'Yeşil elma': [{ label: '1 adet', grams: 180 }],
  'Kırmızı elma': [{ label: '1 adet', grams: 180 }],
  Ananas: [{ label: '1 dilim', grams: 80 }, { label: '1 kase', grams: 150 }],
  Avokado: [{ label: 'yarım', grams: 70 }, { label: '1 adet', grams: 140 }],
  Roka: [{ label: '1 avuç', grams: 20 }, { label: '1 kase', grams: 40 }],
  Şeftali: [{ label: '1 adet', grams: 150 }],
};

async function main() {
  console.log('Seed başlıyor...');

  for (const food of foods) {
    const data = {
      name: food.name,
      nameSearch: toSearchName(food.name),
      category: food.category,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      fiberPer100g: food.fiberPer100g,
      sugarPer100g: food.sugarPer100g,
      isCustom: false,
    };
    const existing = await prisma.food.findFirst({ where: { name: food.name, isCustom: false } });
    const saved = existing
      ? await prisma.food.update({ where: { id: existing.id }, data })
      : await prisma.food.create({ data });

    await prisma.foodPortion.deleteMany({ where: { foodId: saved.id } });
    const foodPortions = portions[food.name];
    if (foodPortions) {
      await prisma.foodPortion.createMany({
        data: foodPortions.map((p) => ({
          foodId: saved.id,
          label: p.label,
          grams: p.grams,
        })),
      });
    }
  }

  console.log(`${foods.length} besin ve porsiyonları eklendi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
