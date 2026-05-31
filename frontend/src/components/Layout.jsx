import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarDays, Dumbbell, LogOut, Menu, QrCode, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

const nav = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Planning', '/schedule', CalendarDays],
  ['Boutique', '/shop', ShoppingBag],
  ['Scan QR', '/access', QrCode],
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="premium-bg min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-carbon/95 p-5 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-danger shadow-glow">
            <Dumbbell size={22} />
          </div>
          <div>
            <p className="text-lg font-black">Wifak Club</p>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Fitness SaaS</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2">
          {nav.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-danger text-white shadow-glow' : 'text-zinc-300 hover:bg-white/10'}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-carbon/70 px-4 backdrop-blur lg:px-8">
          <button className="rounded bg-white/10 p-2 lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-danger">{user?.role}</p>
            <h1 className="text-xl font-black">Espace {user?.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded bg-white/10 p-2 hover:bg-white/15"><Bell size={20} /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" /></button>
            <div className="hidden rounded border border-white/10 px-3 py-2 text-sm text-zinc-300 sm:block">{user?.email}</div>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="p-4 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
