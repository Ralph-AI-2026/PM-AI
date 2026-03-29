import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    name: 'Starter',
    price: 5,
    units: '1–50 units',
    features: [
      'Maintenance request management',
      'Tenant & landlord portals',
      'Photo documentation',
      'Email notifications',
      'Basic reporting',
    ],
  },
  {
    name: 'Growth',
    price: 9,
    units: '51–200 units',
    popular: true,
    features: [
      'Everything in Starter',
      'AI cost estimates',
      'Priority support',
      'Advanced analytics',
      'Contractor verification',
      'Multi-property management',
    ],
  },
  {
    name: 'Enterprise',
    price: 15,
    units: '200+ units',
    features: [
      'Everything in Growth',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'Bulk onboarding',
      'API access',
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          Simple, transparent pricing
        </h2>
        <p className="text-center mb-16 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Pay per unit, per month. No hidden fees. Plus a flat <strong style={{ color: '#00D4AA' }}>$35 service fee</strong> per accepted maintenance estimate.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {TIERS.map(tier => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 border transition-all relative ${
                tier.popular ? 'border-opacity-100 scale-105' : 'border-opacity-30'
              }`}
              style={{
                background: '#0D1F35',
                borderColor: tier.popular ? '#00D4AA' : 'rgba(255,255,255,0.08)',
              }}
            >
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ background: '#00D4AA', color: '#060D1A' }}
                >
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{tier.units}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${tier.price}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>/unit/month</span>
              </div>

              <Link
                to="/auth"
                className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all mb-8 ${
                  tier.popular
                    ? 'hover:opacity-90'
                    : 'hover:opacity-80 border'
                }`}
                style={
                  tier.popular
                    ? { background: '#00D4AA', color: '#060D1A' }
                    : { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }
                }
              >
                Get Started
              </Link>

              <ul className="space-y-3">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#00D4AA' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center mt-12 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          All plans include a $35 flat service fee charged per accepted maintenance estimate. No markup on contractor costs.
        </p>
      </div>
    </section>
  );
}
