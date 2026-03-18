import { useState } from 'react';
import { Users, Search, Filter, Mail, Phone, Calendar, ChevronDown, MoreHorizontal } from 'lucide-react';
import { TopBar, colors, fontStack, displayFont } from '../components/Shared';

const members = [
  { id: 1, name: "Alex Thompson", email: "alex.t@email.com", phone: "(555) 234-5678", type: "Annual", status: "Active", joined: "Jan 12, 2025", lastVisit: "Mar 8, 2026", sessions: 48 },
  { id: 2, name: "Maria Garcia", email: "maria.g@email.com", phone: "(555) 345-6789", type: "Monthly", status: "Active", joined: "Nov 3, 2025", lastVisit: "Mar 7, 2026", sessions: 22 },
  { id: 3, name: "James Wilson", email: "james.w@email.com", phone: "(555) 456-7890", type: "Annual", status: "Active", joined: "Sep 18, 2024", lastVisit: "Mar 9, 2026", sessions: 96 },
  { id: 4, name: "Sarah Chen", email: "sarah.c@email.com", phone: "(555) 567-8901", type: "Monthly", status: "Active", joined: "Feb 1, 2026", lastVisit: "Mar 6, 2026", sessions: 8 },
  { id: 5, name: "David Kim", email: "david.k@email.com", phone: "(555) 678-9012", type: "Annual", status: "Active", joined: "Jun 15, 2025", lastVisit: "Mar 5, 2026", sessions: 34 },
  { id: 6, name: "Emily Roberts", email: "emily.r@email.com", phone: "(555) 789-0123", type: "Drop-in", status: "Active", joined: "Mar 1, 2026", lastVisit: "Mar 4, 2026", sessions: 3 },
  { id: 7, name: "Michael Brown", email: "michael.b@email.com", phone: "(555) 890-1234", type: "Annual", status: "Active", joined: "Apr 22, 2025", lastVisit: "Mar 8, 2026", sessions: 61 },
  { id: 8, name: "Lisa Martinez", email: "lisa.m@email.com", phone: "(555) 901-2345", type: "Monthly", status: "Expired", joined: "Oct 10, 2025", lastVisit: "Feb 15, 2026", sessions: 18 },
  { id: 9, name: "Robert Taylor", email: "robert.t@email.com", phone: "(555) 012-3456", type: "Annual", status: "Active", joined: "Jan 5, 2025", lastVisit: "Mar 9, 2026", sessions: 112 },
  { id: 10, name: "Jennifer Lee", email: "jennifer.l@email.com", phone: "(555) 123-4567", type: "Monthly", status: "Active", joined: "Dec 20, 2025", lastVisit: "Mar 7, 2026", sessions: 14 },
  { id: 11, name: "Chris Anderson", email: "chris.a@email.com", phone: "(555) 234-5679", type: "Annual", status: "Active", joined: "Aug 8, 2024", lastVisit: "Mar 3, 2026", sessions: 78 },
  { id: 12, name: "Amanda White", email: "amanda.w@email.com", phone: "(555) 345-6780", type: "Drop-in", status: "Inactive", joined: "Jul 14, 2025", lastVisit: "Dec 20, 2025", sessions: 5 },
];

export default function ClubAdminMembers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || m.type === filterType;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = members.filter(m => m.status === 'Active').length;
  const expiredCount = members.filter(m => m.status === 'Expired').length;
  const inactiveCount = members.filter(m => m.status === 'Inactive').length;

  return (
    <div style={{ fontFamily: fontStack }}>
      <TopBar title="Members" subtitle={`${members.length} total members · ${activeCount} active`} />

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active', count: activeCount, color: colors.neon },
          { label: 'Expired', count: expiredCount, color: colors.amber },
          { label: 'Inactive', count: inactiveCount, color: colors.red },
        ].map(s => (
          <div key={s.label} style={{
            background: colors.card, borderRadius: 12, padding: '20px 24px',
            border: `1.5px solid ${colors.border}`, flex: 1, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: colors.textPrimary, fontFamily: displayFont }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240,
          background: colors.card, borderRadius: 8, padding: '10px 16px',
          border: `1.5px solid ${colors.border}`,
        }}>
          <Search size={17} color={colors.textMuted} strokeWidth={2.2} />
          <input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 15, color: colors.textPrimary, fontFamily: fontStack, width: '100%', fontWeight: 500,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${colors.border}`,
              background: colors.card, color: colors.textPrimary, fontSize: 14, fontFamily: fontStack,
              fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="All">All Types</option>
            <option value="Annual">Annual</option>
            <option value="Monthly">Monthly</option>
            <option value="Drop-in">Drop-in</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${colors.border}`,
              background: colors.card, color: colors.textPrimary, fontSize: 14, fontFamily: fontStack,
              fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div style={{
        background: colors.card, borderRadius: 12, border: `1.5px solid ${colors.border}`, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.8fr 1fr 1fr 0.8fr 0.6fr',
          padding: '14px 24px', borderBottom: `2px solid ${colors.borderLight}`,
          fontSize: 12, fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase',
          letterSpacing: '0.1em', fontFamily: fontStack,
        }}>
          <div>Member</div>
          <div>Contact</div>
          <div>Type</div>
          <div>Last Visit</div>
          <div>Sessions</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: colors.textMuted, fontSize: 15 }}>
            No members match your search.
          </div>
        ) : (
          filtered.map((m, i) => (
            <div key={m.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1.8fr 1fr 1fr 0.8fr 0.6fr',
              padding: '16px 24px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? `1px solid ${colors.border}` : 'none',
              transition: 'background 0.1s', cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = `${colors.neon}04`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name + Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: `linear-gradient(135deg, ${colors.teal}, ${colors.neon})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: colors.bg, fontFamily: displayFont,
                  flexShrink: 0,
                }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, fontFamily: fontStack }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 500 }}>Joined {m.joined}</div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <div style={{ fontSize: 14, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Mail size={13} strokeWidth={2} /> {m.email}
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={13} strokeWidth={2} /> {m.phone}
                </div>
              </div>

              {/* Type */}
              <div>
                <span style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: m.type === 'Annual' ? `${colors.neon}12` : m.type === 'Monthly' ? `${colors.teal}18` : `${colors.amber}15`,
                  color: m.type === 'Annual' ? colors.neon : m.type === 'Monthly' ? colors.textPrimary : colors.amber,
                  fontFamily: fontStack,
                }}>{m.type}</span>
              </div>

              {/* Last Visit */}
              <div style={{ fontSize: 14, color: colors.textSecondary, fontWeight: 500 }}>{m.lastVisit}</div>

              {/* Sessions */}
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, fontFamily: fontStack }}>{m.sessions}</div>

              {/* Status */}
              <div>
                <span style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: m.status === 'Active' ? `${colors.neon}12` : m.status === 'Expired' ? `${colors.amber}15` : `${colors.red}12`,
                  color: m.status === 'Active' ? colors.neon : m.status === 'Expired' ? colors.amber : colors.red,
                  fontFamily: fontStack,
                }}>{m.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', color: colors.textMuted, fontSize: 13, fontWeight: 600,
      }}>
        <span>Showing {filtered.length} of {members.length} members</span>
      </div>
    </div>
  );
}
