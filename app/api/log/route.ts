import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/session';
import { startOfDay } from '@/lib/text';

const logSchema = z.object({
  foodId: z.string().min(1),
  grams: z.number().positive('Miktar 0’dan büyük olmalı').max(5000, 'Miktar en fazla 5000 gram olabilir'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih geçersiz'),
});

const patchSchema = z.object({
  id: z.string().min(1),
  grams: z.number().positive('Miktar 0’dan büyük olmalı').max(5000, 'Miktar en fazla 5000 gram olabilir').optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
}).refine((value) => value.grams != null || value.mealType != null, { message: 'Değişiklik yok' });

const foodSelect = {
  id: true,
  name: true,
  caloriesPer100g: true,
  proteinPer100g: true,
  carbsPer100g: true,
  fatPer100g: true,
};

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Tarih geçersiz' }, { status: 400 });
  }

  const day = startOfDay(date);
  const next = new Date(day);
  next.setDate(next.getDate() + 1);

  const [user, entries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbGoal: true,
        dailyFatGoal: true,
      },
    }),
    prisma.logEntry.findMany({
      where: { userId, date: { gte: day, lt: next } },
      include: { food: { select: foodSelect } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return NextResponse.json({
    date,
    goals: {
      calories: user?.dailyCalorieGoal || 2000,
      protein: user?.dailyProteinGoal || 150,
      carbs: user?.dailyCarbGoal || 250,
      fat: user?.dailyFatGoal || 65,
    },
    entries,
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = logSchema.safeParse({
    ...body,
    grams: Number(body?.grams),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Bilgiler geçersiz' }, { status: 400 });
  }

  const food = await prisma.food.findFirst({
    where: {
      id: parsed.data.foodId,
      OR: [{ isCustom: false }, { createdByUserId: userId }],
    },
  });
  if (!food) return NextResponse.json({ error: 'Besin bulunamadı' }, { status: 404 });

  const entry = await prisma.logEntry.create({
    data: {
      userId,
      foodId: food.id,
      grams: parsed.data.grams,
      mealType: parsed.data.mealType,
      date: startOfDay(parsed.data.date),
    },
    include: { food: { select: foodSelect } },
  });

  return NextResponse.json(entry);
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse({
    id: body?.id,
    grams: body?.grams == null || body?.grams === '' ? undefined : Number(body.grams),
    mealType: body?.mealType,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Bilgiler geçersiz' }, { status: 400 });
  }

  const existing = await prisma.logEntry.findFirst({
    where: { id: parsed.data.id, userId },
  });
  if (!existing) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });

  const entry = await prisma.logEntry.update({
    where: { id: existing.id },
    data: {
      ...(parsed.data.grams != null ? { grams: parsed.data.grams } : {}),
      ...(parsed.data.mealType ? { mealType: parsed.data.mealType } : {}),
    },
    include: { food: { select: foodSelect } },
  });

  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 400 });

  const existing = await prisma.logEntry.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });

  await prisma.logEntry.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}
