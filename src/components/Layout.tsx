import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Building2, Shield, ChevronRight, ChevronLeft, Settings,
  LogOut, Menu, X, BarChart3,
  Activity, Users, Calendar, DollarSign
} from "lucide-react";
import { ARCLogo, colors, fontStack, displayFont } from "./Shared";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active role based on path
  let activeRole = "club";
  if (location.pathname.startsWith("/super-admin")) activeRole = "super";

  const roles = [
    { key: "club", label: "CLUB ADMIN", icon: Building2, path: "/club-admin" },
    { key: "super", label: "SUPER ADMIN", icon: Shield, path: "/super-admin" },
  ];

  const navSections: Record<string, any[]> = {
    club: [
      { key: "overview", label: "Overview", icon: BarChart3, path: "/club-admin" },
      { key: "waivers", label: "Waiver Settings", icon: Shield, path: "/club-admin/waiver-settings" },
      { key: "members", label: "Members", icon: Users, path: "/club-admin/members" },
      { key: "schedule", label: "Schedule", icon: Calendar, path: "/club-admin/calendar" },
      { key: "revenue", label: "Revenue", icon: DollarSign, path: "/club-admin" },
    ],
    super: [
      { key: "overview", label: "Overview", icon: Activity, path: "/super-admin" },
      { key: "clubs", label: "Club Directory", icon: Building2, path: "/super-admin" },
      { key: "analytics", label: "Analytics", icon: BarChart3, path: "/super-admin" },
      { key: "settings", label: "Platform Settings", icon: Settings, path: "/super-admin" },
    ],
  };

  return (
    <div style={{
      fontFamily: fontStack,
      color: colors.textPrimary,
      background: colors.bgMid,
      minHeight: "100vh",
      display: "flex",
      height: "100vh",
      overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{
        width: collapsed ? 74 : 270,
        background: `linear-gradient(178deg, ${colors.bg} 0%, ${colors.bgMid} 100%)`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        borderRight: `1px solid ${colors.border}`,
      }}>
        {/* Neon accent edge */}
        <div style={{
          position: "absolute", top: 0, right: 0, width: 2, height: "100%",
          background: `linear-gradient(180deg, ${colors.neon}60 0%, transparent 30%, ${colors.teal}40 70%, ${colors.neon}30 100%)`,
        }} />
        {/* Subtle grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.015,
          backgroundImage: `
            linear-gradient(${colors.neon}20 1px, transparent 1px),
            linear-gradient(90deg, ${colors.neon}20 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{
          padding: collapsed ? "16px 11px" : "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <ARCLogo size={collapsed ? 42 : 50} />
          {!collapsed && (
            <div>
              <div style={{ display: "flex", gap: 2 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: colors.teal, fontFamily: displayFont, letterSpacing: "0.08em", lineHeight: 1 }}>A</span>
                <span style={{ fontSize: 30, fontWeight: 900, color: colors.neon, fontFamily: displayFont, letterSpacing: "0.08em", lineHeight: 1 }}>RC</span>
              </div>
              <div style={{
                fontSize: 11, color: colors.textMuted, letterSpacing: "0.35em",
                textTransform: "uppercase", fontWeight: 700, fontFamily: fontStack, marginTop: 2,
              }}>BOOKING</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            marginLeft: "auto", background: `${colors.neon}08`, border: `1px solid ${colors.border}`,
            borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: colors.textMuted, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${colors.neon}15`; e.currentTarget.style.color = colors.neon; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${colors.neon}08`; e.currentTarget.style.color = colors.textMuted; }}
          >{collapsed ? <Menu size={16} /> : <X size={16} />}</button>
        </div>

        {/* Roles */}
        <div style={{ padding: collapsed ? "18px 10px" : "18px 18px" }}>
          {!collapsed && <div style={{
            fontSize: 11, color: colors.textMuted, letterSpacing: "0.2em", fontWeight: 700,
            marginBottom: 10, paddingLeft: 6, fontFamily: fontStack,
          }}>ROLE VIEW</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {roles.map(r => {
              const on = activeRole === r.key;
              return (
                <button key={r.key} onClick={() => navigate(r.path)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: collapsed ? "12px" : "12px 16px", borderRadius: 8,
                  background: on ? `${colors.neon}10` : "transparent",
                  border: on ? `1.5px solid ${colors.neon}30` : "1.5px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: on ? colors.neon : colors.textMuted, position: "relative",
                }}
                  onMouseEnter={e => { if (!on) { e.currentTarget.style.background = `${colors.neon}06`; e.currentTarget.style.color = colors.textSecondary; } }}
                  onMouseLeave={e => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = colors.textMuted; } }}
                >
                  {on && <div style={{ position: "absolute", left: 0, top: "18%", bottom: "18%", width: 3.5, borderRadius: 2, background: colors.neon }} />}
                  <r.icon size={20} strokeWidth={on ? 2.5 : 1.8} />
                  {!collapsed && <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", fontFamily: fontStack }}>{r.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: collapsed ? "8px 10px" : "8px 18px", flex: 1 }}>
          {!collapsed && <div style={{
            fontSize: 11, color: colors.textMuted, letterSpacing: "0.2em", fontWeight: 700,
            marginBottom: 10, paddingLeft: 6, fontFamily: fontStack,
          }}>NAVIGATION</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navSections[activeRole]?.map(s => {
              const isActive = location.pathname === s.path;
              return (
                <button key={s.key} onClick={() => navigate(s.path)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: collapsed ? "11px" : "11px 16px", borderRadius: 8,
                  background: isActive ? `${colors.teal}18` : "transparent",
                  border: "none", cursor: "pointer",
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: isActive ? colors.textPrimary : colors.textMuted, transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = `${colors.teal}0a`; e.currentTarget.style.color = colors.textSecondary; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = isActive ? `${colors.teal}18` : "transparent"; e.currentTarget.style.color = isActive ? colors.textPrimary : colors.textMuted; } }}
                >
                  <s.icon size={19} strokeWidth={isActive ? 2.2 : 1.6} />
                  {!collapsed && <span style={{ fontSize: 15, fontWeight: isActive ? 700 : 500, fontFamily: fontStack }}>{s.label}</span>}
                  {!collapsed && isActive && <ChevronRight size={15} style={{ marginLeft: "auto", opacity: 0.4 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* User */}
        <div style={{
          padding: collapsed ? "18px 10px" : "18px 18px",
          borderTop: `1px solid ${colors.border}`,
          display: "flex", alignItems: "center", gap: 12,
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.teal}, ${colors.neon})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, color: colors.bg, fontFamily: displayFont,
          }}>JD</div>
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, fontFamily: fontStack }}>Josh D.</div>
              <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, fontFamily: fontStack }}>{activeRole === 'super' ? 'Super Admin' : activeRole === 'club' ? 'Club Admin' : 'Archer'}</div>
            </div>
          )}
          {!collapsed && <LogOut size={18} color={colors.textMuted} style={{ cursor: "pointer", opacity: 0.5 }} />}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 44px 44px" }}>
        <Outlet />
      </div>
    </div>
  );
}
