import type { Metadata } from 'next';
import { Inter, Nunito } from 'next/font/google';
import AppThemeProvider from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/session';
import { themeBootScript } from '@/lib/theme-script';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-body' });
const nunito = Nunito({ subsets: ['latin', 'latin-ext'], variable: '--font-display' });

export const metadata: Metadata = {
  
  title: 'ALMINA · calory tracker',
  description: 'ALMINA calory tracker. Günlük besin ve kalori takibi.',
};
export const dynamic = 'force-dynamic';
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let savedTheme: string | null = null;
  try {
    const userId = await getUserId();
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { theme: true } });
      savedTheme = user?.theme ?? null;
    }
  } catch {
    savedTheme = null;
  }

  return (
    <html lang="tr" className={`${inter.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript(savedTheme) }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-body text-ink">
        <AppThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
