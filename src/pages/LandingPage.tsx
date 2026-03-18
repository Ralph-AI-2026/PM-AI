import { Link } from 'react-router-dom';
import { Wrench, Home, Users, CheckCircle, Clock, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8" />
            <span className="text-2xl font-bold">HROP</span>
          </div>
          <Link
            to="/auth"
            className="px-6 py-2 bg-white text-[var(--color-primary)] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>
        </nav>

        <div className="container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Property maintenance, simplified.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect tenants, landlords, and service providers on one trusted platform.
            </p>
            <Link
              to="/auth"
              className="inline-block px-8 py-4 bg-white text-[var(--color-primary)] rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Value Propositions */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
          Built for everyone in property maintenance
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Tenants */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Home className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">For Tenants</h3>
            <p className="text-gray-600 mb-6">
              Report issues quickly. Upload photos. Track progress. Get help when you need it.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Submit requests in seconds</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Photo documentation</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Real-time status updates</span>
              </li>
            </ul>
          </div>

          {/* Landlords */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">For Landlords</h3>
            <p className="text-gray-600 mb-6">
              Manage properties efficiently. Approve work instantly. Keep tenants happy.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Multi-property dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">AI-powered cost estimates</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Verified service providers</span>
              </li>
            </ul>
          </div>

          {/* Service Providers */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">For Service Providers</h3>
            <p className="text-gray-600 mb-6">
              Find work nearby. Get paid faster. Build your reputation on a platform that works.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Accept jobs on your terms</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Track earnings in real-time</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Build 5-star ratings</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            How HROP works
          </h2>

          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Report the issue</h3>
                <p className="text-gray-600">
                  Tenants submit maintenance requests with photos and details. Our AI analyzes the issue and estimates costs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Landlord approves</h3>
                <p className="text-gray-600">
                  Landlords review requests, check AI estimates, and approve work with one click.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Service provider completes</h3>
                <p className="text-gray-600">
                  Verified professionals accept jobs, complete the work, and get paid. Everyone stays updated in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to simplify property maintenance?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of tenants, landlords, and service providers who trust HROP.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-4 bg-white text-[var(--color-primary)] rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Wrench className="w-6 h-6" />
              <span className="text-xl font-bold text-white">HROP</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} HROP. Property maintenance made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
