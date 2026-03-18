import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, Star, Plus, ShieldCheck, Target, PieChart, CheckCircle2, AlertCircle } from 'lucide-react';
import { TopBar, StatCard, MiniBar, colors, fontStack } from '../components/Shared';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function ClubAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stripeStatus, setStripeStatus] = useState<'not_connected' | 'pending' | 'connected'>('not_connected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL params for Stripe return
  useEffect(() => {
    const isReturn = searchParams.get('stripe_return');
    const accountId = searchParams.get('account_id');

    if (isReturn && accountId) {
      verifyStripeAccount(accountId);
    }
  }, [searchParams]);

  const verifyStripeAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stripe/verify/${accountId}`);
      const data = await res.json();
      
      if (data.isComplete) {
        setStripeStatus('connected');
      } else {
        setStripeStatus('pending');
        setError('Stripe onboarding is incomplete. Please try again.');
      }
    } catch (err: any) {
      setError('Failed to verify Stripe account.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/onboard', { method: 'POST' });
      const data = await res.json();
      
      if (data.url) {
        // Redirect to Stripe hosted onboarding
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setError('Failed to initiate Stripe connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const todaySchedule = [
    { time: "9:00 AM", name: "Open Range - Recurve", spots: "8/12", coach: "Mike T." },
    { time: "11:00 AM", name: "Beginner Workshop", spots: "14/15", coach: "Sarah K." },
    { time: "2:00 PM", name: "Compound Training", spots: "6/10", coach: "Dave R." },
    { time: "5:00 PM", name: "Youth League Practice", spots: "18/20", coach: "Lisa M." },
  ];

  const recentMembers = [
    { name: "Alex Thompson", joined: "2 days ago", type: "Monthly" },
    { name: "Maria Garcia", joined: "5 days ago", type: "Drop-in" },
    { name: "James Wilson", joined: "1 week ago", type: "Annual" },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TopBar title="Club Dashboard" subtitle="Springfield Archery Club · Springfield, IL" />
        <div style={{ display: 'flex', gap: '10px' }}>
          {stripeStatus === 'connected' ? (
            <div style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${colors.greenGood}`, background: `${colors.greenGood}15`, color: colors.greenGood, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={16} /> Stripe Connected
            </div>
          ) : (
            <button 
              onClick={handleConnectStripe}
              disabled={isLoading}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13,
                background: `linear-gradient(135deg, ${colors.copper}, ${colors.copper}dd)`,
                color: colors.cream, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: fontStack,
                display: "flex", alignItems: "center", gap: 6, opacity: isLoading ? 0.7 : 1
              }}
            >
              <DollarSign size={16} /> {isLoading ? 'Connecting...' : 'Connect Stripe'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: `${colors.redAlert}15`, border: `1px solid ${colors.redAlert}30`, color: colors.redAlert, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard icon={Users} label="Active Members" value="142" sub="12 new this month" trend="+8%" accent={colors.forestMid} />
        <StatCard icon={DollarSign} label="Monthly Revenue" value="$8,420" sub="vs $7,200 last month" trend="17%" accent={colors.gold} />
        <StatCard icon={Calendar} label="Bookings Today" value="46" sub="8 sessions scheduled" accent={colors.copper} />
        <StatCard icon={Star} label="Rating" value="4.8" sub="Based on 89 reviews" accent={colors.earth} />
      </div>

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <Link to="/club-admin/calendar" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.forestMid}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color={colors.forestMid} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Manage Schedule</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Lanes & availability</div>
            </div>
          </div>
        </Link>

        <Link to="/club-admin/events" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.copper}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color={colors.copper} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Manage Events</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Tournaments & classes</div>
            </div>
          </div>
        </Link>

        <Link to="/club-admin/financials" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.gold}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={24} color={colors.gold} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Financials</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Revenue & payouts</div>
            </div>
          </div>
        </Link>

        <Link to="/club-admin/waiver-settings" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.amber}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color={colors.amber} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Waiver Settings</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Liability requirements</div>
            </div>
          </div>
        </Link>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {/* Today's Schedule */}
        <div style={{ flex: 2, minWidth: 300, background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Today's Schedule</h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.earth }}>4 sessions remaining</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{
                padding: "7px 16px", borderRadius: 8, border: "none", fontSize: 12,
                background: `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
                color: colors.cream, fontWeight: 600, cursor: "pointer", fontFamily: fontStack,
                display: "flex", alignItems: "center", gap: 6,
              }}><Plus size={14} /> Add Session</button>
            </div>
          </div>
          {todaySchedule.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 0",
              borderBottom: i < todaySchedule.length - 1 ? `1px solid ${colors.sand}` : "none",
            }}>
              <div style={{
                width: 50, textAlign: "center", fontSize: 12, fontWeight: 600,
                color: colors.forestMid, background: `${colors.forestMid}08`, padding: "6px 0", borderRadius: 6,
              }}>{s.time}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.forestDeep }}>{s.name}</div>
                <div style={{ fontSize: 12, color: colors.earth }}>Coach: {s.coach}</div>
              </div>
              <div style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: `${colors.forestMid}10`, color: colors.forestMid,
              }}>{s.spots} spots</div>
            </div>
          ))}
        </div>

        {/* Recent Members */}
        <div style={{ flex: 1, minWidth: 250, background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>New Members</h3>
          {recentMembers.map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
              borderBottom: i < recentMembers.length - 1 ? `1px solid ${colors.sand}` : "none",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.forestMid}, ${colors.sage})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: colors.cream, fontSize: 12, fontWeight: 700,
              }}>{m.name.split(" ").map(n => n[0]).join("")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.forestDeep }}>{m.name}</div>
                <div style={{ fontSize: 11, color: colors.earth }}>{m.joined}</div>
              </div>
              <span style={{
                padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                background: `${colors.gold}15`, color: colors.amber,
              }}>{m.type}</span>
            </div>
          ))}
          <button style={{
            width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${colors.sand}`,
            background: colors.sandLight, fontSize: 12, cursor: "pointer", color: colors.forestMid,
            fontWeight: 600, marginTop: 16, fontFamily: fontStack,
          }}>View All Members</button>
        </div>
      </div>

      {/* Revenue chart placeholder */}
      <div style={{ background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Revenue Trend</h3>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: colors.earth }}>Last 7 days</p>
        <MiniBar data={[
          { label: "Mon", value: 1200 }, { label: "Tue", value: 980 }, { label: "Wed", value: 1400 },
          { label: "Thu", value: 1100 }, { label: "Fri", value: 1800 }, { label: "Sat", value: 2200 }, { label: "Sun", value: 1900 },
        ]} height={90} />
      </div>
    </div>
  );
}
