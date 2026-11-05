import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { startOfDay, todayInputValue } from '@/lib/text';
import LogDay from '@/components/log-day';

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser();
  const userId = user.id;

  const params = await searchParams;
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(params.date || '') ? params.date! : todayInputValue();
  const day = startOfDay(dateValue);
  const next = new Date(day);
  next.setDate(next.getDate() + 1);

  const logs = await prisma.logEntry.findMany({
    where: { userId, date: { gte: day, lt: next } },
    include: { food: true },
    orderBy: { createdAt: 'desc' },
  });

  const items = logs.map((item) => ({
    id: item.id,
    mealType: item.mealType,
    grams: item.grams,
    name: item.food.name,
    caloriesPer100g: item.food.caloriesPer100g,
    proteinPer100g: item.food.proteinPer100g,
  }));

  return (
    <div className="space-y-4">
        <form className="rounded-card border border-line bg-surface p-5">
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor="date">Tarih</label>
          <input id="date" type="date" name="date" defaultValue={dateValue} className="h-11 w-full min-w-0 rounded-control border border-line bg-surface px-3 text-ink" />
          <button className="mt-2 h-11 w-full rounded-control bg-primary-fill text-sm font-semibold text-on-primary">Günü göster</button>
        </form>

        <LogDay key={dateValue} initialItems={items} />
    </div>
  );
}
