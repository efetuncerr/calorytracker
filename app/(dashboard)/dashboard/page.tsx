import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { startOfDay, todayInputValue } from '@/lib/text';
import DashboardView from '@/components/dashboard-view';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params?.date || '') ? params.date! : todayInputValue();
  const day = startOfDay(date);
  const next = new Date(day);
  next.setDate(next.getDate() + 1);

  const entries = await prisma.logEntry.findMany({
    where: { userId: user.id, date: { gte: day, lt: next } },
    include: {
      food: {
        select: {
          id: true,
          name: true,
          caloriesPer100g: true,
          proteinPer100g: true,
          carbsPer100g: true,
          fatPer100g: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <DashboardView
      initialDate={date}
      initialEntries={entries}
      goals={{
        calories: user.dailyCalorieGoal || 2000,
        protein: user.dailyProteinGoal || 150,
        carbs: user.dailyCarbGoal || 250,
        fat: user.dailyFatGoal || 65,
      }}
    />
  );
}
