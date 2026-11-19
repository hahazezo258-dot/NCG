import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { selectCartSummary, useCartStore } from '../store/cartStore';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgeAnimating, setBadgeAnimating] = useState(false);
  const { pathname } = useLocation();
  const items = useCartStore((state) => state.items);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const { totalBundles } = selectCartSummary(items);

  const prevCountRef = useRef<number>(totalBundles);
  const prevAddedAtRef = useRef<number>(lastAddedAt);
  const badgeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const countChanged = prevCountRef.current !== totalBundles;
    const itemJustAdded = lastAddedAt > 0 && prevAddedAtRef.current !== lastAddedAt;
    prevCountRef.current = totalBundles;
    prevAddedAtRef.current = lastAddedAt;

    if (!countChanged && !itemJustAdded) {
      return;
    }

    setBadgeAnimating(false);
    const rafId = window.requestAnimationFrame(() => {
      setBadgeAnimating(true);
    });

    if (badgeTimerRef.current !== null) {
      window.clearTimeout(badgeTimerRef.current);
    }
    badgeTimerRef.current = window.setTimeout(() => {
      setBadgeAnimating(false);
    }, 360);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [totalBundles, lastAddedAt]);

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current !== null) {
        window.clearTimeout(badgeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const primaryNavClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
      isActive
        ? 'border-teal-700 text-slate-900 font-semibold'
        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
    }`;

  const secondaryAdminClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors rounded-md px-2.5 py-1.5 ${
      isActive
        ? 'bg-slate-100 text-slate-900 font-semibold'
        : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-900'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[44px] items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-900 font-semibold'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-6 sm:px-6 lg:gap-8 lg:px-8">
        {/* Zone 1: Medical Brand Identity */}
        <Link
          to="/"
          className="inline-flex min-w-0 items-center gap-2 font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:gap-2.5 sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white sm:h-8 sm:w-8"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M8.25 3.5a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75v4.75h4.75a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-.75.75h-4.75v4.75a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1-.75-.75v-4.75H3.5a.75.75 0 0 1-.75-.75v-2a.75.75 0 0 1 .75-.75h4.75V3.5Z" />
            </svg>
          </span>
          <span>MedSupply Clinical</span>
        </Link>

        {/* Zone 2: Desktop Navigation */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={primaryNavClass}>
            Store
          </NavLink>
          <NavLink to="/cart" className={primaryNavClass}>
            Cart
          </NavLink>
          <span aria-hidden="true" className="h-4 w-px bg-slate-200" />
          <NavLink to="/admin" className={secondaryAdminClass}>
            Admin
          </NavLink>
        </nav>

        {/* Zone 3: Cart Action + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-2.5">
          <Link
            to="/cart"
            aria-label={`Shopping cart with ${totalBundles} ${totalBundles === 1 ? 'bundle' : 'bundles'}`}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-teal-700 px-2.5 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-[background-color,box-shadow] duration-200 hover:bg-teal-800 sm:gap-2 sm:px-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              badgeAnimating ? 'ring-2 ring-teal-500/45 ring-offset-1' : ''
            }`}
          >
            <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Cart</span>
            <span
              data-testid="header-cart-badge"
              className={`inline-flex min-w-[20px] items-center justify-center rounded-md bg-teal-800/80 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white sm:min-w-[22px] ${
                badgeAnimating ? 'animate-cart-badge bg-teal-900' : ''
              }`}
            >
              {totalBundles}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden"
        >
          <div className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              <span>Store</span>
            </NavLink>
            <NavLink
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              <span>Cart</span>
              <span className="text-xs font-semibold tabular-nums text-slate-600">
                {totalBundles} {totalBundles === 1 ? 'bundle' : 'bundles'}
              </span>
            </NavLink>
            <div className="my-1.5 border-t border-slate-100" />
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              <span>Admin Dashboard</span>
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
