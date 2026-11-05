import ThemeToggle from '@/components/theme-toggle';
import Brand from '@/components/brand';
import CookieNotice from '@/components/cookie-notice';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg px-4 py-10 flex items-center justify-center">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Brand stacked />
        </div>
        {children}
        <CookieNotice />
      </div>
    </div>
  );
}
