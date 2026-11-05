import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/session';
import { foldTurkish } from '@/lib/text';
import { ensureCatalog } from '@/lib/catalog';

const customFoodSchema = z.object({
  name: z.string().trim().min(2, 'Besin adı en az 2 karakter olmalı').max(80),
  category: z.string().trim().max(40).optional(),
  caloriesPer100g: z.number().min(0, 'Kalori 0 veya daha büyük olmalı'),
  proteinPer100g: z.number().min(0, 'Protein 0 veya daha büyük olmalı'),
  carbsPer100g: z.number().min(0, 'Karbonhidrat 0 veya daha büyük olmalı'),
  fatPer100g: z.number().min(0, 'Yağ 0 veya daha büyük olmalı'),
  portionLabel: z.string().trim().max(40).optional(),
  portionGrams: z.number().positive().optional(),
});

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q') || '';
  const search = foldTurkish(q).slice(0, 80);
  if (search.length < 1) return NextResponse.json([]);

  await ensureCatalog();

  const foods = await prisma.food.findMany({
    where: {
      nameSearch: { contains: search },
      OR: [{ isCustom: false }, { isCustom: true, createdByUserId: userId }],
    },
    include: { portions: true },
    take: 20,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = customFoodSchema.safeParse({
    ...body,
    caloriesPer100g: Number(body?.caloriesPer100g),
    proteinPer100g: Number(body?.proteinPer100g),
    carbsPer100g: Number(body?.carbsPer100g),
    fatPer100g: Number(body?.fatPer100g),
    portionGrams: body?.portionGrams === '' || body?.portionGrams == null ? undefined : Number(body.portionGrams),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Bilgiler geçersiz' }, { status: 400 });
  }

  const data = parsed.data;
  const food = await prisma.food.create({
    data: {
      name: data.name,
      nameSearch: foldTurkish(data.name),
      category: data.category || 'Özel',
      caloriesPer100g: data.caloriesPer100g,
      proteinPer100g: data.proteinPer100g,
      carbsPer100g: data.carbsPer100g,
      fatPer100g: data.fatPer100g,
      isCustom: true,
      createdByUserId: userId,
      portions:
        data.portionLabel && data.portionGrams
          ? { create: [{ label: data.portionLabel, grams: data.portionGrams }] }
          : undefined,
    },
    include: { portions: true },
  });

  return NextResponse.json(food);
}
