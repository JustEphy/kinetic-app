'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/workouts', label: 'Workouts' },
  { href: '/stats', label: 'Stats' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-md">
      <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black italic tracking-tighter text-primary">
          KINETIC
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-body tracking-tight transition-colors ${
                isActive(link.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-slate-400 hover:text-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Settings Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 rounded-full hover:bg-surface-container-highest/50 transition-all duration-300 active:scale-95 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-around py-2 border-t border-outline-variant/20">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
              isActive(link.href)
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {link.label === 'Home' && 'home'}
              {link.label === 'Workouts' && 'fitness_center'}
              {link.label === 'Stats' && 'monitoring'}
              {link.label === 'Profile' && 'person'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
