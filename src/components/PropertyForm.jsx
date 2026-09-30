import { useState } from 'react';

const empty = {
  title: '', description: '',
  address: { street: '', city: '', state: '', country: '', postalCode: '' },
  propertyType: 'apartment',
  bedrooms: 1, bathrooms: 1, sizeSqFt: 0,
  rentAmount: 0, currency: 'USD',
  photos: [], amenities: [],
  availableFrom: new Date().toISOString().slice(0, 10),
};

/**
 * Reusable property form for create + edit.
 */
export default function PropertyForm({ initial = empty, onSubmit, submitLabel = 'Save property' }) {
  const [form, setForm] = useState({ ...empty, ...initial, address: { ...empty.address, ...(initial.address || {}) } });
  const [photoInput, setPhotoInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setAddress = (key, val) => setForm((f) => ({ ...f, address: { ...f.address, [key]: val } }));

  const addPhoto = () => { if (photoInput) { set('photos', [...form.photos, photoInput]); setPhotoInput(''); } };
  const addAmenity = () => { if (amenityInput) { set('amenities', [...form.amenities, amenityInput]); setAmenityInput(''); } };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      rentAmount: Number(form.rentAmount),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sizeSqFt: Number(form.sizeSqFt),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 card p-6">
      <div>
        <label className="text-sm font-medium">Title</label>
        <input className="input mt-1" value={form.title} onChange={(e) => set('title', e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea className="input mt-1 min-h-[100px]" value={form.description} onChange={(e) => set('description', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><label className="text-sm font-medium">Street</label><input className="input mt-1" value={form.address.street} onChange={(e) => setAddress('street', e.target.value)} required /></div>
        <div><label className="text-sm font-medium">City</label><input className="input mt-1" value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} required /></div>
        <div><label className="text-sm font-medium">State</label><input className="input mt-1" value={form.address.state} onChange={(e) => setAddress('state', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Country</label><input className="input mt-1" value={form.address.country} onChange={(e) => setAddress('country', e.target.value)} required /></div>
        <div><label className="text-sm font-medium">Postal Code</label><input className="input mt-1" value={form.address.postalCode} onChange={(e) => setAddress('postalCode', e.target.value)} /></div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select className="input mt-1" value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
            {['apartment','house','condo','commercial','studio','other'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="text-sm font-medium">Bedrooms</label><input type="number" min="0" className="input mt-1" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Bathrooms</label><input type="number" min="0" className="input mt-1" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Size (sqft)</label><input type="number" min="0" className="input mt-1" value={form.sizeSqFt} onChange={(e) => set('sizeSqFt', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Rent / month</label><input type="number" min="0" className="input mt-1" value={form.rentAmount} onChange={(e) => set('rentAmount', e.target.value)} required /></div>
      </div>

      <div>
        <label className="text-sm font-medium">Photos (URLs)</label>
        <div className="flex gap-2 mt-1">
          <input className="input" value={photoInput} onChange={(e) => setPhotoInput(e.target.value)} placeholder="https://..." />
          <button type="button" onClick={addPhoto} className="btn-secondary">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.photos.map((p, i) => <span key={i} className="badge bg-slate-100 text-slate-700">{p.slice(0,40)}…</span>)}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Amenities</label>
        <div className="flex gap-2 mt-1">
          <input className="input" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} placeholder="wifi" />
          <button type="button" onClick={addAmenity} className="btn-secondary">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.amenities.map((a, i) => <span key={i} className="badge bg-brand-100 text-brand-700">{a}</span>)}
        </div>
      </div>

      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
