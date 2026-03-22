import { Link } from 'react-router-dom';
import { Wrench, Home, Shield, Users, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#060D1A' }}>
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#00D4AA' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: '#00D4AA' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full opacity-6 blur-3xl" style={{ background: '#00D4AA' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-8 h-8" style={{ color: '#00D4AA' }} />
          <span className="text-2xl font-bold text-white">HROP</span>
        </div>
        <Link
          to="/auth"
          className="px-6 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
          style={{ background: '#00D4AA', color: '#060D1A' }}
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <header className="relative z-10 container mx-auto px-6 py-24 md:py-36">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border" style={{ background: 'rgba(0,212,170,0.1)', borderColor: 'rgba(0,212,170,0.3)', color: '#00D4AA' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D4AA' }} />
            Now in beta — Durham Region
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Property maintenance,{' '}
            <span style={{ color: '#00D4AA' }}>simplified.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Connect tenants, landlords, and service providers on one trusted platform. Fix It Fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/auth"
              className="inline-block px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90 shadow-lg text-center"
              style={{ background: '#00D4AA', color: '#060D1A' }}
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="inline-block px-8 py-4 rounded-xl text-lg font-semibold transition-all text-center border"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}
            >
              See How It Works
            </a>
          </div>
        </div>
      </header>

      {/* Value Props */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          Built for everyone in property maintenance
        </h2>
        <p className="text-center mb-16" style={{ color: 'rgba(255,255,255,0.5)' }}>
          One platform. Three roles. Zero friction.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              Icon: Home,
              title: 'For Tenants',
              desc: 'Report issues quickly. Upload photos. Track progress. Get help when you need it.',
              features: ['Submit requests in seconds', 'Photo documentation required', 'Real-time status updates'],
            },
            {
              Icon: Shield,
              title: 'For Landlords',
              desc: 'Manage properties efficiently. Approve work instantly. Keep tenants happy.',
              features: ['Multi-property dashboard', 'AI-powered cost estimates', 'Verified service providers'],
            },
            {
              Icon: Users,
              title: 'For Service Providers',
              desc: 'Find work nearby. Get paid faster. Build your reputation on a platform that works.',
              features: ['Accept jobs on your terms', 'Track earnings in real-time', 'Build 5-star ratings'],
            },
          ].map(({ Icon, title, desc, features }) => (
            <div
              key={title}
              className="rounded-2xl p-8 border transition-all hover:border-opacity-60"
              style={{ background: '#0D1F35', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(0,212,170,0.15)' }}>
                <Icon className="w-6 h-6" style={{ color: '#00D4AA' }} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
              <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
              <ul className="space-y-2">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#00D4AA' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            How HROP works
          </h2>
          <div className="max-w-2xl mx-auto space-y-10">
            {[
              { n: '1', title: 'Report the issue', body: 'Tenants submit maintenance requests with photos (required). Our AI analyzes the issue and estimates costs automatically.' },
              { n: '2', title: 'Landlord approves', body: 'Landlords review requests, check AI estimates, and approve work with one click. Backstop payment ensures jobs never stall.' },
              { n: '3', title: 'Provider completes', body: 'Verified professionals accept jobs, complete the work, and get paid. Everyone stays updated in real-time.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.3)' }}>
                  {n}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.55)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto rounded-2xl p-12 border" style={{ background: '#0D1F35', borderColor: 'rgba(0,212,170,0.2)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to simplify property maintenance?
            </h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              30 days free. No credit card required.
            </p>
            <Link
              to="/auth"
              className="inline-block px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:opacity-90"
              style={{ background: '#00D4AA', color: '#060D1A' }}
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5" style={{ color: '#00D4AA' }} />
            <span className="text-lg font-bold text-white">HROP</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} HROP. Fix It Fast.
          </p>
        </div>
      </footer>
    </div>
  );
}
