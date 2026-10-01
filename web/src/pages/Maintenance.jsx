import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ propertyId: '', title: '', description: '', category: 'other', priority: 'medium' });

  const load = async () => {
    const [r1, r2] = await Promise.all([api.get('/maintenance'), api.get('/properties')]);
    setRequests(r1.data);
    setProperties(r2.data);
    if (!form.propertyId && r2.data[0]) setForm((f) => ({ ...f, propertyId: r2.data[0]._id }));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.propertyId) return toast.error('Pick a property');
    await api.post(`/maintenance/${form.propertyId}`, form);
    toast.success('Reported');
    setForm({ ...form, title: '', description: '' });
    load();
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Maintenance</h2>
      <form onSubmit={submit} className="card p-4 mt-4 grid md:grid-cols-2 gap-3">
        <select className="input" value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
          {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input md:col-span-2 min-h-[80px]" placeholder="Describe the issue…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['plumbing','electrical','cleaning','hvac','security','other'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {['low','medium','high','urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn-primary md:col-span-2">Submit request</button>
      </form>

      <div className="mt-6 space-y-3">
        {requests.map((r) => (
          <div key={r._id} className="card p-4">
            <p className="font-semibold">{r.title}</p>
            <p className="text-sm text-slate-600">{r.description}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="badge bg-slate-100 text-slate-700">{r.category}</span>
              <span className="badge bg-amber-100 text-amber-700">{r.priority}</span>
              <span className="badge bg-blue-100 text-blue-700">{r.status}</span>
            </div>
          </div>
        ))}
        {requests.length === 0 && <p className="text-slate-500">No maintenance requests.</p>}
      </div>
    </div>
  );
}
