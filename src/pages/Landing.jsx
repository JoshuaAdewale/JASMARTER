import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm mb-4">For owners, tenants & admins</span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Your Property, Managed <span className="underline decoration-amber-300">Smartly</span> While You Travel.
            </h1>
            <p className="mt-4 text-lg text-brand-100 max-w-lg">
              JASMARTA helps migrants and remote owners lease, maintain, and monitor their properties from anywhere in the world.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/register" className="btn bg-white text-brand-700 hover:bg-brand-50">Get started — free</Link>
              <Link to="/properties" className="btn bg-white/10 hover:bg-white/20">Browse properties</Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900" alt="Modern home" className="rounded-2xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: '🏠', title: 'Property Management', desc: 'Add listings, photos, and pricing. Track status across your portfolio.' },
          { icon: '📄', title: 'Leasing System',      desc: 'Tenants apply online. Owners approve or reject in one click.' },
          { icon: '🛠️', title: 'Maintenance Tracking', desc: 'Schedule tasks, report issues, and keep your property in top shape.' },
          { icon: '🔔', title: 'Notifications',        desc: 'Push & email alerts for lease updates, rent reminders, and repairs.' },
          { icon: '💳', title: 'Secure Payments',      desc: 'Stripe-powered rent collection with automated receipts.' },
          { icon: '🛡️', title: 'Admin Panel',           desc: 'Comprehensive dashboard for platform oversight and dispute resolution.' },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="font-semibold mt-3">{f.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} JASMARTA · Built with React, React Native, Node.js, MongoDB.
      </footer>
    </div>
  );
}
