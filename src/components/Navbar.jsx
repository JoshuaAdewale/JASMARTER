import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 grid place-items-center text-white font-bold">J</div>
          <span className="font-bold text-lg tracking-tight">JASMARTA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <Link to="/properties" className="hover:text-slate-900">Browse</Link>
          {user?.role === 'owner' && <Link to="/dashboard/properties" className="hover:text-slate-900">My Properties</Link>}
          {user && <Link to="/dashboard/leases" className="hover:text-slate-900">My Leases</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-slate-900">Admin</Link>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-500 hidden sm:inline">
                Hi, {user.firstName} <span className="badge bg-brand-100 text-brand-700 ml-1">{user.role}</span>
              </span>
              <button onClick={onLogout} className="btn-secondary text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
