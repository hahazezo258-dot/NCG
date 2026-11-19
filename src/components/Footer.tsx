import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-display font-semibold text-slate-900">MedSupply Clinical</p>
          <p className="mt-1 text-xs text-slate-500">
            Clinical procurement catalog with integer-fils multi-tier bundle pricing in KWD.
          </p>
        </div>

        <nav aria-label="Footer links" className="flex flex-wrap items-center gap-6 text-xs font-medium">
          <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">
            Storefront
          </Link>
          <Link to="/cart" className="text-slate-600 hover:text-slate-900 transition-colors">
            Shopping Cart
          </Link>
          <Link to="/admin" className="text-slate-600 hover:text-slate-900 transition-colors">
            Admin Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
