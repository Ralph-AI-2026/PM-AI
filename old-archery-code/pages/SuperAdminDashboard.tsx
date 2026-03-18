import React, { useState } from 'react';
import { 
  DollarSign, Building, Users, Activity, ArrowUpRight, ArrowDownRight, 
  AlertTriangle, Bell, Download, Calendar, Search, Settings, 
  TrendingUp, ShieldAlert, CreditCard, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { TopBar, StatCard, colors, fontStack, displayFont } from '../components/Shared';

// --- MOCK DATA ---
const revenueData = [
  { month: 'Oct', subscriptions: 12000, transactions: 4500, events: 2000, onboarding: 1000 },
  { month: 'Nov', subscriptions: 14500, transactions: 5200, events: 1500, onboarding: 2000 },
  { month: 'Dec', subscriptions: 16000, transactions: 4800, events: 3000, onboarding: 500 },
  { month: 'Jan', subscriptions: 18500, transactions: 6100, events: 2500, onboarding: 1500 },
  { month: 'Feb', subscriptions: 21000, transactions: 7500, events: 4000, onboarding: 3000 },
  { month: 'Mar', subscriptions: 24500, transactions: 8200, events: 3500, onboarding: 2000 },
];

const mrrWaterfallData = [
  { name: 'Starting MRR', value: 21000, fill: "#88a898" },
  { name: 'New', value: 4500, fill: "#7ed957" },
  { name: 'Expansion', value: 1200, fill: "#1a8a6e" },
  { name: 'Contraction', value: -800, fill: "#d4a645" },
  { name: 'Churn', value: -1400, fill: "#e05555" },
  { name: 'Ending MRR', value: 24500, fill: "#14705a" },
];

const bookingTrendData = [
  { date: 'Mon', bookings: 145, takeRate: 2.1 },
  { date: 'Tue', bookings: 132, takeRate: 2.1 },
  { date: 'Wed', bookings: 168, takeRate: 2.2 },
  { date: 'Thu', bookings: 190, takeRate: 2.2 },
  { date: 'Fri', bookings: 245, takeRate: 2.3 },
  { date: 'Sat', bookings: 380, takeRate: 2.4 },
  { date: 'Sun', bookings: 310, takeRate: 2.4 },
];

const clubDirectory = [
  { id: 1, name: 'Springfield Archery Club', location: 'Springfield, IL', tier: 'Pro', members: 142, bookings: 450, ytdRev: 42500, mrr: 250, health: 92, stripe: 'Active', lastBooking: '2 mins ago' },
  { id: 2, name: 'Capital City Bowmen', location: 'Austin, TX', tier: 'Enterprise', members: 310, bookings: 890, ytdRev: 85200, mrr: 500, health: 98, stripe: 'Active', lastBooking: 'Just now' },
  { id: 3, name: 'Pine Ridge Target Sports', location: 'Denver, CO', tier: 'Basic', members: 85, bookings: 120, ytdRev: 14800, mrr: 99, health: 45, stripe: 'Warning', lastBooking: '2 days ago' },
  { id: 4, name: 'Northwest Archers', location: 'Seattle, WA', tier: 'Pro', members: 210, bookings: 600, ytdRev: 62000, mrr: 250, health: 88, stripe: 'Active', lastBooking: '1 hour ago' },
  { id: 5, name: 'Desert Bowhunters', location: 'Phoenix, AZ', tier: 'Basic', members: 65, bookings: 45, ytdRev: 8500, mrr: 99, health: 32, stripe: 'Suspended', lastBooking: '14 days ago' },
];

const alerts = [
  { id: 1, severity: 'high', message: 'Chargeback Rate > 0.5% for Desert Bowhunters (Stripe account at risk)', time: '2 hours ago' },
  { id: 2, severity: 'high', message: 'Club Health Score < 40 for Desert Bowhunters (High Churn Risk)', time: '1 day ago' },
  { id: 3, severity: 'medium', message: 'No-Show Rate > 15% at Pine Ridge Target Sports', time: '3 days ago' },
];

const PIE_COLORS = ["#7ed957", "#1a8a6e", "#14705a", "#d4a645"];

export default function SuperAdminDashboard() {
  const [dateRange, setDateRange] = useState('30d');
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TopBar title="CFO Financial Console" subtitle="ARC Booking Software — Global Operating Metrics" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: colors.cream, padding: 4, borderRadius: 8, border: `1px solid ${colors.sand}` }}>
            {['7d', '30d', '90d', 'YTD'].map(range => (
              <button 
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: "6px 12px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer", fontFamily: fontStack,
                  background: dateRange === range ? colors.sandLight : "transparent",
                  color: dateRange === range ? colors.forestDeep : colors.earth,
                  transition: "all 0.2s"
                }}
              >
                {range}
              </button>
            ))}
          </div>
          <button style={{
            padding: 8, borderRadius: 8, border: `1px solid ${colors.sand}`, background: colors.cream,
            color: colors.earth, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <div style={{ background: colors.cream, borderRadius: 14, border: `1px solid ${colors.redAlert}40`, overflow: 'hidden', marginBottom: 24 }}>
        <button 
          onClick={() => setAlertsExpanded(!alertsExpanded)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px',
            background: `${colors.redAlert}10`, border: 'none', cursor: 'pointer', fontFamily: fontStack
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Bell color={colors.redAlert} size={20} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, background: colors.redAlert, borderRadius: '50%', border: `2px solid ${colors.cream}` }}></span>
            </div>
            <span style={{ fontWeight: 600, color: colors.redAlert }}>Active System Alerts ({alerts.length})</span>
          </div>
          {alertsExpanded ? <ChevronUp color={colors.redAlert} size={20} /> : <ChevronDown color={colors.redAlert} size={20} />}
        </button>
        
        {alertsExpanded && (
          <div>
            {alerts.map((alert, i) => (
              <div key={alert.id} style={{
                padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
                borderTop: `1px solid ${colors.redAlert}20`, background: colors.cream
              }}>
                {alert.severity === 'high' ? (
                  <ShieldAlert color={colors.redAlert} size={18} style={{ marginTop: 2, flexShrink: 0 }} />
                ) : (
                  <AlertTriangle color={colors.amber} size={18} style={{ marginTop: 2, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: colors.forestDeep }}>{alert.message}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: colors.earth }}>{alert.time} • Click to investigate</p>
                </div>
                <button style={{ background: 'none', border: 'none', color: colors.forestMid, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Resolve</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Row KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard title="Net Revenue" value="$38,200" change="12.5%" isPositive={true} subtitle="Gross: $42,500" icon={DollarSign} label="Net Revenue" trend="+12.5%" accent={colors.forestMid} />
        <StatCard title="MRR" value="$24,500" change="8.2%" isPositive={true} subtitle="ARR: $294,000" icon={TrendingUp} label="MRR" trend="+8.2%" accent={colors.gold} />
        <StatCard title="Active Clubs" value="28" change="2 New" isPositive={true} subtitle="Net Growth: +2" icon={Building} label="Active Clubs" trend="+2" accent={colors.copper} />
        <StatCard title="Active Archers" value="4,120" change="15%" isPositive={true} subtitle="1,850 bookings/wk" icon={Users} label="Active Archers" trend="+15%" accent={colors.earth} />
      </div>

      {/* Main Content Tabs */}
      <div style={{ background: colors.cream, borderRadius: 14, border: `1px solid ${colors.sand}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${colors.sand}`, overflowX: 'auto' }}>
          {[
            { id: 'revenue', label: 'Revenue & MRR', icon: DollarSign },
            { id: 'economics', label: 'Unit Economics', icon: TrendingUp },
            { id: 'bookings', label: 'Booking Analytics', icon: Calendar },
            { id: 'directory', label: 'Club Directory', icon: Building }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px', fontSize: 14, fontWeight: 600,
                border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${colors.forestMid}` : '2px solid transparent',
                background: activeTab === tab.id ? `${colors.forestMid}08` : 'transparent',
                color: activeTab === tab.id ? colors.forestMid : colors.earth,
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: fontStack
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {/* REVENUE & MRR TAB */}
          {activeTab === 'revenue' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
                {/* Revenue Decomposition */}
                <div>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Revenue Decomposition (YTD)</h3>
                  <div style={{ height: 320, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 16, background: colors.sandPale }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.sand} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: colors.earth, fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{fill: colors.earth, fontSize: 12}} />
                        <RechartsTooltip cursor={{fill: `${colors.neon}10`}} formatter={(value) => `$${value}`} contentStyle={{borderRadius: 8, border: '1px solid #1e1e1e', background: '#0a0a0a', color: '#e4efe8', fontFamily: fontStack}} />
                        <Legend wrapperStyle={{fontSize: 12, fontFamily: fontStack, color: colors.earth}} />
                        <Bar dataKey="subscriptions" name="Subscriptions" stackId="a" fill="#7ed957" />
                        <Bar dataKey="transactions" name="Transaction Fees" stackId="a" fill="#1a8a6e" />
                        <Bar dataKey="events" name="Events/Tournaments" stackId="a" fill="#14705a" />
                        <Bar dataKey="onboarding" name="Onboarding Fees" stackId="a" fill="#d4a645" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* MRR Waterfall */}
                <div>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>MRR Movement (This Month)</h3>
                  <div style={{ height: 320, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 16, background: colors.sandPale }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mrrWaterfallData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.sand} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: colors.earth, fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{fill: colors.earth, fontSize: 12}} />
                        <RechartsTooltip cursor={{fill: `${colors.neon}10`}} formatter={(value) => `$${value}`} contentStyle={{borderRadius: 8, border: '1px solid #1e1e1e', background: '#0a0a0a', color: '#e4efe8', fontFamily: fontStack}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {mrrWaterfallData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Quick Ratios */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, paddingTop: 16, borderTop: `1px solid ${colors.sand}` }}>
                <div style={{ padding: 16, background: colors.sandPale, borderRadius: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: colors.earth }}>Quick Ratio</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.forestDeep }}>2.6</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: colors.amber, fontWeight: 600 }}>Target: &gt;4.0 (Needs Improvement)</p>
                </div>
                <div style={{ padding: 16, background: colors.sandPale, borderRadius: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: colors.earth }}>Net Revenue Retention (NRR)</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.forestDeep }}>104%</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: colors.greenGood, fontWeight: 600 }}>Target: &gt;100% (Healthy)</p>
                </div>
                <div style={{ padding: 16, background: colors.sandPale, borderRadius: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: colors.earth }}>Gross Revenue Churn</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.forestDeep }}>2.1%</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: colors.greenGood, fontWeight: 600 }}>Target: &lt;3% (Healthy)</p>
                </div>
                <div style={{ padding: 16, background: colors.sandPale, borderRadius: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: colors.earth }}>Platform Take Rate</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.forestDeep }}>2.4%</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: colors.slate }}>Blended average</p>
                </div>
              </div>
            </div>
          )}

          {/* UNIT ECONOMICS TAB */}
          {activeTab === 'economics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                <div style={{ background: colors.sandPale, padding: 24, borderRadius: 12, border: `1px solid ${colors.sand}`, textAlign: 'center' }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: colors.earth }}>Customer Acquisition Cost (CAC)</p>
                  <h3 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: colors.forestDeep }}>$450</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.earth }}>Per onboarded club</p>
                </div>
                <div style={{ background: colors.sandPale, padding: 24, borderRadius: 12, border: `1px solid ${colors.sand}`, textAlign: 'center' }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: colors.earth }}>Customer Lifetime Value (LTV)</p>
                  <h3 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: colors.forestDeep }}>$14,200</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.earth }}>Based on 2.1% churn</p>
                </div>
                <div style={{ background: `${colors.forestMid}10`, padding: 24, borderRadius: 12, border: `1px solid ${colors.forestMid}30`, textAlign: 'center' }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: colors.forestMid }}>LTV:CAC Ratio</p>
                  <h3 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: colors.forestMid }}>31:1</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.forestMid }}>Exceptional (Target &gt;3:1)</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
                <div>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Revenue Concentration (Top 5 Clubs)</h3>
                  <div style={{ height: 260, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 16, background: colors.sandPale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Capital City Bowmen', value: 85200 },
                            { name: 'Northwest Archers', value: 62000 },
                            { name: 'Springfield Archery', value: 42500 },
                            { name: 'Other 25 Clubs', value: 104300 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {PIE_COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => `$${value}`} contentStyle={{borderRadius: 8, border: '1px solid #1e1e1e', background: '#0a0a0a', color: '#e4efe8', fontFamily: fontStack}} />
                        <Legend wrapperStyle={{fontSize: 12, fontFamily: fontStack, color: colors.earth}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: colors.earth, textAlign: 'center' }}>Top 3 clubs account for 64% of revenue (High Risk)</p>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Months to Payback CAC</h3>
                  <div style={{ height: 260, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 24, background: colors.sandPale, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: colors.earth }}>Average Payback Period</span>
                      <span style={{ fontWeight: 700, color: colors.forestMid }}>1.2 Months</span>
                    </div>
                    <div style={{ width: '100%', background: colors.sand, borderRadius: 8, height: 16, marginBottom: 24, overflow: 'hidden' }}>
                      <div style={{ background: colors.forestMid, height: '100%', width: '10%' }}></div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: colors.slate, lineHeight: 1.6 }}>
                      With an average revenue per club (ARPC) of $875/mo and a CAC of $450, clubs become profitable for the platform in just over 1 month. This indicates we can afford to spend significantly more on marketing and acquisition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Booking Volume & Take Rate (7 Days)</h3>
                <div style={{ height: 320, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 16, background: colors.sandPale }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={bookingTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.sand} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: colors.earth, fontSize: 12}} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: colors.earth, fontSize: 12}} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} tick={{fill: colors.earth, fontSize: 12}} />
                      <RechartsTooltip cursor={{fill: `${colors.neon}10`}} contentStyle={{borderRadius: 8, border: '1px solid #1e1e1e', background: '#0a0a0a', color: '#e4efe8', fontFamily: fontStack}} />
                      <Legend wrapperStyle={{fontSize: 12, fontFamily: fontStack, color: colors.earth}} />
                      <Bar yAxisId="left" dataKey="bookings" name="Total Bookings" fill="#1a8a6e" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="takeRate" name="Effective Take Rate %" stroke="#7ed957" strokeWidth={3} dot={{r: 4}} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Booking Economics</h3>
                <div style={{ background: colors.sandPale, borderRadius: 12, border: `1px solid ${colors.sand}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: colors.earth }}>Gross Booking Value (GBV)</p>
                    <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: colors.forestDeep }}>$42,850</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.forestMid, fontWeight: 600 }}>+14% vs last week</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: colors.earth }}>Average Booking Value (ABV)</p>
                    <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.forestDeep }}>$27.50</p>
                  </div>
                  <div style={{ paddingTop: 16, borderTop: `1px solid ${colors.sand}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: colors.slate }}>Cancellation Rate</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors.forestDeep }}>4.2%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: colors.slate }}>No-Show Rate</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors.amber }}>8.5%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: colors.slate }}>Refund Volume</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors.forestDeep }}>$1,240</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLUB DIRECTORY TAB */}
          {activeTab === 'directory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Club Directory & Health</h3>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: colors.slate }} size={16} />
                  <input 
                    type="text" 
                    placeholder="Search clubs..." 
                    style={{
                      padding: '8px 16px 8px 36px', border: `1px solid ${colors.sand}`, borderRadius: 8, fontSize: 13,
                      fontFamily: fontStack, width: 240, outline: 'none', background: colors.sandLight
                    }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: `1px solid ${colors.sand}`, borderRadius: 12 }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: colors.sandPale, color: colors.earth, borderBottom: `1px solid ${colors.sand}` }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Club Name & Location</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tier</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Members</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>YTD Rev</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>MRR</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Health</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stripe Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubDirectory.map((club, i) => (
                      <tr key={club.id} style={{ borderBottom: i < clubDirectory.length - 1 ? `1px solid ${colors.sand}` : 'none', background: colors.cream }}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ margin: 0, fontWeight: 600, color: colors.forestDeep }}>{club.name}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: colors.earth }}>{club.location}</p>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 8px', background: colors.sandLight, color: colors.earth, borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            {club.tier}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: colors.forestDeep }}>{club.members}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: colors.forestDeep }}>${club.ytdRev.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: colors.forestDeep }}>${club.mrr}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <div style={{ width: 64, background: colors.sand, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  height: '100%', 
                                  background: club.health > 80 ? colors.greenGood : club.health > 50 ? colors.amber : colors.redAlert,
                                  width: `${club.health}%` 
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: colors.forestDeep, width: 24 }}>{club.health}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content',
                            background: club.stripe === 'Active' ? `${colors.greenGood}15` : club.stripe === 'Warning' ? `${colors.amber}15` : `${colors.redAlert}15`,
                            color: club.stripe === 'Active' ? colors.greenGood : club.stripe === 'Warning' ? colors.amber : colors.redAlert
                          }}>
                            {club.stripe === 'Active' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {club.stripe}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button style={{ background: 'none', border: 'none', color: colors.forestMid, fontWeight: 600, fontSize: 12, cursor: 'pointer', marginRight: 12 }}>Financials</button>
                          <button style={{ background: 'none', border: 'none', color: colors.earth, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper icon for the table
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
