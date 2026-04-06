import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background w-full py-12 border-t border-surface-container">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-primary">
          KINETIC
        </Link>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            href="/legal/privacy"
            className="font-body text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-opacity duration-300"
          >
            Privacy
          </Link>
          <Link
            href="/legal/terms"
            className="font-body text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-opacity duration-300"
          >
            Terms
          </Link>
          <Link
            href="/support"
            className="font-body text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-opacity duration-300"
          >
            Support
          </Link>
          <Link
            href="/contact"
            className="font-body text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-opacity duration-300"
          >
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <p className="font-body text-xs uppercase tracking-widest text-slate-500">
          © 2026 KINETIC. ENGINEERED FOR PERFORMANCE.
        </p>
      </div>
    </footer>
  );
}
