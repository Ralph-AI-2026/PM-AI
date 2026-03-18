import React from 'react';
import { ArrowUpRight, Search, Bell, Building2, MapPin, Eye, Edit, ArrowRight } from 'lucide-react';

/* ═══════════════════════════════════════════
   COLOR SYSTEM — neon green / teal / dark
   ═══════════════════════════════════════════ */
export const colors = {
  // Primary accent
  neon: "#7ed957",
  neonDim: "#6bc448",
  neonGlow: "#7ed95725",
  teal: "#1a8a6e",
  tealDark: "#14705a",
  tealDeep: "#0e5947",

  // Backgrounds
  bg: "#000000",
  bgMid: "#000000",
  card: "#0a0a0a",
  cardHover: "#111111",
  surface: "#141414",

  // Borders
  border: "#1e1e1e",
  borderLight: "#2a2a2a",

  // Text
  textPrimary: "#e4efe8",
  textSecondary: "#88a898",
  textMuted: "#5a7a6a",

  // Functional
  red: "#e05555",
  amber: "#d4a645",

  // Legacy aliases (for backward compatibility with pages)
  forest: "#1a8a6e",
  forestDeep: "#e4efe8",
  forestMid: "#7ed957",
  forestLight: "#6bc448",
  sage: "#88a898",
  moss: "#5a7a6a",
  bark: "#5a7a6a",
  earth: "#88a898",
  sand: "#1e1e1e",
  sandLight: "#141414",
  sandPale: "#0a0a0a",
  gold: "#7ed957",
  goldBright: "#6bc448",
  cream: "#0a0a0a",
  charcoal: "#e4efe8",
  slate: "#5a7a6a",
  copper: "#1a8a6e",
  redAlert: "#e05555",
  greenGood: "#7ed957",
};

export const fontStack = "'Barlow', 'Helvetica Neue', sans-serif";
export const displayFont = "'Oswald', 'Impact', sans-serif";

/* ═══════════════════════════════════════════
   ARC LOGO — circle with ARC, A in teal
   ═══════════════════════════════════════════ */
export const ARCLogo = ({ size = 52, light = false }: { size?: number, light?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <circle cx="30" cy="30" r="27" stroke={colors.neon} strokeWidth="3" fill="none" />
    <text x="31" y="28" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: displayFont, fontWeight: 900, fontSize: "18px", letterSpacing: "4px" }}>
      <tspan fill={colors.teal}>A</tspan>
      <tspan fill={colors.neon}>RC</tspan>
    </text>
  </svg>
);

/* ═══════════════════════════════════════════
   TOP BAR
   ═══════════════════════════════════════════ */
export const TopBar = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "30px 0 22px",
  }}>
    <div>
      <h1 style={{
        fontSize: 38, fontWeight: 900, fontFamily: displayFont, color: colors.textPrimary,
        margin: 0, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1.1,
      }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 15, color: colors.textSecondary, margin: "6px 0 0", fontWeight: 500, fontFamily: fontStack }}>{subtitle}</p>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: colors.card, borderRadius: 8, padding: "10px 18px",
        border: `1.5px solid ${colors.border}`,
      }}>
        <Search size={17} color={colors.textMuted} strokeWidth={2.2} />
        <input placeholder="Search..." style={{
          border: "none", outline: "none", background: "transparent",
          fontSize: 15, color: colors.textPrimary, fontFamily: fontStack, width: 180, fontWeight: 500,
        }} />
      </div>
      <button style={{
        width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${colors.border}`,
        background: colors.card, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative",
      }}>
        <Bell size={19} color={colors.textMuted} strokeWidth={2.2} />
        <div style={{
          position: "absolute", top: 8, right: 9, width: 8, height: 8,
          borderRadius: "50%", background: colors.neon, border: `2px solid ${colors.card}`,
        }} />
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
export const StatCard = ({ icon: Icon, label, value, sub, trend, accent = colors.neon, ...rest }: any) => (
  <div style={{
    background: colors.card, borderRadius: 12, padding: "24px 26px", flex: 1, minWidth: 200,
    border: `1.5px solid ${colors.border}`, position: "relative", overflow: "hidden",
    transition: "all 0.2s", cursor: "default",
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${accent}15`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, background: `${accent}12`,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1.5px solid ${accent}22`,
      }}>
        <Icon size={24} color={accent} strokeWidth={2.2} />
      </div>
      {trend && (
        <div style={{
          display: "flex", alignItems: "center", gap: 3, fontSize: 14, fontWeight: 700,
          color: colors.neon, fontFamily: fontStack, background: `${colors.neon}12`,
          padding: "4px 12px", borderRadius: 6,
        }}>
          <ArrowUpRight size={15} strokeWidth={2.5} /> {trend}
        </div>
      )}
    </div>
    <div style={{
      fontSize: 12, color: colors.textMuted, fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase", marginBottom: 8, fontFamily: fontStack,
    }}>{label}</div>
    <div style={{
      fontSize: 40, fontWeight: 800, color: colors.textPrimary, fontFamily: displayFont,
      letterSpacing: "-0.01em", lineHeight: 1,
    }}>{value}</div>
    {sub && <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, fontFamily: fontStack, fontWeight: 500 }}>{sub}</div>}
  </div>
);

/* ═══════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════ */
export const SectionHeader = ({ title, subtitle, actionLabel, actionIcon: AIcon }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
    <div>
      <h3 style={{
        margin: 0, fontSize: 22, fontWeight: 800, color: colors.textPrimary,
        fontFamily: displayFont, textTransform: "uppercase", letterSpacing: "0.03em",
      }}>{title}</h3>
      {subtitle && <p style={{ margin: "4px 0 0", fontSize: 14, color: colors.textSecondary, fontFamily: fontStack, fontWeight: 500 }}>{subtitle}</p>}
    </div>
    {actionLabel && (
      <button style={{
        display: "flex", alignItems: "center", gap: 7, padding: "10px 22px",
        borderRadius: 8, border: "none",
        background: `linear-gradient(135deg, ${colors.neon}, ${colors.neonDim})`,
        fontSize: 14, fontWeight: 700, cursor: "pointer", color: colors.bg,
        fontFamily: fontStack, boxShadow: `0 4px 16px ${colors.neon}25`, transition: "all 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 24px ${colors.neon}35`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 16px ${colors.neon}25`; }}
      >
        {AIcon && <AIcon size={16} strokeWidth={2.5} />} {actionLabel}
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════
   BAR CHART
   ═══════════════════════════════════════════ */
export const MiniBar = ({ data, height = 100 }: any) => {
  const max = Math.max(...data.map((d: any) => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
      {data.map((d: any, i: number) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, fontFamily: fontStack }}>
            {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
          </div>
          <div style={{
            width: "100%", maxWidth: 36,
            height: `${(d.value / max) * height * 0.75}px`,
            background: `linear-gradient(180deg, ${colors.neon}, ${colors.teal})`,
            borderRadius: "4px 4px 2px 2px",
          }} />
          <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 700, fontFamily: fontStack }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   CARD
   ═══════════════════════════════════════════ */
export const Card = ({ children, style: s = {} }: any) => (
  <div style={{
    background: colors.card, borderRadius: 12, padding: 28,
    border: `1.5px solid ${colors.border}`, ...s,
  }}>{children}</div>
);

/* ═══════════════════════════════════════════
   CLUB ROW
   ═══════════════════════════════════════════ */
export const ClubRow = ({ name, location, members, revenue, status }: any) => (
  <div style={{
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 100px 80px",
    padding: "16px 0", alignItems: "center",
    borderBottom: `1px solid ${colors.border}`,
    fontSize: 15,
    transition: "background 0.1s",
  }}
    onMouseEnter={e => e.currentTarget.style.background = `${colors.neon}04`}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    <div style={{
      fontWeight: 700, color: colors.textPrimary, display: "flex", alignItems: "center",
      gap: 12, fontSize: 15, fontFamily: fontStack,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 8, background: `${colors.teal}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${colors.teal}25`,
      }}><Building2 size={17} color={colors.teal} strokeWidth={2} /></div>
      {name}
    </div>
    <div style={{ color: colors.textSecondary, display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontFamily: fontStack, fontWeight: 500 }}>
      <MapPin size={14} color={colors.textMuted} strokeWidth={2} /> {location}
    </div>
    <div style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, fontFamily: fontStack }}>{members}</div>
    <div style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, fontFamily: fontStack }}>{revenue}</div>
    <div>
      <span style={{
        padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700,
        background: status === "Active" ? `${colors.neon}12` : `${colors.amber}15`,
        color: status === "Active" ? colors.neon : colors.amber, fontFamily: fontStack,
      }}>{status}</span>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      <button style={{
        border: `1px solid ${colors.border}`, background: colors.surface, cursor: "pointer",
        padding: 7, borderRadius: 6, display: "flex", alignItems: "center",
      }}><Eye size={16} color={colors.textMuted} /></button>
      <button style={{
        border: `1px solid ${colors.border}`, background: colors.surface, cursor: "pointer",
        padding: 7, borderRadius: 6, display: "flex", alignItems: "center",
      }}><Edit size={16} color={colors.textMuted} /></button>
    </div>
  </div>
);
