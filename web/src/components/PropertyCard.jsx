import { Link } from 'react-router-dom';

const statusBadge = {
  available: 'bg-green-100 text-green-700',
  leased: 'bg-amber-100 text-amber-700',
  under_maintenance: 'bg-orange-100 text-orange-700',
  unlisted: 'bg-slate-200 text-slate-600',
};

export default function PropertyCard({ property }) {
  const cover = property.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
  return (
    <Link to={`/properties/${property._id}`} className="card overflow-hidden hover:shadow-md transition group">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={cover} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
          <span className={`badge ${statusBadge[property.status] || statusBadge.unlisted}`}>{property.status.replace('_',' ')}</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{property.address.city}, {property.address.country}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-brand-700 font-bold">${property.rentAmount}<span className="text-xs font-normal text-slate-500">/mo</span></span>
          <span className="text-xs text-slate-500">{property.bedrooms} bd · {property.bathrooms} ba</span>
        </div>
      </div>
    </Link>
  );
}
