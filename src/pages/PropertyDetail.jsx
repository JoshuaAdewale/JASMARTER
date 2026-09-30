import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../services/api';
import { applyForLease } from '../store/slices/leaseSlice';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0,10));
  const [endDate, setEndDate]     = useState(new Date(Date.now() + 365 * 86400000).toISOString().slice(0,10));
  const [message, setMessage]     = useState('');
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { api.get(`/properties/${id}`).then((r) => setProperty(r.data)).catch(() => navigate('/properties')); }, [id, navigate]);

  if (!property) return <p className="p-10 text-slate-500">Loading…</p>;

  const apply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'tenant') return toast.error('Only tenants can apply for leases.');
    const r = await dispatch(applyForLease({ propertyId: id, payload: { startDate, endDate, message } }));
    if (r.meta.requestStatus === 'fulfilled') toast.success('Application submitted!');
    else toast.error('Could not submit application.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <img src={property.photos[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900'} alt="" className="w-full aspect-video object-cover rounded-2xl" />
        <div>
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <p className="text-slate-500">{property.address.street}, {property.address.city}, {property.address.country}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="badge bg-brand-100 text-brand-700">${property.rentAmount}/mo</span>
            <span className="badge bg-slate-100 text-slate-700">{property.propertyType}</span>
            <span className="badge bg-slate-100 text-slate-700">{property.bedrooms} bd · {property.bathrooms} ba</span>
            <span className="badge bg-slate-100 text-slate-700">{property.sizeSqFt} sqft</span>
          </div>
          <p className="mt-4 text-slate-700 whitespace-pre-line">{property.description}</p>
          {property.amenities?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Amenities</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {property.amenities.map((a) => <span key={a} className="badge bg-brand-50 text-brand-700">{a}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="card p-6 h-fit space-y-3">
        <h2 className="text-lg font-semibold">Apply to lease</h2>
        <p className="text-sm text-slate-600">Owner: {property.owner?.firstName} {property.owner?.lastName}</p>
        <form onSubmit={apply} className="space-y-3">
          <div><label className="text-sm font-medium">Start date</label><input type="date" className="input mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div><label className="text-sm font-medium">End date</label><input type="date" className="input mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Message to owner</label><textarea className="input mt-1 min-h-[80px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the owner about yourself…" /></div>
          <button className="btn-primary w-full">Submit application</button>
        </form>
      </aside>
    </div>
  );
}
