import { requireUser } from '@/lib/session';
import ProfileForm from '@/components/profile-form';

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <ProfileForm
          initial={{
            height: user.height,
            weight: user.weight,
            age: user.age,
            gender: user.gender || 'FEMALE',
            activityLevel: user.activityLevel || 'SEDENTARY',
            weightGoal: user.weightGoal || 'MAINTAIN',
            dailyCalorieGoal: user.dailyCalorieGoal || 2000,
            dailyProteinGoal: user.dailyProteinGoal || 150,
            dailyCarbGoal: user.dailyCarbGoal || 250,
            dailyFatGoal: user.dailyFatGoal || 65,
          }}
    />
  );
}
