import React, { useState } from 'react';
import { Target, Crosshair, Flame, Clock, MapPin, Star, Plus, Award, Trophy, Calendar, FileText, CreditCard } from 'lucide-react';
import { TopBar, StatCard, colors, fontStack, displayFont } from '../components/Shared';
import { Link, useNavigate } from 'react-router-dom';

export default function MemberDashboard() {
  const navigate = useNavigate();

  const upcomingBookings = [
    { date: "Today", time: "5:00 PM", session: "Open Range - Recurve", club: "Springfield Archery", status: "confirmed" },
    { date: "Wed, Mar 11", time: "11:00 AM", session: "Beginner Workshop", club: "Springfield Archery", status: "confirmed" },
    { date: "Sat, Mar 14", time: "9:00 AM", session: "Tournament Practice", club: "Capital City Bowmen", status: "waitlisted" },
  ];

  const achievements = [
    { icon: Trophy, label: "First Bullseye", date: "Jan 15", color: colors.gold },
    { icon: Flame, label: "7-Day Streak", date: "Mar 2", color: colors.copper },
    { icon: Target, label: "100 Arrows Club", date: "Feb 20", color: colors.forestMid },
    { icon: Award, label: "Precision Shot", date: "Mar 5", color: colors.earth },
  ];

  return (
    <div>
      <TopBar title="Welcome back, Archer" subtitle="Ready to hit the range today?" />

      {/* Quick Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard icon={Crosshair} label="Sessions This Month" value="12" sub="3 more than last month" trend="+33%" accent={colors.forestMid} />
        <StatCard icon={Target} label="Avg. Score" value="267" sub="Out of 300 · Personal best!" accent={colors.gold} />
        <StatCard icon={Flame} label="Current Streak" value="7 days" sub="Keep it going!" accent={colors.copper} />
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <Link to="/member/calendar" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.forestMid}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color={colors.forestMid} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Book a Lane</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Reserve your spot</div>
            </div>
          </div>
        </Link>

        <Link to="/member/events" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.copper}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color={colors.copper} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Tournaments</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Join upcoming events</div>
            </div>
          </div>
        </Link>

        <Link to="/member/waiver" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.amber}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} color={colors.amber} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Sign Waiver</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Annual safety form</div>
            </div>
          </div>
        </Link>

        <Link to="/member/purchase-membership" style={{ textDecoration: 'none' }}>
          <div style={{ background: colors.cream, padding: 20, borderRadius: 14, border: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${colors.gold}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={24} color={colors.gold} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: colors.forestDeep, fontSize: 15 }}>Membership</div>
              <div style={{ fontSize: 12, color: colors.earth }}>Pay annual dues</div>
            </div>
          </div>
        </Link>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {/* Upcoming Bookings */}
        <div style={{ flex: 2, minWidth: 300, background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Upcoming Sessions</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => navigate('/member/waiver')}
                style={{
                  padding: "7px 16px", borderRadius: 8, border: `1px solid ${colors.sand}`, fontSize: 12,
                  background: colors.sandLight, color: colors.forestDeep, fontWeight: 600, cursor: "pointer", fontFamily: fontStack,
                }}
              >
                Sign Waiver
              </button>
              <button 
                onClick={() => navigate('/member/calendar')}
                style={{
                  padding: "7px 16px", borderRadius: 8, border: "none", fontSize: 12,
                  background: `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})`,
                  color: colors.cream, fontWeight: 600, cursor: "pointer", fontFamily: fontStack,
                  display: "flex", alignItems: "center", gap: 6,
                }}><Plus size={14} /> Book Session</button>
            </div>
          </div>
          {upcomingBookings.map((b, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 0",
              borderBottom: i < upcomingBookings.length - 1 ? `1px solid ${colors.sand}` : "none",
            }}>
              <div style={{
                minWidth: 56, textAlign: "center", padding: "8px 0", borderRadius: 8,
                background: b.date === "Today" ? `${colors.forestMid}12` : colors.sandLight,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: b.date === "Today" ? colors.forestMid : colors.earth, textTransform: "uppercase" }}>
                  {b.date === "Today" ? "Today" : b.date.split(",")[0]}
                </div>
                {b.date !== "Today" && <div style={{ fontSize: 10, color: colors.slate }}>{b.date.split(",")[1]}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.forestDeep }}>{b.session}</div>
                <div style={{ fontSize: 12, color: colors.earth, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={11} /> {b.time} · {b.club}
                </div>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: b.status === "confirmed" ? `${colors.greenGood}12` : `${colors.gold}12`,
                color: b.status === "confirmed" ? colors.greenGood : colors.amber,
                textTransform: "capitalize",
              }}>{b.status}</span>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div style={{ flex: 1, minWidth: 250, background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Achievements</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {achievements.map((a, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 10, background: `${a.color}08`,
                border: `1px solid ${a.color}15`, textAlign: "center",
                transition: "transform 0.15s",
                cursor: "default",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <a.icon size={22} color={a.color} strokeWidth={1.8} style={{ margin: '0 auto' }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: colors.forestDeep, marginTop: 8 }}>{a.label}</div>
                <div style={{ fontSize: 10, color: colors.earth, marginTop: 2 }}>{a.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby Clubs */}
      <div style={{ background: colors.cream, borderRadius: 14, padding: 28, border: `1px solid ${colors.sand}` }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: colors.forestDeep }}>Nearby Clubs</h3>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: colors.earth }}>Based on your location</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { name: "Springfield Archery", dist: "2.4 km", rating: "4.8", sessions: "12 today" },
            { name: "Capital City Bowmen", dist: "8.1 km", rating: "4.6", sessions: "8 today" },
            { name: "Evergreen Archery", dist: "15 km", rating: "4.9", sessions: "6 today" },
          ].map((c, i) => (
            <div key={i} style={{
              flex: 1, minWidth: 200, padding: 18, borderRadius: 12, border: `1px solid ${colors.sand}`,
              background: colors.sandPale, cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.forestMid; e.currentTarget.style.boxShadow = `0 4px 16px ${colors.neon}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.sand; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.forestDeep, marginBottom: 6 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: colors.earth, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <MapPin size={12} /> {c.dist}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: colors.gold, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><Star size={11} /> {c.rating}</span>
                <span style={{ color: colors.slate }}>{c.sessions}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
