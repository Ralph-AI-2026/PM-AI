import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Loader2, Calendar as CalendarIcon, PieChart, Wallet, FileText } from 'lucide-react';
import { TopBar, colors, fontStack } from '../components/Shared';

interface FinancialData {
  executiveSummary: {
    grossRevenue: number;
    discountsAndComps: number;
    refundsIssued: number;
    netRevenue: number;
    taxesCollected: number;
    totalCashCollected: number;
  };
  revenueByCategory: {
    recurringMemberships: number;
    singleSessionsAndDropIns: number;
    retailAndFoodBeverage: number;
    penaltyFees: number;
  };
  tenderTypes: {
    creditAndDebitCards: number;
    cash: number;
  };
  liabilitiesAndReceivables: {
    tipsAndGratuities: number;
    unpaidInvoicesAndFailedAutoPays: {
      id: string;
      clientName: string;
      amount: number;
      reason: string;
      date: string;
    }[];
  };
}

export default function ClubAdminFinancials() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date range state (mocking a date picker)
  const [dateRange, setDateRange] = useState('This Month');

  useEffect(() => {
    fetchFinancials();
  }, [dateRange]);

  const fetchFinancials = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/financials/club_123');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError('Failed to load financial data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: colors.slate }}>
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: `${colors.redAlert}15`, border: `1px solid ${colors.redAlert}40`, color: colors.redAlert, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, fontFamily: fontStack }}>
        <AlertCircle size={24} />
        <p style={{ margin: 0, fontWeight: 600 }}>{error || 'No data available'}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: fontStack }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <TopBar title="Financial Dashboard" subtitle="Track revenue, liabilities, and cash flow." />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: colors.cream, border: `1px solid ${colors.sand}`, borderRadius: 12, padding: 4, boxShadow: `0 2px 8px ${colors.neon}08` }}>
          {['This Week', 'This Month', 'This Year'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: fontStack,
                background: dateRange === range ? `linear-gradient(135deg, ${colors.forestMid}, ${colors.forestLight})` : 'transparent',
                color: dateRange === range ? colors.cream : colors.earth,
                transition: 'all 0.2s',
                boxShadow: dateRange === range ? `0 2px 8px ${colors.neon}15` : 'none'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* 1. Executive Summary */}
        <div style={{ background: colors.cream, borderRadius: 16, border: `1px solid ${colors.sand}`, overflow: 'hidden', boxShadow: `0 4px 20px ${colors.neon}08` }}>
          <div style={{ padding: 24, borderBottom: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 12, background: colors.sandPale }}>
            <div style={{ width: 40, height: 40, background: `${colors.forestMid}15`, color: colors.forestMid, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>1. Executive Summary</h3>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: colors.earth, fontWeight: 500 }}>Gross Revenue</span>
              <span style={{ fontWeight: 600, color: colors.forestDeep }}>{formatCurrency(data.executiveSummary.grossRevenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: colors.redAlert }}>
              <span style={{ fontWeight: 500 }}>Discounts & Comps</span>
              <span style={{ fontWeight: 600 }}>-{formatCurrency(data.executiveSummary.discountsAndComps)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: colors.redAlert, borderBottom: `1px solid ${colors.sand}`, paddingBottom: 16 }}>
              <span style={{ fontWeight: 500 }}>Refunds Issued</span>
              <span style={{ fontWeight: 600 }}>-{formatCurrency(data.executiveSummary.refundsIssued)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18 }}>
              <span style={{ fontWeight: 700, color: colors.forestDeep }}>Net Revenue</span>
              <span style={{ fontWeight: 700, color: colors.forestMid }}>{formatCurrency(data.executiveSummary.netRevenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: colors.earth, borderBottom: `1px solid ${colors.sand}`, paddingBottom: 16 }}>
              <span style={{ fontWeight: 500 }}>Taxes Collected</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(data.executiveSummary.taxesCollected)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20, paddingTop: 8 }}>
              <span style={{ fontWeight: 700, color: colors.charcoal }}>Total Cash Collected</span>
              <span style={{ fontWeight: 700, color: colors.charcoal }}>{formatCurrency(data.executiveSummary.totalCashCollected)}</span>
            </div>
          </div>
        </div>

        {/* 2. Revenue by Category */}
        <div style={{ background: colors.cream, borderRadius: 16, border: `1px solid ${colors.sand}`, overflow: 'hidden', boxShadow: `0 4px 20px ${colors.neon}08` }}>
          <div style={{ padding: 24, borderBottom: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 12, background: colors.sandPale }}>
            <div style={{ width: 40, height: 40, background: `${colors.gold}15`, color: colors.gold, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={20} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>2. Revenue by Category</h3>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.sand}`, paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.forestMid }}></div>
                <span style={{ color: colors.earth, fontWeight: 500 }}>Recurring Memberships</span>
              </div>
              <span style={{ fontWeight: 600, color: colors.forestDeep }}>{formatCurrency(data.revenueByCategory.recurringMemberships)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.sand}`, paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.gold }}></div>
                <span style={{ color: colors.earth, fontWeight: 500 }}>Single Sessions & Drop-Ins</span>
              </div>
              <span style={{ fontWeight: 600, color: colors.forestDeep }}>{formatCurrency(data.revenueByCategory.singleSessionsAndDropIns)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.sand}`, paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.sage }}></div>
                <span style={{ color: colors.earth, fontWeight: 500 }}>Retail & Food/Beverage</span>
              </div>
              <span style={{ fontWeight: 600, color: colors.forestDeep }}>{formatCurrency(data.revenueByCategory.retailAndFoodBeverage)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.redAlert }}></div>
                <span style={{ color: colors.earth, fontWeight: 500 }}>Penalty Fees</span>
              </div>
              <span style={{ fontWeight: 600, color: colors.forestDeep }}>{formatCurrency(data.revenueByCategory.penaltyFees)}</span>
            </div>
          </div>
        </div>

        {/* 3. Tender Types */}
        <div style={{ background: colors.cream, borderRadius: 16, border: `1px solid ${colors.sand}`, overflow: 'hidden', boxShadow: `0 4px 20px ${colors.neon}08` }}>
          <div style={{ padding: 24, borderBottom: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 12, background: colors.sandPale }}>
            <div style={{ width: 40, height: 40, background: `${colors.forestLight}15`, color: colors.forestLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>3. Tender Types</h3>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: `1px solid ${colors.sand}`, borderRadius: 12, background: colors.sandLight }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: colors.cream, borderRadius: 10, color: colors.forestMid, border: `1px solid ${colors.sand}` }}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: colors.forestDeep, margin: '0 0 4px' }}>Credit & Debit Cards</p>
                  <p style={{ fontSize: 13, color: colors.earth, margin: 0 }}>Processed via Stripe</p>
                </div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep }}>{formatCurrency(data.tenderTypes.creditAndDebitCards)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: `1px solid ${colors.sand}`, borderRadius: 12, background: colors.sandLight }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: colors.cream, borderRadius: 10, color: colors.gold, border: `1px solid ${colors.sand}` }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: colors.forestDeep, margin: '0 0 4px' }}>Cash</p>
                  <p style={{ fontSize: 13, color: colors.earth, margin: 0 }}>Requires manual deposit</p>
                </div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep }}>{formatCurrency(data.tenderTypes.cash)}</span>
            </div>
          </div>
        </div>

        {/* 4. Liabilities & Accounts Receivable */}
        <div style={{ background: colors.cream, borderRadius: 16, border: `1px solid ${colors.sand}`, overflow: 'hidden', boxShadow: `0 4px 20px ${colors.neon}08` }}>
          <div style={{ padding: 24, borderBottom: `1px solid ${colors.sand}`, display: 'flex', alignItems: 'center', gap: 12, background: colors.sandPale }}>
            <div style={{ width: 40, height: 40, background: `${colors.earth}15`, color: colors.earth, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.forestDeep, margin: 0 }}>4. Liabilities & A/R</h3>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Liabilities */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: colors.earth, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Liabilities</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: `${colors.gold}10`, border: `1px solid ${colors.gold}30`, borderRadius: 12 }}>
                <span style={{ fontWeight: 600, color: colors.charcoal }}>Tips & Gratuities (Pending Payout)</span>
                <span style={{ fontWeight: 700, color: colors.gold }}>{formatCurrency(data.liabilitiesAndReceivables.tipsAndGratuities)}</span>
              </div>
            </div>

            {/* A/R */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: colors.earth, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Accounts Receivable</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.liabilitiesAndReceivables.unpaidInvoicesAndFailedAutoPays.map(invoice => (
                  <div key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: `1px solid ${colors.sand}`, borderRadius: 12, background: colors.cream, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = colors.sandLight}
                    onMouseLeave={e => e.currentTarget.style.background = colors.cream}
                  >
                    <div>
                      <p style={{ fontWeight: 600, color: colors.forestDeep, margin: '0 0 4px' }}>{invoice.clientName}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.earth }}>
                        <span style={{ background: `${colors.redAlert}15`, color: colors.redAlert, padding: '2px 6px', borderRadius: 4, fontWeight: 600, fontSize: 11 }}>{invoice.reason}</span>
                        <span>•</span>
                        <span>{new Date(invoice.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: colors.redAlert, display: 'block', marginBottom: 4 }}>{formatCurrency(invoice.amount)}</span>
                      <button style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 600, color: colors.forestMid, cursor: 'pointer', padding: 0 }}>Resolve</button>
                    </div>
                  </div>
                ))}
                {data.liabilitiesAndReceivables.unpaidInvoicesAndFailedAutoPays.length === 0 && (
                  <p style={{ color: colors.earth, fontSize: 14, fontStyle: 'italic', margin: 0 }}>No outstanding invoices.</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
