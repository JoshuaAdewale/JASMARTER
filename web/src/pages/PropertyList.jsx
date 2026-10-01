import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../store/slices/propertySlice';
import PropertyCard from '../components/PropertyCard';

export default function PropertyList() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.properties);
  const [filters, setFilters] = useState({ city: '', country: '', minRent: '', maxRent: '', q: '' });

  useEffect(() => {
    const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    dispatch(fetchProperties(cleaned));
  }, [dispatch, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Browse properties</h1>

      <div className="card p-4 mt-6 grid md:grid-cols-5 gap-3">
        <input className="input" placeholder="City"     value={filters.city}    onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <input className="input" placeholder="Country"  value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} />
        <input className="input" placeholder="Min rent" type="number" value={filters.minRent} onChange={(e) => setFilters({ ...filters, minRent: e.target.value })} />
        <input className="input" placeholder="Max rent" type="number" value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} />
        <input className="input" placeholder="Search…"  value={filters.q}       onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
      </div>

      {loading ? <p className="mt-6 text-slate-500">Loading…</p> : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => <PropertyCard key={p._id} property={p} />)}
          {items.length === 0 && <p className="text-slate-500">No properties match your filters.</p>}
        </div>
      )}
    </div>
  );
}
