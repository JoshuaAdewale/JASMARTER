import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [tx, setTx] = useState([]);

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setStats(r.data));
    api.get('/admin/transactions').then((r) => setTx(r.data));
  }, []);

  if (!stats) return <p className="p-10 text-slate-500">Loading dashboard…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats.counts).map(([k, v]) => (
          <div key={k} className="card p-5">
            <p className="text-xs text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-3xl font-bold mt-1">{v}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Leases by status</h2>
        <div className="flex flex-wrap gap-2">
          {stats.leasesByStatus.map((row) => (
            <span key={row._id} className="badge bg-slate-100 text-slate-700">{row._id}: {row.count}</span>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Recent transactions</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="py-1">Tenant</th><th>Property</th><th>Amount</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {tx.map((t) => (
              <tr key={t.stripePaymentIntentId || Math.random()} className="border-t border-slate-100">
                <td className="py-2">{t.tenant?.firstName} {t.tenant?.lastName}</td>
                <td>{t.property?.title}</td>
                <td>${t.amount}</td>
                <td><span className="badge bg-slate-100 text-slate-700">{t.status}</span></td>
                <td>{new Date(t.paidAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {tx.length === 0 && <tr><td colSpan="5" className="py-3 text-slate-500">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
