import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../store/slices/authSlice';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { user, loading, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const submit = async (e) => {
    e.preventDefault();
    const r = await dispatch(login(form));
    if (r.meta.requestStatus === 'fulfilled') toast.success('Welcome back!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="text-sm text-slate-600 mt-1">Welcome back to JASMARTA.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 card p-6">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" className="input mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <p className="text-sm text-slate-600 mt-4">
        New here? <Link to="/register" className="text-brand-600 font-medium">Create an account</Link>
      </p>

      <div className="mt-6 text-xs text-slate-500 card p-3">
        <strong>Demo logins</strong> (after running <code>npm run seed</code>):
        <ul className="mt-1 space-y-0.5">
          <li>admin@jasmarta.app · password</li>
          <li>owner@jasmarta.app · password</li>
          <li>tenant@jasmarta.app · password</li>
        </ul>
      </div>
    </div>
  );
}
