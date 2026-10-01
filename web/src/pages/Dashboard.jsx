import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="card p-3 h-fit">
        <div className="px-3 py-2">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="font-semibold">{user.firstName} {user.lastName}</p>
          <span className="badge bg-brand-100 text-brand-700 mt-1">{user.role}</span>
        </div>
        <nav className="mt-3 space-y-1 text-sm">
          <NavLink end to="/dashboard" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}>Overview</NavLink>
          {user.role === 'owner' && <NavLink to="/dashboard/properties" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}>My Properties</NavLink>}
          <NavLink to="/dashboard/leases" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}>My Leases</NavLink>
          <NavLink to="/dashboard/maintenance" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}>Maintenance</NavLink>
        </nav>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
