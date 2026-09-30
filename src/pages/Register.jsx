import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../store/slices/authSlice';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'tenant' });
  const { user, loading, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const submit = async (e) => {
    e.preventDefault();
    const r = await dispatch(register(form));
    if (r.meta.requestStatus === 'fulfilled') toast.success('Account created!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="text-sm text-slate-600 mt-1">Join JASMARTA as a property owner or tenant.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 card p-6">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium">First name</label><input className="input mt-1" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
          <div><label className="text-sm font-medium">Last name</label><input className="input mt-1" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
        </div>
        <div><label className="text-sm font-medium">Email</label><input type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        <div><label className="text-sm font-medium">Password</label><input type="password" className="input mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required /></div>
        <div>
          <label className="text-sm font-medium">I am a…</label>
          <select className="input mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="tenant">Tenant (looking to lease)</option>
            <option value="owner">Property owner (list a property)</option>
          </select>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>

      <p className="text-sm text-slate-600 mt-4">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
