import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProperties } from '../store/slices/propertySlice';
import { fetchMyLeases } from '../store/slices/leaseSlice';

export default function DashboardOverview() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { mine } = useSelector((s) => s.properties);
  const { items: leases } = useSelector((s) => s.leases);

  useEffect(() => {
    if (user.role === 'owner') dispatch(fetchMyProperties());
    dispatch(fetchMyLeases());
  }, [dispatch, user.role]);

  const stats = [
    { label: 'Properties', value: mine.length },
    { label: 'Leases', value: leases.length },
    { label: 'Active',  value: leases.filter((l) => ['active','approved'].includes(l.status)).length },
    { label: 'Pending', value: leases.filter((l) => l.status === 'pending').length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user.firstName}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
