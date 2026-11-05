import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/session';

const profileSchema = z.object({
  height: z.number().min(100, 'Boy 100-250 cm olmalı').max(250, 'Boy 100-250 cm olmalı'),
  weight: z.number().min(30, 'Kilo 30-300 kg olmalı').max(300, 'Kilo 30-300 kg olmalı'),
  age: z.number().int().min(14, 'Yaş 14-100 olmalı').max(100, 'Yaş 14-100 olmalı'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']),
  weightGoal: z.enum(['LOSE', 'MAINTAIN', 'GAIN']),
  dailyCalorieGoal: z.number().int().min(800, 'Kalori hedefi 800-8000 olmalı').max(8000, 'Kalori hedefi 800-8000 olmalı'),
  dailyProteinGoal: z.number().min(0).max(500),
  dailyCarbGoal: z.number().min(0).max(1000),
  dailyFatGoal: z.number().min(0).max(400),
});

export async function PATCH(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse({
    ...body,
    height: Number(body?.height),
    weight: Number(body?.weight),
    age: Number(body?.age),
    dailyCalorieGoal: Number(body?.dailyCalorieGoal),
    dailyProteinGoal: Number(body?.dailyProteinGoal),
    dailyCarbGoal: Number(body?.dailyCarbGoal),
    dailyFatGoal: Number(body?.dailyFatGoal),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Bilgiler geçersiz' }, { status: 400 });
  }

  const data = parsed.data;
  await prisma.user.update({
    where: { id: userId },
    data: {
      height: data.height,
      weight: data.weight,
      age: data.age,
      gender: data.gender,
      activityLevel: data.activityLevel,
      weightGoal: data.weightGoal,
      dailyCalorieGoal: data.dailyCalorieGoal,
      dailyProteinGoal: data.dailyProteinGoal,
      dailyCarbGoal: data.dailyCarbGoal,
      dailyFatGoal: data.dailyFatGoal,
    },
  });

  return NextResponse.json({ success: true });
}
