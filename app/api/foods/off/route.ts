import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/session';
import { foldTurkish } from '@/lib/text';
import { searchOffByBarcode, searchOffByName } from '@/lib/off';

const importSchema = z.object({
  code: z.string().regex(/^\d{8,14}$/),
  name: z.string().trim().min(2).max(120),
  brand: z.string().trim().max(60).nullable().optional(),
  caloriesPer100g: z.number().min(0).max(2000),
  proteinPer100g: z.number().min(0).max(100),
  carbsPer100g: z.number().min(0).max(100),
  fatPer100g: z.number().min(0).max(100),
});

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const barcode = (req.nextUrl.searchParams.get('barcode') || '').replace(/\D/g, '');
  const q = (req.nextUrl.searchParams.get('q') || '').trim().slice(0, 80);

  try {
    if (barcode) {
      if (!/^\d{8,14}$/.test(barcode)) {
        return NextResponse.json({ error: 'Barkod 8-14 rakam olmalı' }, { status: 400 });
      }
      const product = await searchOffByBarcode(barcode);
      if (!product) return NextResponse.json({ error: 'Bu barkod bulunamadı' }, { status: 404 });
      return NextResponse.json(product);
    }
    if (q.length < 2) return NextResponse.json([]);
    const products = await searchOffByName(q);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(barcode ? { error: 'Open Food Facts yanıt vermedi' } : [], {
      status: barcode ? 502 : 200,
    });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = importSchema.safeParse({
    ...body,
    caloriesPer100g: Number(body?.caloriesPer100g),
    proteinPer100g: Number(body?.proteinPer100g),
    carbsPer100g: Number(body?.carbsPer100g),
    fatPer100g: Number(body?.fatPer100g),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ürün bilgisi geçersiz' }, { status: 400 });
  }

  const data = parsed.data;
  const name = data.brand ? `${data.name} · ${data.brand}` : data.name;
  const existing = await prisma.food.findUnique({ where: { barcode: data.code }, include: { portions: true } });
  if (existing) return NextResponse.json(existing);

  const food = await prisma.food.create({
    data: {
      name: name.slice(0, 140),
      nameSearch: foldTurkish(name).slice(0, 140),
      category: 'Barkod',
      caloriesPer100g: data.caloriesPer100g,
      proteinPer100g: data.proteinPer100g,
      carbsPer100g: data.carbsPer100g,
      fatPer100g: data.fatPer100g,
      isCustom: false,
      barcode: data.code,
      source: 'openfoodfacts',
    },
    include: { portions: true },
  });
  return NextResponse.json(food);
}
