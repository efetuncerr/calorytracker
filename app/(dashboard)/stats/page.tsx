import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { shiftDate, startOfDay, todayInputValue } from '@/lib/text';
import StatsView, { type StatEntry } from '@/components/stats-view';

function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default async function StatsPage() {
  const user = await requireUser();
  const userId = user.id;

  const today = todayInputValue();
  const from = startOfDay(shiftDate(today, -29));
  const until = new Date(startOfDay(today));
  until.setDate(until.getDate() + 1);

  const logs = await prisma.logEntry.findMany({
      where: { userId, date: { gte: from, lt: until } },
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
  });

  const entries: StatEntry[] = logs.map((log) => {
    const factor = log.grams / 100;
    return {
      date: dateKey(log.date),
      foodId: log.food.id,
      name: log.food.name,
      grams: log.grams,
      calories: log.food.caloriesPer100g * factor,
      protein: log.food.proteinPer100g * factor,
      carbs: log.food.carbsPer100g * factor,
      fat: log.food.fatPer100g * factor,
    };
  });

  return <StatsView entries={entries} calorieGoal={user.dailyCalorieGoal || 2000} />;
}
