import type { Metadata } from 'next';
import { Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'পোস্টারমেকার AI — বাংলাদেশি রাজনৈতিক ও নির্বাচনী পোস্টার মেকার',
  description:
    'গুগল জেমিনি এআই চালিত বাংলাদেশি রাজনৈতিক নির্বাচনী, বিজয় দিবস, শোক দিবস ও উৎসবের পোস্টার তৈরির আধুনিক ডিজিটাল প্ল্যাটফর্ম।',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`dark ${hindSiliguri.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-bengali antialiased transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
