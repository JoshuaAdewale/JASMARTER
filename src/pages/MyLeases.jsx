import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchMyLeases, decideLease } from '../store/slices/leaseSlice';
import api from '../services/api';

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  terminated: 'bg-slate-200 text-slate-700',
  completed: 'bg-slate-200 text-slate-700',
};

export default function MyLeases() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.leases);
  const [paying, setPaying] = useState(null);

  useEffect(() => { dispatch(fetchMyLeases()); }, [dispatch]);

  const decide = async (id, action) => {
    await dispatch(decideLease({ id, action }));
    toast.success(`Lease ${action}d`);
  };

  const payRent = async (lease) => {
    setPaying(lease._id);
    try {
      const { data } = await api.post('/payments/create-intent', { leaseId: lease._id, amount: lease.monthlyRent });
      // MVP: the production version would mount Stripe Elements here using the clientSecret.
      // For the scaffold we mark the lease paid directly.
      await api.post('/payments/confirm', { leaseId: lease._id, paymentIntentId: data.paymentIntentId, status: 'succeeded' });
      toast.success('Rent marked as paid (MVP flow). Add Stripe Elements for real payments.');
      dispatch(fetchMyLeases());
    } catch (e) {
      toast.error('Payment failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setPaying(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">My leases</h2>
      <div className="mt-4 space-y-3">
        {items.map((l) => (
          <div key={l._id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{l.property?.title}</p>
              <p className="text-sm text-slate-500">
                {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()} · ${l.monthlyRent}/mo
              </p>
              {l.message && <p className="text-xs text-slate-500 mt-1">"{l.message}"</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${statusColor[l.status]}`}>{l.status}</span>
              {user.role === 'owner' && l.status === 'pending' && (
                <>
                  <button onClick={() => decide(l._id, 'approve')} className="btn-primary text-xs">Approve</button>
                  <button onClick={() => decide(l._id, 'reject')} className="btn text-xs bg-red-50 text-red-600">Reject</button>
                </>
              )}
              {user.role === 'tenant' && ['approved','active'].includes(l.status) && (
                <button onClick={() => payRent(l)} disabled={paying === l._id} className="btn-primary text-xs">
                  {paying === l._id ? 'Processing…' : 'Pay rent'}
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-slate-500">No leases yet.</p>}
      </div>
    </div>
  );
}
