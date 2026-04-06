'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NO_CHROME_PREFIXES = ['/guest-timer', '/workouts/timer'];
const NO_CHROME_EXACT = ['/', '/auth/signin'];

export default function ChromeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideChrome =
    NO_CHROME_EXACT.includes(pathname) ||
    NO_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideChrome) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-40 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}
