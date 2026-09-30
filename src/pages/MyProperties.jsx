import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchMyProperties, createProperty, updateProperty, deleteProperty } from '../store/slices/propertySlice';
import PropertyForm from '../components/PropertyForm';

export default function MyProperties() {
  const dispatch = useDispatch();
  const { mine, loading } = useSelector((s) => s.properties);
  const [editing, setEditing] = useState(null);

  useEffect(() => { dispatch(fetchMyProperties()); }, [dispatch]);

  const onSubmit = async (payload) => {
    const action = editing ? updateProperty({ id: editing._id, ...payload }) : createProperty(payload);
    const r = await dispatch(action);
    if (r.meta.requestStatus === 'fulfilled') {
      toast.success(editing ? 'Property updated' : 'Property created');
      setEditing(null);
    } else toast.error('Save failed');
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    await dispatch(deleteProperty(id));
    toast.success('Deleted');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">{editing ? 'Edit property' : 'Add a new property'}</h2>
        <div className="mt-4">
          <PropertyForm initial={editing || undefined} onSubmit={onSubmit} submitLabel={editing ? 'Save changes' : 'Create listing'} />
        </div>
        {editing && <button onClick={() => setEditing(null)} className="btn-secondary mt-3">Cancel edit</button>}
      </div>

      <div>
        <h2 className="text-xl font-bold">My listings</h2>
        {loading ? <p className="text-slate-500">Loading…</p> : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mine.map((p) => (
              <div key={p._id} className="card overflow-hidden">
                <img src={p.photos[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600'} className="w-full aspect-[4/3] object-cover" alt="" />
                <div className="p-4">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-slate-500">{p.address.city}, {p.address.country}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="badge bg-brand-100 text-brand-700">${p.rentAmount}/mo</span>
                    <span className="badge bg-slate-100 text-slate-700">{p.status}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditing(p)} className="btn-secondary text-xs">Edit</button>
                    <button onClick={() => onDelete(p._id)} className="btn text-xs bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {mine.length === 0 && <p className="text-slate-500">No properties yet — add your first one above.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
