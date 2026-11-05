'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACTIVITIES, WEIGHT_GOALS, caloriePlan } from '@/lib/nutrition';
import { useConfirm } from '@/components/ui/confirm-dialog';

type Initial = {
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: string;
  activityLevel: string;
  weightGoal: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
};

const field = 'h-12 w-full rounded-control border border-line bg-surface px-3 text-base outline-none focus:border-primary';

export default function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [height, setHeight] = useState(initial.height ? String(initial.height) : '');
  const [weight, setWeight] = useState(initial.weight ? String(initial.weight) : '');
  const [age, setAge] = useState(initial.age ? String(initial.age) : '');
  const [gender, setGender] = useState(initial.gender);
  const [activityLevel, setActivityLevel] = useState(initial.activityLevel);
  const [weightGoal, setWeightGoal] = useState(initial.weightGoal);
  const [calories, setCalories] = useState(String(initial.dailyCalorieGoal));
  const [protein, setProtein] = useState(String(initial.dailyProteinGoal));
  const [carbs, setCarbs] = useState(String(initial.dailyCarbGoal));
  const [fat, setFat] = useState(String(initial.dailyFatGoal));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const plan = useMemo(
    () =>
      caloriePlan({
        height: Number(height),
        weight: Number(weight),
        age: Number(age),
        gender,
        activityLevel,
        weightGoal,
      }),
    [height, weight, age, gender, activityLevel, weightGoal]
  );

  function applySuggestion() {
    if (!plan) return;
    setCalories(String(plan.calories));
    setProtein(String(plan.protein));
    setCarbs(String(plan.carbs));
    setFat(String(plan.fat));
  }

  async function save() {
    setError('');
    setSaved(false);
    setLoading(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        height,
        weight,
        age,
        gender,
        activityLevel,
        weightGoal,
        dailyCalorieGoal: calories,
        dailyProteinGoal: protein,
        dailyCarbGoal: carbs,
        dailyFatGoal: fat,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-card border border-line bg-surface p-4">
        <h2 className="font-semibold">Vücut bilgisi</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Boy (cm)</span>
            <input className={field} inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Kilo (kg)</span>
            <input className={field} inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Yaş</span>
            <input className={field} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ['FEMALE', 'Kadın'],
            ['MALE', 'Erkek'],
            ['OTHER', 'Diğer'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setGender(value)}
              className={`h-11 rounded-control text-sm font-medium ${gender === value ? 'bg-primary-fill text-on-primary' : 'bg-bg'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-card border border-line bg-surface p-4">
        <h2 className="font-semibold">Aktivite</h2>
        {ACTIVITIES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setActivityLevel(item.value)}
            className={`flex w-full items-center justify-between rounded-control px-3 py-3 text-left ${activityLevel === item.value ? 'bg-primary-fill text-on-primary' : 'bg-bg'}`}
          >
            <span>
              <span className="block text-sm font-medium">{item.label}</span>
              <span className={`text-xs ${activityLevel === item.value ? 'text-on-primary' : 'text-muted'}`}>{item.detail}</span>
            </span>
            <span className="text-sm">×{item.factor}</span>
          </button>
        ))}
      </section>

      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="mb-2 font-semibold">Hedef</h2>
        <div className="grid grid-cols-3 gap-2">
          {WEIGHT_GOALS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setWeightGoal(item.value)}
              className={`h-11 rounded-control text-sm font-medium ${weightGoal === item.value ? 'bg-primary-fill text-on-primary' : 'bg-bg'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="font-semibold">Hesap</h2>
        {!plan ? (
          <p className="mt-2 text-sm text-muted">Boy, kilo, yaş ve cinsiyet girilince BMR hesaplanır.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-2 text-center min-[480px]:grid-cols-3">
            <div className="rounded-control bg-bg px-2 py-3">
              <div className="text-xs text-muted">BMR</div>
              <div className="text-lg font-semibold">{plan.bmr}</div>
              <div className="text-[11px] text-muted">kcal</div>
            </div>
            <div className="rounded-control bg-bg px-2 py-3">
              <div className="text-xs text-muted">İhtiyaç</div>
              <div className="text-lg font-semibold">{plan.tdee}</div>
              <div className="text-[11px] text-muted">kcal</div>
            </div>
            <div className="rounded-control bg-accent px-2 py-3">
              <div className="text-xs text-success-text">Öneri</div>
              <div className="text-lg font-semibold text-ink">{plan.calories}</div>
              <div className="text-[11px] text-success-text">kcal</div>
            </div>
          </div>
        )}
        {plan && (
          <p className="mt-3 text-sm text-muted">
            Önerilen dağılım: protein {plan.protein} g (%{Math.round(plan.split.protein * 100)}), karbonhidrat {plan.carbs} g (%{Math.round(plan.split.carbs * 100)}), yağ {plan.fat} g (%{Math.round(plan.split.fat * 100)}).
          </p>
        )}
        <button
          type="button"
          onClick={applySuggestion}
          disabled={!plan}
          className="mt-3 h-11 w-full rounded-control bg-primary-fill text-sm font-semibold text-on-primary disabled:opacity-40"
        >
          Öneriyi hedeflere yaz
        </button>
      </section>

      <section className="space-y-3 rounded-card border border-line bg-surface p-4">
        <h2 className="font-semibold">Günlük hedefler</h2>
        <p className="text-xs text-muted">Öneriyi kullanabilir veya kendin değiştirebilirsin.</p>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Kalori</span>
          <input className={field} inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Protein</span>
            <input className={field} inputMode="decimal" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Karb</span>
            <input className={field} inputMode="decimal" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Yağ</span>
            <input className={field} inputMode="decimal" value={fat} onChange={(e) => setFat(e.target.value)} />
          </label>
        </div>
        {error && <p className="text-sm text-danger-text">{error}</p>}
        {saved && <p className="text-sm text-success-text">Kaydedildi. Özet bu hedefleri kullanır.</p>}
        <button type="button" onClick={save} disabled={loading} className="h-12 w-full rounded-control bg-primary-fill font-semibold text-on-primary disabled:opacity-60">
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </section>

      <p className="px-1 text-xs leading-5 text-muted">
        Bu hesap Mifflin-St Jeor formülüyle yapılan genel bir tahmindir. Tıbbi tavsiye değildir. Hastalık, hamilelik veya 18 yaş altında bir uzmana danışın.
      </p>
      <DeleteAccount />
    </div>
  );
}

function DeleteAccount() {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!(await askConfirm({
      title: 'Hesabı sil',
      text: 'Hesabın, öğünlerin ve özel besinlerin silinecek. Bu işlem geri alınamaz.',
      confirmLabel: 'Hesabı sil',
    }))) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Hesap silinemedi');
      return;
    }
    router.push('/giris');
    router.refresh();
  }

  return (
    <section className="space-y-3 rounded-card border border-danger bg-surface p-4">
      {dialog}
      <h2 className="font-semibold text-danger-text">Hesabı sil</h2>
      <p className="text-xs leading-5 text-muted">
        KVKK kapsamında hesabını ve buna bağlı öğün, hedef ve özel besin kayıtlarını silebilirsin. Ortak besin listesi silinmez.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifren"
        className={field}
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-danger-text">{error}</p>}
      <button type="button" onClick={remove} disabled={loading || password.length < 1} className="h-11 w-full rounded-control border border-danger font-semibold text-danger-text disabled:opacity-50">
        {loading ? 'Siliniyor...' : 'Hesabımı ve verilerimi sil'}
      </button>
    </section>
  );
}
